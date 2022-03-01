import React from 'react';
import {Box, CircularProgress} from '@mui/material';

export default function LoadingOverlay(props: {show: boolean; backgroundColor: string}): JSX.Element {
  return props.show ? (
    <Box
      sx={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: props.backgroundColor + 'E0',
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
