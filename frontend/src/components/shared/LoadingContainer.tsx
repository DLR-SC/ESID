import React from 'react';
import {Box, SxProps} from '@mui/material';
import LoadingOverlay from './LoadingOverlay';

export default function LoadingContainer(props: LoadingContainerProps): JSX.Element {
  return (
    <Box sx={{...props.sx, position: 'relative'}}>
      {props.children}
      <LoadingOverlay show={props.show} backgroundColor={props.backgroundColor} />
    </Box>
  );
}

interface LoadingContainerProps {
  sx?: SxProps;
  show: boolean;
  backgroundColor: string;
  children: React.ReactNode;
}
