// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {Dialog, DialogTitle, DialogContent, DialogContentText, IconButton, Typography, Box} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {SearchResult} from 'types/semanticSearch';

interface ArticleDialogProps {
  open: boolean;
  onClose: () => void;
  article: SearchResult | null;
}

/**
 * A dialog component to display the full content of a selected search result article.
 */
export default function ArticleDialog({open, onClose, article}: ArticleDialogProps): JSX.Element {
  if (!article) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth scroll='paper'>
      <DialogTitle sx={{m: 0, p: 2}}>
        <Typography variant='h2'>{article.title}</Typography>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant='caption' color='text.secondary'>
            Author: {article.author || 'N/A'} | Published: {article.year_published || 'N/A'}
          </Typography>
        </Box>
        <DialogContentText component='div'>
          <Typography paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur.
          </Typography>
          <Typography paragraph>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
            laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
            explicabo.
          </Typography>
          <Typography paragraph>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
            dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
            sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore
            magnam aliquam quaerat voluptatem.
          </Typography>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
