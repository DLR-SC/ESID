// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback} from 'react';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {useExportingRegistry} from 'context/ExportContext';
import type {Content, TDocumentDefinitions, ContentImage, Column} from 'pdfmake/interfaces';

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
  const theme = useTheme();
  const {get} = useExportingRegistry();

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
        pageMargins: [30, 30, 30, 30],
        content: [],
        styles: {header: {fontSize: 18, bold: true, margin: [0, 0, 0, 10]}},
      };

      (doc.content as Content[]).push({text: t('export.header'), style: 'header'});

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

      //   (doc.content as ContentTable[]).push({
      //     table: {
      //       body: [
      //         [{text: 'Line Chart Data'}, {text: 'Line Chart Data'}],
      //         [{text: 'Line Chart Data'}, {text: 'Line Chart Data'}],
      //       ],
      //     },
      //   });

      const columns: Column[] = [
        {
          text: 'Line Chart Data',
        },
        {
          text: 'Map Data',
        },
      ];

      (doc.content as Content[]).push({
        columns: columns,
        columnGap: 10,
      });

      const pdfmake = pdfMake as {createPdf?: (doc: unknown) => {download: (name: string) => void}};
      pdfmake?.createPdf?.(doc)?.download('ESID-export.pdf');
    })();
  }, [get, t]);

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
