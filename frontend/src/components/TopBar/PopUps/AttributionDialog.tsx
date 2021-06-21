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
  const [attributions, setAttributions] = useState<Array<DependencyData>>();
  const classes = useStyles();

  void fetch('assets/third-party-attributions.json').then(async response => {
    setAttributions(await response.json());
  });

  return (
    <Dialog maxWidth='lg' fullWidth={true} open={props.open} onClose={props.onClose}>
      <div className={classes.dialogStyle}>
        <Typography variant='h3'>{t('attribution.header')}</Typography>
        {attributions?.map(lib => {
          return (<div key={`${lib.name} ${lib.version || ''}`}>
            <hr className='solid' />
            <Typography variant='h4'>{`${lib.name} ${lib.version || ''}`}</Typography>
            {lib.authors ? (<p><strong>Author: </strong> {lib.authors}</p>) : (<div />)}
            {lib.repository ? (<p><strong>Repository: </strong> {lib.repository}</p>) : (<div />)}
            {lib.licenseText ? (<ReactMarkdown skipHtml>{lib.licenseText}</ReactMarkdown>) : (<div />)}
          </div>);
        })}
      </div>
    </Dialog>
  );
}
