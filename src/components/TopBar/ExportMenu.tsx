// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useContext, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import {useExportingRegistry} from 'context/ExportContext';
import {NumberFormatter} from 'util/hooks';
import i18n from 'util/i18n';
import {
  Content,
  TDocumentDefinitions,
  ContentImage,
  ContentTable,
  TableLayout,
  ContentText,
  ContentColumns,
  ContentSvg,
} from 'pdfmake/interfaces';
import {DataContext} from 'context/SelectedDataContext';
import {useAppSelector} from 'store/hooks';
import esidLogo from 'assets/logo/logo-200x66.svg?raw';

const toDataUrl = (img: unknown): string | undefined => {
  if (!img) return undefined;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img !== null && 'data' in (img as Record<string, unknown>)) {
    const d = (img as Record<string, unknown>).data;
    return typeof d === 'string' ? d : undefined;
  }
  return undefined;
};

type ExportMenuProps = {onDone?: () => void};

export default function ExportMenu({onDone}: ExportMenuProps): JSX.Element {
  const {t} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const {t: tBackend, i18n: i18nBackend} = useTranslation('backend');
  const {t: tGlobal} = useTranslation('global');
  const {get} = useExportingRegistry();
  const {compartments, referenceDateValues, scenarioCardData} = useContext(DataContext)!;

  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const languageSuffix = `-${i18nBackend.language}`;
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

  const handleExportPdf = useCallback(() => {
    onDone?.();
    void (async () => {
      const lineExp = get('lineChart');
      const mapExp = get('map');
      const legendExp = get('legend');

      const pdfMake =
        (await (lineExp as unknown as {getPDFMake?: () => Promise<unknown>})?.getPDFMake?.()) ||
        (await (lineExp as unknown as {getPdfmake?: () => Promise<unknown>})?.getPdfmake?.()) ||
        (await (mapExp as unknown as {getPDFMake?: () => Promise<unknown>})?.getPDFMake?.()) ||
        (await (mapExp as unknown as {getPdfmake?: () => Promise<unknown>})?.getPdfmake?.()) ||
        (await (legendExp as unknown as {getPDFMake?: () => Promise<unknown>})?.getPDFMake?.()) ||
        (await (legendExp as unknown as {getPdfmake?: () => Promise<unknown>})?.getPdfmake?.());

      const [lineImg, mapImg, legendImg] = await Promise.all([
        lineExp?.export?.('png'),
        mapExp?.export?.('png'),
        legendExp?.export?.('png'),
      ]);

      const lineChartDataUrl = toDataUrl(lineImg);
      const mapDataUrl = toDataUrl(mapImg);
      const mapLegendDataUrl = toDataUrl(legendImg);

      if (!lineChartDataUrl || !mapDataUrl || !mapLegendDataUrl) {
        return;
      }

      /**
       * More information how to work with pdfmake to create a pdf: https://pdfmake.github.io/docs/0.1/document-definition-object/
       */
      const nowStr = new Date().toLocaleString();

      // header and subheader
      const headerContent = {
        svg: esidLogo,
        width: 50,
        alignment: 'left',
        margin: [0, 0, 0, 0],
      } as ContentSvg;

      const subheaderContent = {
        text: `${t(selectedDistrictName)} — ${selectedScenarioName ?? ''}`,
        style: 'subheader',
      } as ContentText;

      const dateSubheader = {
        text: `${nowStr}`,
        style: 'subheader',
      } as ContentText;

      const subheaderColumns: ContentColumns = {
        columns: [
          {
            width: '50%',
            text: subheaderContent,
            alignment: 'left',
          },
          {
            width: '50%',
            text: dateSubheader,
            alignment: 'right',
          },
        ],
        margin: [0, 6, 0, 12],
      };

      const header: ContentColumns = {
        columns: [{width: '100%', stack: [headerContent, subheaderColumns]}],
        margin: [20, 20, 20, 0],
      };

      // custom footer with page column and attributions
      const footer = (currentPage: number, pageCount: number) =>
        ({
          columns: [
            {
              width: '50%',
              text: 'DLR',
              alignment: 'left',
              fontSize: 8,
              color: '#666',
              margin: [30, 0, 30, 20],
            },
            {
              width: '50%',
              text: `${currentPage} / ${pageCount}`,
              alignment: 'right',
              fontSize: 8,
              color: '#666',
              margin: [30, 0, 30, 20],
            },
          ],
        }) as ContentColumns;

      const doc: TDocumentDefinitions = {
        pageSize: 'A4', // customizable
        pageOrientation: 'portrait', // customizable
        pageMargins: [20, 70, 20, 20], // customizable
        content: [],
        header: header,
        styles: {
          header: {fontSize: 18, bold: true, margin: [0, 0, 0, 0]},
          subheader: {fontSize: 12, color: '#666', margin: [0, 0, 0, 12]},
          tableHeader: {bold: true, fontSize: 10, color: '#333'},
          tableCell: {fontSize: 10, color: '#333'},
          small: {fontSize: 8, color: '#666'},
        },
        footer: footer,
        defaultStyle: {fontSize: 11},
        info: {title: 'ESID Export', subject: 'Exported report', creator: 'DLR'},
        // watermark: {text: 'ESID Export', color: '#666', opacity: 0.1, fontSize: 100}, //we can add this if we want
      };

      const docContents = doc.content as Content[];

      // Line chart
      const lineChart = {
        image: lineChartDataUrl,
        width: 550,
        alignment: 'left',
        margin: [0, 0, 0, 0],
      } as ContentImage;

      const lineChartText = {
        text: t('export.images.line-chart-label'),
        style: 'small',
        alignment: 'left',
        margin: [0, 6, 0, 12],
      } as ContentText;

      docContents.push(lineChart, lineChartText);

      // Info table with selected district, scenario, reference date and selected date
      const infoTable: ContentTable = {
        table: {
          widths: ['*', 'auto', '*', 'auto'],
          body: [
            [
              {text: tGlobal('export.info.selected-district'), style: 'tableHeader'},
              {text: selectedDistrictName, style: 'tableCell'},
              {text: tGlobal('export.info.selected-scenario'), style: 'tableHeader'},
              {text: selectedScenarioName ?? '', style: 'tableCell'},
            ],
            [
              {text: tGlobal('export.info.reference-date'), style: 'tableHeader'},
              {text: referenceDay ?? '', style: 'tableCell'},
              {text: tGlobal('export.info.selected-date'), style: 'tableHeader'},
              {text: selectedDate ?? '', style: 'tableCell'},
            ],
          ],
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f5f5f5' : null),
          hLineColor: '#e0e0e0',
          vLineColor: '#e0e0e0',
        } as TableLayout,
        margin: [0, 0, 0, 12],
      };

      const mapWidth = 200;

      const map = {
        image: mapDataUrl,
        width: mapWidth,
        alignment: 'left' as const,
        margin: [0, 0, 0, 0],
      } as ContentImage;

      const mapLegend = {
        image: mapLegendDataUrl,
        width: mapWidth,
        alignment: 'left' as const,
        margin: [0, 0, 0, 0],
      } as ContentImage;

      const mapText = {
        text: t('export.images.map-label'),
        style: 'small',
        alignment: 'left',
        margin: [0, 6, 0, 0],
      } as ContentText;

      // Compartment table with compartment name, reference value and selected value
      const tableBody = [
        [
          {text: tGlobal('export.table.compartment'), style: 'tableHeader'},
          {text: tGlobal('export.table.reference-value'), style: 'tableHeader', alignment: 'right'},
          {text: tGlobal('export.table.selected-value'), style: 'tableHeader', alignment: 'right'},
        ],
      ];

      for (const compartment of compartmentNames) {
        tableBody.push([
          {text: compartment.name, style: 'tableCell'},
          {
            text: formatNumber(compartmentValues[compartment.id] ?? 0),
            style: 'tableCell',
            alignment: 'right',
          },
          {
            text: formatNumber(cardValues[selectedScenario ?? '']?.[compartment.id] ?? 0),
            style: 'tableCell',
            alignment: 'right',
          },
        ]);
      }

      // Compartment table layout
      const zebraLayout: TableLayout = {
        fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f5f5f5' : rowIndex % 2 === 0 ? '#fafafa' : null),
        hLineColor: '#e0e0e0',
        vLineColor: '#e0e0e0',
      };

      const numbersTable: ContentTable = {
        layout: zebraLayout,
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: tableBody,
        },
        margin: [0, 0, 0, 4],
      };

      const mapInfoColumn: ContentColumns = {
        alignment: 'left',
        columns: [
          {
            width: '40%',
            stack: [map, mapLegend, mapText],
          },
          {
            width: '60%',
            stack: [infoTable, numbersTable],
          },
        ],
      };

      docContents.push(mapInfoColumn);

      // Download the pdf
      const pdfmake = pdfMake as {createPdf?: (doc: unknown) => {download: (name: string) => void}};
      pdfmake?.createPdf?.(doc)?.download(`ESID-export${languageSuffix}.pdf`);
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
    languageSuffix,
    formatNumber,
    tGlobal,
    onDone,
  ]);

  const handleExportCsv = useCallback(() => {
    onDone?.();
  }, [onDone]);

  return (
    <>
      <MenuItem onClick={handleExportPdf}>PDF</MenuItem>
      <MenuItem onClick={handleExportCsv} disabled>
        CSV
      </MenuItem>
    </>
  );
}
