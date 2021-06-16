import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import {useTranslation} from 'react-i18next';
import {makeStyles, Typography} from '@material-ui/core';

/** This interface describes the props of the AccessibilityDialog component. */
export interface AccessibilityDialogProps {
  /** Controls if the dialog is open or closed. */
  open: boolean;

  /** A callback to notify the parent component, that the dialog was requested to be closed. */
  onClose: (event: MouseEvent) => void;
}

const useStyles = makeStyles({
  dialogStyle: {
    padding: '20px',
    background: '#f8f8f8'
  },
});

/**
 * This component displays the accessibility legal text.
 */
export default function AccessibilityDialog(props: AccessibilityDialogProps): JSX.Element {
  const {t} = useTranslation('legal');
  const classes = useStyles();

  return (
    <Dialog maxWidth="lg" fullWidth={true} open={props.open} onClose={props.onClose}>
      <div className={classes.dialogStyle}>
        <Typography variant="h3">{t('accessibility.header')}</Typography>
        {/* While it says that it is dangerous, it is fine here. Only static content is inserted. */}
        <div dangerouslySetInnerHTML={{__html: t('accessibility.content')}} />
      </div>
    </Dialog>
  );
}
