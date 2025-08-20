// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useContext, useMemo} from 'react';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {useExportingRegistry} from 'context/ExportContext';
import type {Content, TDocumentDefinitions, ContentImage, Column, ContentTable} from 'pdfmake/interfaces';
import {DataContext} from 'context/SelectedDataContext';
import {useAppSelector} from 'store/hooks';

const toDataUrl = (img: unknown): string | undefined => {
  if (!img) return undefined;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img !== null && 'data' in (img as Record<string, unknown>)) {
    const d = (img as Record<string, unknown>).data;
    return typeof d === 'string' ? d : undefined;
  }
  return undefined;
};

export default function ExportDialog(): JSX.Element {
  const {t} = useTranslation();
  const {t: tBackend, i18n: i18nBackend} = useTranslation('backend');
  const theme = useTheme();
  const {get} = useExportingRegistry();
  const {compartments, referenceDateValues, scenarioCardData} = useContext(DataContext)!;

  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);

  const compartmentNames = useMemo(() => {
    return (
      compartments?.map((compartment) => {
        const name = i18nBackend.exists(`infection-states.${compartment.name}`, {ns: 'backend'})
          ? tBackend(`infection-states.${compartment.name}`)
          : compartment.name;

        return {id: compartment.id, name};
      }) ?? []
    );
  }, [compartments, i18nBackend, tBackend]);

  const compartmentValues = useMemo(() => {
    const result: Record<string, number> = {};
    referenceDateValues?.forEach((referenceDate) => {
      const key = i18nBackend.exists(`infection-states.${referenceDate.compartment}`, {ns: 'backend'})
        ? tBackend(`infection-states.${referenceDate.compartment}`)
        : referenceDate.compartment!;

      result[key] = referenceDate.value;
    });
    return result;
  }, [i18nBackend, referenceDateValues, tBackend]);

  const selectedScenarioName = useMemo(() => {
    return scenariosState[selectedScenario ?? '']?.name ?? '';
  }, [selectedScenario, scenariosState]);

  const selectedDistrictName = useMemo(() => {
    return selectedDistrict.name === '00000' ? t('germany') : t(`${selectedDistrict.name}`);
  }, [selectedDistrict, t]);

  const cardValues = useMemo(() => {
    const result: Record<string, Record<string, number | null>> = {};
    Object.keys(scenariosState).forEach((id) => {
      result[id] = {};
      compartmentNames.forEach((c) => (result[id][c.id] = null));
    });

    Object.entries(scenarioCardData ?? {}).forEach(([id, infectionData]) => {
      infectionData.forEach((entry) => {
        if (entry.compartment) {
          result[id][entry.compartment] = entry.value;
        }
      });
    });
    return result;
  }, [compartmentNames, scenarioCardData, scenariosState]);

  const handleExport = useCallback(() => {
    void (async () => {
      const lineExp = get('lineChart');
      const mapExp = get('map');

      const pdfMake =
        (await (lineExp as unknown as {getPDFMake?: () => Promise<unknown>})?.getPDFMake?.()) ||
        (await (lineExp as unknown as {getPdfmake?: () => Promise<unknown>})?.getPdfmake?.()) ||
        (await (mapExp as unknown as {getPDFMake?: () => Promise<unknown>})?.getPDFMake?.()) ||
        (await (mapExp as unknown as {getPdfmake?: () => Promise<unknown>})?.getPdfmake?.());

      const [lineImg, mapImg] = await Promise.all([lineExp?.export?.('png'), mapExp?.export?.('png')]);

      const lineDataUrl = toDataUrl(lineImg);
      const mapDataUrl = toDataUrl(mapImg);

      /**
       * More information how to work with pdfmake to create a pdf: https://pdfmake.github.io/docs/0.1/document-definition-object/
       */
      const doc: TDocumentDefinitions = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [10, 10, 10, 10],
        content: [],
        styles: {header: {fontSize: 18, bold: true, margin: [0, 0, 0, 10]}},
      };

      (doc.content as Content[]).push({text: t('export.header'), style: 'header'});

      const columns: Column[] = [
        [
          {
            text: 'Selected District',
            fontSize: 14,
          },
          {
            text: selectedDistrictName,
            fontSize: 10,
          },
        ],
        [
          {
            text: 'Selected Scenario',
            fontSize: 14,
          },
          {
            text: selectedScenarioName ?? '',
            fontSize: 10,
          },
        ],
      ];

      (doc.content as Content[]).push({
        columns: columns,
        columnGap: 10,
        margin: [0, 0, 0, 10],
      });

      if (lineDataUrl) {
        (doc.content as ContentImage[]).push({
          image: lineDataUrl,
          width: 500,
        });
      }

      if (mapDataUrl) {
        (doc.content as ContentImage[]).push({
          image: mapDataUrl,
          fit: [300, 300],
        });
      }

      // add each compartment name to the table
      const tableBody = [
        [
          {
            text: ' ',
            fontSize: 14,
          },
          {
            text: 'Reference Date',
            fontSize: 12,
          },
          {
            text: 'Selected Date',
            fontSize: 12,
          },
        ],
        [
          {
            text: ' ',
            fontSize: 10,
          },
          {
            text: referenceDay ?? '',
            fontSize: 10,
          },
          {
            text: selectedDate ?? '',
            fontSize: 10,
          },
        ],
        [
          {text: 'Compartment', bold: true, fontSize: 10},
          {text: 'Value', bold: true, fontSize: 10, colSpan: 2},
        ],
      ];

      for (const compartment of compartmentNames) {
        tableBody.push([
          {text: compartment.name, fontSize: 10},
          {text: compartmentValues[compartment.id].toString(), fontSize: 10},
          {text: cardValues[selectedScenario ?? '']?.[compartment.id]?.toString() ?? '', fontSize: 10},
        ]);
      }

      (doc.content as ContentTable[]).push({
        layout: 'lightHorizontalLines', // optional
        table: {
          headerRows: 3,
          body: tableBody,
        },
      });

      const pdfmake = pdfMake as {createPdf?: (doc: unknown) => {download: (name: string) => void}};
      pdfmake?.createPdf?.(doc)?.download('ESID-export.pdf');
    })();
  }, [
    get,
    t,
    compartmentNames,
    compartmentValues,
    selectedScenarioName,
    selectedDistrictName,
    referenceDay,
    cardValues,
    selectedScenario,
    selectedDate,
  ]);

  return (
    <Box
      sx={{
        padding: theme.spacing(4),
        background: theme.palette.background.paper,
      }}
    >
      <Typography variant='h3'>{t('export.header')}</Typography>
      <br />
      <Typography>{t('export.description')}</Typography>
      <br />
      <Button variant='contained' color='primary' onClick={handleExport}>
        {t('export.button')}
      </Button>
    </Box>
  );
}
