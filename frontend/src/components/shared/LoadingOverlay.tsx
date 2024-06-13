// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect} from 'react';
import Box from '@mui/material/Box';
import {helix} from 'ldrs';

/**
 * Overlays a loading indicator over the previously declared components. It is recommended to use the LoadingContainer
 * component instead, since it ensures correct ordering and layouting.
 */
export default function LoadingOverlay(props: {
  show: boolean;
  overlayColor: string;
  throbberColor: string;
}): JSX.Element {
  // register helix throbber
  useEffect(() => {
    helix.register();
  }, []);

  return props.show ? (
    <Box
      sx={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: props.overlayColor + 'E0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      <l-helix size={100} speed={2.5} color={props.throbberColor}></l-helix>
    </Box>
  ) : (
    <></>
  );
}
