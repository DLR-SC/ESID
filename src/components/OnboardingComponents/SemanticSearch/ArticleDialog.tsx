// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Button, CircularProgress} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {SearchResult} from 'types/semanticSearch';
import {Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface ArticleDialogProps {
  open: boolean;
  onClose: () => void;
  article: SearchResult | null;
}

/**
 * A dialog component to display the full content of a selected search result article.
 */
export default function ArticleDialog({open, onClose, article}: ArticleDialogProps): JSX.Element {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);

  if (!article) {
    return <></>;
  }

  function onDocumentLoadSuccess({numPages: nextNumPages}: {numPages: number}) {
    setNumPages(nextNumPages);
  }

  function goToNextPage() {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages));
  }

  function goToPreviousPage() {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth scroll='paper'>
      <DialogTitle sx={{m: 0, p: 6, pb: 5}}>
        <Typography variant='h2' sx={{pr: '2rem'}}>
          {article.title}
        </Typography>
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
      <DialogContent dividers sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1}}>
        <Document
          file={article.hyperlink}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<CircularProgress />}
          error='Failed to load PDF file.'
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </DialogContent>
      <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, gap: 2}}>
        <Button onClick={goToPreviousPage} disabled={pageNumber <= 1}>
          Previous
        </Button>
        <Typography>
          Page {pageNumber} of {numPages}
        </Typography>
        <Button onClick={goToNextPage} disabled={pageNumber >= numPages}>
          Next
        </Button>
      </Box>
    </Dialog>
  );
}
