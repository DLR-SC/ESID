// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Box from '@mui/material/Box';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import {Trans} from 'react-i18next/TransWithoutContext';

interface SlideProps {
  /** the current step of the dialog */
  step: number;

  /** the title of the slide */
  title: string;

  /** the content of the slide */
  content: string;

  /** the image source for the slide */
  imageSrc: string;
}

/**
 * This component represents a slide in the welcome modal
 */
export default function Slide({step, title, content, imageSrc}: SlideProps): JSX.Element {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          height: '180px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={imageSrc}
          alt={`Illustration ${step + 1}`}
          style={{
            maxWidth: '85%',
            maxHeight: '85%',
            objectFit: 'cover',
          }}
        />
      </Box>
      <DialogTitle
        sx={{
          paddingBottom: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            height: '100%',
            minHeight: '70px',
          }}
        >
          <Typography
            variant='h1'
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: theme.typography.h1.fontWeight,
              textAlign: 'center',
              fontSize: theme.typography.h1.fontSize,
            }}
          >
            <Trans> {title}</Trans>
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '450px',
          maxHeight: '200px',
          margin: '0 auto',
          overflow: 'hidden',
          flexGrow: 1,
        }}
      >
        <Typography
          variant='body1'
          paragraph
          sx={{
            fontSize: theme.typography.h2.fontSize,
            lineHeight: theme.typography.body1.lineHeight,
            fontWeight: theme.typography.body1.fontWeight,
          }}
        >
          <Trans> {content}</Trans>
        </Typography>
      </DialogContent>
    </>
  );
}
