// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React from 'react';

export interface AlertDialogProps {
  /** Whether the dialog should be open or not. */
  open: boolean;

  /** The title of the dialog. */
  title: string;

  /** The text to be displayed in the dialog. */
  text: string;

  /**
   * A callback function that is called when the user provides an answer.
   * @param answer `true` for confirming, `false` for aborting.
   */
  onAnswer: (answer: boolean) => void;

  /** The text to be displayed on the confirm button. */
  confirmButtonText?: string;
}

export default function AlertDialog(props: AlertDialogProps) {
  return (
    <Dialog open={props.open} sx={{backdropFilter: 'none'}}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '26px',
        }}
      >
        <Typography variant='h2'>{props.title}</Typography>
        <Divider orientation='horizontal' flexItem />
        <Typography variant='body1' sx={{paddingY: '12px'}}>
          {props.text}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant='outlined'
            color='primary'
            onClick={() => {
              props.onAnswer(true);
            }}
          >
            {props.confirmButtonText ?? 'Confirm'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
