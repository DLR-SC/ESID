import React, {useState} from 'react';

import {useTranslation} from 'react-i18next';
import {CircularProgress, Grid, makeStyles, Typography} from '@material-ui/core';
import ReactMarkdown from 'react-markdown';
import LazyLoad from 'react-lazyload';

interface DependencyData {
  name: string;
  version: string | null;
  authors: string | null;
  repository: string | null;
  license: string | null;
  licenseText: string | null;
}

const useStyles = makeStyles({
  dialogStyle: {
    padding: '20px',
    background: '#f8f8f8',
  },
});

let ATTRIBUTIONS_CACHE: Array<string> | null = null;

/**
 * This component displays third-party attributions.
 */
export default function AttributionDialog(): JSX.Element {
  const {t} = useTranslation('legal');
  const [attributions, setAttributions] = useState(ATTRIBUTIONS_CACHE);
  const classes = useStyles();

  // The data should be fetched only once, since it is really slow.
  if (ATTRIBUTIONS_CACHE === null) {
    void fetch('assets/third-party-attributions.json').then(async response => {
      const json = await response.json() as (Array<DependencyData>);

      // We prebuild a single markdown string. It is more performant to have one markdown renderer render all text at
      // once than having hundreds of markdown renderers render each entry separate.
      const list: Array<string> = [];
      json.forEach((lib: DependencyData) => {
        let tmp = '';
        tmp += '\n\n---\n\n';
        tmp += `# __${lib.name}__ ${lib.version || ''}\n`;
        if (lib.authors) {
          tmp += `__${t('attribution.authors')}:__ ${lib.authors}\n\n`;
        }
        if (lib.repository) {
          tmp += `__${t('attribution.repository')}:__ ${lib.repository}\n\n`;
        }
        if (lib.licenseText) {
          // This inserts the license text and makes every heading one level smaller, so no heading has the same size as
          // the library names.
          tmp += `${lib.licenseText.replace(/#+/g, substring => '#'.repeat(substring.length + 1))}\n\n`;
        }
        list.push(tmp);
      });
      ATTRIBUTIONS_CACHE = list;
      setAttributions(ATTRIBUTIONS_CACHE);
    });
  }

  function LoadingCircle(): JSX.Element {
    return <Grid container direction='row' alignItems='center' justify='center'>
      <CircularProgress disableShrink />
    </Grid>;
  }

  function AttributionList(props: {attrib: Array<string>}): JSX.Element {
    return <>
      {props.attrib.map((a: string, i) => <LazyLoad key={i}><ReactMarkdown>{a}</ReactMarkdown></LazyLoad>)}
    </>;
  }

  return (
    <div className={classes.dialogStyle}>
      <Typography variant='h3'>{t('attribution.header')}</Typography>
      <br />
      <Typography><i>{t('attribution.thank-you-text')}</i></Typography>
      <br />
      {attributions === null ? <LoadingCircle /> : <AttributionList attrib={attributions} />}
    </div>
  );
}
