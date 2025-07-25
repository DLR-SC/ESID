// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
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
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries.at(0);
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages));
  }, [numPages]);

  const goToPreviousPage = useCallback(() => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.25, 0.25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  // Keyboard shortcuts for zoom and navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case '+':
        case '=':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomOut();
          }
          break;
        case '0':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomReset();
          }
          break;
        case 'ArrowLeft':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            goToPreviousPage();
          }
          break;
        case 'ArrowRight':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            goToNextPage();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleZoomIn, handleZoomOut, handleZoomReset, goToPreviousPage, goToNextPage]);

  if (!article) {
    return <></>;
  }

  function onDocumentLoadSuccess({numPages: nextNumPages}: {numPages: number}) {
    setNumPages(nextNumPages);
    setPageNumber(1); // Reset to first page on new document load
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      scroll='paper'
      sx={{'& .MuiDialog-paper': {height: '90vh'}}}
    >
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
      <DialogContent
        ref={containerRef}
        dividers
        sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1}}
      >
        <Document
          file={article.hyperlink}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<CircularProgress />}
          error='Failed to load PDF file.'
        >
          <Page pageNumber={pageNumber} width={containerWidth > 0 ? containerWidth : undefined} scale={zoom} />
        </Document>
      </DialogContent>
      <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, gap: 2}}>
        <IconButton onClick={goToPreviousPage} disabled={pageNumber <= 1} aria-label='previous page'>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography>
          {pageNumber} / {numPages}
        </Typography>
        <IconButton onClick={goToNextPage} disabled={pageNumber >= numPages} aria-label='next page'>
          <ArrowForwardIosIcon />
        </IconButton>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, ml: 2}}>
          <Tooltip title='Zoom Out (Ctrl/Cmd + -)'>
            <IconButton onClick={handleZoomOut} disabled={zoom <= 0.25} aria-label='zoom out'>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Typography variant='body2' sx={{minWidth: '3rem', textAlign: 'center'}}>
            {Math.round(zoom * 100)}%
          </Typography>
          <Tooltip title='Zoom In (Ctrl/Cmd + +)'>
            <IconButton onClick={handleZoomIn} disabled={zoom >= 3} aria-label='zoom in'>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Reset Zoom (Ctrl/Cmd + 0)'>
            <IconButton onClick={handleZoomReset} disabled={zoom === 1} aria-label='reset zoom'>
              <Typography variant='body2' sx={{fontWeight: 'bold'}}>
                100%
              </Typography>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Dialog>
  );
}
