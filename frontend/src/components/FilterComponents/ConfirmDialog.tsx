import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  text: string;
  onAnswer: (answer: boolean) => void;
  abortButtonText?: string;
  confirmButtonText?: string;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
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
          <Button variant='outlined' color='error' sx={{marginRight: '8px'}} onClick={() => props.onAnswer(false)}>
            {props.abortButtonText ?? 'Abort'}
          </Button>
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
