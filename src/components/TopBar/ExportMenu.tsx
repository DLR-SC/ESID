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

const esidLogoSvg = `
<svg width="200" height="66" viewBox="0 0 200 66" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.125" y="17.4988" width="20.0083" height="30.0125" fill="#EBA73B"/>
<rect x="6.79395" y="22.501" width="20.0083" height="30.0125" fill="#3998DB"/>
<path d="M51.7475 52.8252V12.8085H78.7119V19.7841H60.2081V29.3193H77.3246V36.2949H60.2081V45.8496H78.7901V52.8252H51.7475ZM107.147 24.3172C106.99 22.741 106.319 21.5166 105.134 20.6438C103.949 19.771 102.34 19.3347 100.308 19.3347C98.927 19.3347 97.7612 19.5301 96.8103 19.9209C95.8594 20.2986 95.1299 20.8262 94.6219 21.5035C94.1269 22.1809 93.8794 22.9495 93.8794 23.8092C93.8533 24.5256 94.0031 25.1509 94.3288 25.685C94.6675 26.219 95.1299 26.6815 95.7161 27.0723C96.3023 27.45 96.9796 27.7822 97.7482 28.0688C98.5167 28.3423 99.3374 28.5768 100.21 28.7722L103.805 29.6319C105.551 30.0227 107.153 30.5438 108.612 31.1951C110.071 31.8464 111.335 32.6475 112.403 33.5984C113.471 34.5493 114.298 35.6696 114.884 36.9592C115.483 38.2488 115.79 39.7273 115.803 41.3946C115.79 43.8436 115.164 45.9669 113.927 47.7645C112.702 49.5491 110.931 50.9364 108.612 51.9264C106.306 52.9034 103.525 53.3918 100.269 53.3918C97.0382 53.3918 94.2246 52.8968 91.8277 51.9068C89.4439 50.9168 87.5812 49.4514 86.2395 47.5105C84.9108 45.5565 84.2139 43.1402 84.1487 40.2614H92.3358C92.4269 41.6031 92.8112 42.7233 93.4886 43.6221C94.179 44.5079 95.0973 45.1788 96.2436 45.6347C97.403 46.0776 98.7121 46.299 100.171 46.299C101.604 46.299 102.848 46.0906 103.903 45.6738C104.971 45.2569 105.798 44.6773 106.385 43.9348C106.971 43.1923 107.264 42.3391 107.264 41.3751C107.264 40.4763 106.997 39.7208 106.463 39.1085C105.942 38.4963 105.173 37.9753 104.157 37.5454C103.154 37.1155 101.923 36.7247 100.464 36.373L96.1069 35.2788C92.7331 34.4582 90.0692 33.1751 88.1152 31.4296C86.1613 29.684 85.1908 27.3328 85.2039 24.3758C85.1908 21.9529 85.8356 19.8362 87.1383 18.0255C88.4539 16.2149 90.2581 14.8015 92.5507 13.7855C94.8433 12.7694 97.4486 12.2614 100.366 12.2614C103.336 12.2614 105.929 12.7694 108.143 13.7855C110.371 14.8015 112.103 16.2149 113.341 18.0255C114.578 19.8362 115.216 21.9334 115.255 24.3172H107.147ZM129.954 12.8085V52.8252H121.493V12.8085H129.954ZM151.1 52.8252H136.915V12.8085H151.218C155.243 12.8085 158.708 13.6096 161.613 15.2119C164.518 16.8011 166.752 19.0872 168.315 22.0702C169.891 25.0532 170.679 28.6224 170.679 32.7778C170.679 36.9462 169.891 40.5284 168.315 43.5244C166.752 46.5205 164.505 48.8196 161.574 50.4218C158.656 52.0241 155.165 52.8252 151.1 52.8252ZM145.375 45.5761H150.749C153.25 45.5761 155.354 45.1332 157.06 44.2474C158.779 43.3486 160.069 41.9613 160.929 40.0855C161.802 38.1967 162.238 35.7608 162.238 32.7778C162.238 29.8208 161.802 27.4044 160.929 25.5287C160.069 23.6529 158.786 22.2721 157.08 21.3863C155.373 20.5005 153.269 20.0576 150.768 20.0576H145.375V45.5761Z" fill="#333B4E"/>
<rect x="18.4658" y="12.4966" width="20.0083" height="30.0125" fill="#543CF0"/>
</svg`;

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
        svg: esidLogoSvg,
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
