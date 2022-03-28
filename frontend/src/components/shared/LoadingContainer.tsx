import React from 'react';
import {Box, SxProps} from '@mui/material';
import LoadingOverlay from './LoadingOverlay';

/**
 * This is a wrapper component for a container that can have a loading indicator overlayed.
 */
export default function LoadingContainer(props: LoadingContainerProps): JSX.Element {
  return (
    <Box sx={{...props.sx, position: 'relative'}}>
      {props.children}
      <LoadingOverlay show={props.show} backgroundColor={props.backgroundColor} />
    </Box>
  );
}

interface LoadingContainerProps {
  /** The sx styling props. */
  sx?: SxProps;

  /** Shows the loading indicator, if true. */
  show: boolean;

  /** Set's the color of the overlay. */
  backgroundColor: string;

  /** React prop to allow nesting components. Do not set manually. */
  children: React.ReactNode;
}
