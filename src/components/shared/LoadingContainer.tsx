// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Box from '@mui/material/Box';
import LoadingOverlay from './LoadingOverlay';
import {SxProps} from '@mui/system';

/**
 * This is a wrapper component for a container that can have a loading indicator overlayed.
 */
export default function LoadingContainer(props: LoadingContainerProps): JSX.Element {
  return (
    <Box sx={{...props.sx, position: 'relative'}}>
      {props.children}
      <LoadingOverlay show={props.show} overlayColor={props.overlayColor} />
    </Box>
  );
}

interface LoadingContainerProps {
  /** The sx styling props. */
  sx?: SxProps;

  /** Shows the loading indicator, if true. */
  show: boolean;

  /** The color of the overlay. */
  overlayColor: string;

  /** React prop to allow nesting components. Do not set manually. */
  children: React.ReactNode;
}
