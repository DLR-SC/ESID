import React, {useState} from 'react';

import Dialog from '@material-ui/core/Dialog';
import {useTranslation} from 'react-i18next';
import {makeStyles, Typography} from '@material-ui/core';
import ReactMarkdown from 'react-markdown';

/** This interface describes the props of the AttributionDialog component. */
export interface AttributionDialogProps {
  /** Controls if the dialog is open or closed. */
  open: boolean;

  /** A callback to notify the parent component, that the dialog was requested to be closed. */
  onClose: (event: MouseEvent) => void;
}

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

/**
 * This component displays third-party attributions.
 */
export default function AttributionDialog(props: AttributionDialogProps): JSX.Element {
  const {t} = useTranslation('legal');
  const [attributions, setAttributions] = useState('');
  const classes = useStyles();

  // The data should be fetched only once, since it is really slow.
  if (attributions === '') {
    void fetch('assets/third-party-attributions.json').then(async response => {
      const json = await response.json() as (Array<DependencyData>);

      // We prebuild a single markdown string. It is more performant to have one markdown renderer render all text at
      // once than having hundreds of markdown renderers render each entry separate.
      let tmp = '';
      json.forEach((lib: DependencyData) => {
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
      });
      setAttributions(tmp);
    });
  }

  return (
    <Dialog maxWidth='lg' fullWidth={true} open={props.open} onClose={props.onClose}>
      <div className={classes.dialogStyle}>
        <Typography variant='h3'>{t('attribution.header')}</Typography>
        <br />
        <Typography><i>{t('attribution.thank-you-text')}</i></Typography>
        <br />
        <ReactMarkdown>{attributions}</ReactMarkdown>
      </div>
    </Dialog>
  );
}
