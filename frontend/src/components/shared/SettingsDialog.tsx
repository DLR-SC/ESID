import React, {useState} from 'react';
import {useTheme} from '@mui/material/styles';
import {Button, Dialog} from '@mui/material';
import ConfirmDialog from './ConfirmDialog';

export interface SettingsDialogProps {
  open: boolean;
  closeCallback: () => void;
  children?: JSX.Element;
}

export function SettingsDialogParent(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const closeFn = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} />
      <SettingsDialog
        open = {open}
        closeCallback = {closeFn}
      />
    </>
  )
}

export default function SettingsDialog(props: SettingsDialogProps): JSX.Element {
  const theme = useTheme;

  const [settingsDialogOpen, setSettingsDialogOpen] = useState<boolean>(false);
  const [settingsDialogChanged, setSettingsDialogChanged] = useState<boolean>(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState<boolean>(false);



  return (
    <>
      <Dialog
        maxWidth='lg'
        fullWidth={true}
        open={settingsDialogOpen}
      >
        {/* Fill dialog with child elements */}
        {props.children}
      </Dialog>
      <ConfirmDialog
        open={closeDialogOpen}
        title={'settings-dialog.confirm-discard-title'}
        text={'settings-dialog.confirm-discard-text'}
        abortButtonText={'settings-dialog.close'}
        confirmButtonText={'settings-dialog.discard'}
        onAnswer={(answer) => {
          if (answer) {
            // Close settings and discard changes
            setSettingsDialogOpen(false);
          }
          // Close Confirm Dialog regardless of answers
          setCloseDialogOpen(false)
        }}
      />
    </>
  );
}
