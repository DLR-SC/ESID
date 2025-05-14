// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import LazyLoad from 'react-lazyload';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import attributionData from '../../../../assets/third-party-attributions.json?url';

interface DependencyData {
  name: string;
  version: string | null;
  authors: string | null;
  repository: string | null;
  license: string | null;
  licenseText: string | null;
}

let ATTRIBUTIONS_CACHE: Array<string> | null = null;

/**
 * This component displays third-party attributions.
 */
export default function AttributionDialog(): JSX.Element {
  const {t} = useTranslation('legal');
  const theme = useTheme();
  const [attributions, setAttributions] = useState(ATTRIBUTIONS_CACHE);

  useEffect(() => {
    // The data should be fetched only once, since it is really slow.
    if (ATTRIBUTIONS_CACHE === null) {
      void fetch(attributionData).then(async (response) => {
        const json = (await response.json()) as Array<DependencyData>;

        // For each library we create a markdown string.
        ATTRIBUTIONS_CACHE = json.map((lib: DependencyData) => {
          let tmp = '';
          tmp += '\n\n---\n\n';
          tmp += `# __${lib.name}__ ${lib.version ?? ''}\n`;
          if (lib.authors) {
            tmp += `__${t('attribution.authors')}:__ ${lib.authors}\n\n`;
          }
          if (lib.repository) {
            tmp += `__${t('attribution.repository')}:__ ${lib.repository}\n\n`;
          }
          if (lib.licenseText) {
            // This inserts the license text and makes every heading one level smaller, so no heading has the same size as
            // the library names.
            tmp += `${lib.licenseText.replace(/#+/g, (substring) => '#'.repeat(substring.length + 1))}\n\n`;
          }
          return tmp;
        });
        setAttributions(ATTRIBUTIONS_CACHE);
      });
    }
  });

  /** A loading circle that is displayed while the attributions are downloaded. */
  function LoadingCircle(): JSX.Element {
    return (
      <Grid container direction='row' alignItems='center' justifyContent='center'>
        <CircularProgress disableShrink />
      </Grid>
    );
  }

  /** The main content of the dialog containing all attributions. They are loaded lazily. */
  function AttributionList(props: {attrib: Array<string>}): JSX.Element {
    return (
      <>
        {props.attrib.map((a: string, i) => (
          <LazyLoad key={i}>
            <ReactMarkdown>{a}</ReactMarkdown>
          </LazyLoad>
        ))}
      </>
    );
  }

  return (
    <Box
      sx={{
        padding: theme.spacing(4),
        background: theme.palette.background.paper,
      }}
    >
      <Typography variant='h3'>{t('attribution.header')}</Typography>
      <br />
      <Typography>
        <i>{t('attribution.thank-you-text')}</i>
      </Typography>
      <br />
      {attributions === null ? <LoadingCircle /> : <AttributionList attrib={attributions} />}
    </Box>
  );
}
