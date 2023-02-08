import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  text: string;
  onAnswer: (answer: boolean) => void;

  abortButtonText?: string;
  confirmButtonText?: string;
}

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
            {props.abortButtonText || 'Abort'}
          </Button>
          <Button variant='outlined' color='primary' onClick={() => props.onAnswer(true)}>
            {props.confirmButtonText || 'Confirm'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
