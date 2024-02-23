// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Overlays a loading indicator over the previously declared components. It is recommended to use the LoadingContainer
 * component instead, since it ensures correct ordering and layouting.
 */
export default function LoadingOverlay(props: {show: boolean; overlayColor: string}): JSX.Element {
  return props.show ? (
    <Box
      sx={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: props.overlayColor + 'E0',
      }}
    >
      <CircularProgress
        size={96}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: '-48px',
          marginLeft: '-48px',
        }}
      />
    </Box>
  ) : (
    <></>
  );
}
