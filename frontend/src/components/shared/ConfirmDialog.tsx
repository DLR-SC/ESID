// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';

export interface ConfirmDialogProps {
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

  /** The text to be displayed on the abort button. */
  abortButtonText?: string;

  /** The text to be displayed on the confirm button. */
  confirmButtonText?: string;
}

/**
 * A component that displays a confirmation dialog.
 * @param props The properties for the component.
 *
 * @example
 * ```js
 *   function ExampleComponent() {
 *     // State to keep track of whether the dialog should be open or not.
 *     const [open, setOpen] = useState(false);
 *
 *     // Function to handle the user's answer.
 *     const handleAnswer = (answer: boolean) => {
 *       console.log(`The user answered ${answer ? 'yes' : 'no'}.`);
 *       setOpen(false);
 *     };
 *
 *     return (
 *       <div>
 *         <button onClick={() => setOpen(true)}>Open Confirm Dialog</button>
 *         <ConfirmDialog
 *           open={open}
 *           title='Confirm Action'
 *           text='Are you sure you want to perform this action?'
 *           onAnswer={handleAnswer}
 *           abortButtonText='Cancel'
 *           confirmButtonText='Yes, I am sure'
 *         />
 *       </div>
 *     );
 *   }
 * ```
 */
export default function ConfirmDialog(props: ConfirmDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <Dialog open={props.open} sx={{backdropFilter: 'none'}}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: theme.spacing(4),
        }}
      >
        <Typography variant='h2'>{props.title}</Typography>
        <Divider orientation='horizontal' flexItem />
        <Typography variant='body1' sx={{paddingY: theme.spacing(3)}}>
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
            color='error'
            sx={{marginRight: theme.spacing(2)}}
            onClick={() => props.onAnswer(false)}
          >
            {props.abortButtonText ?? 'Abort'}
          </Button>
          <Button variant='outlined' color='primary' onClick={() => props.onAnswer(true)}>
            {props.confirmButtonText ?? 'Confirm'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
