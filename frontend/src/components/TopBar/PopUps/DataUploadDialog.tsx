// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback} from 'react';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {Button} from '@mui/material';
import {CloudUpload} from '@mui/icons-material';

/**
 * This component displays the accessibility legal text.
 */
export default function DataUploadDialog(): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadStat, setUploadStat] = React.useState<{filename: string, status: boolean}[]>([]);

  const fileTypes: string[] = [];

  // Function to handle data upload.
  const handleFiles = (filelist: FileList) => {
    console.log(filelist);
    // update file display
    const displaylist: {filename: string, status: boolean}[] = [];
    for (let i = 0; i < filelist.length; i++) {
      const file = filelist[i];
      
      displaylist.push({
        filename: file.name,
        status: false
      });
    }
  };

  // Callback for drag event (to modify styling)
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Callback for files selected through drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  // Callback for files selected through dialog
  const handleClick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  return (
    <form id='upload-form' onDragEnter={handleDrag} onDragLeave={handleDrag} onSubmit={(e) => e.preventDefault()}>
      <input type='file' id='upload-input' multiple={true} accept={fileTypes.join(',')} onChange={handleClick} hidden />
      <Box
        sx={{
          margin: theme.spacing(4),
          padding: theme.spacing(4),
          minHeight: '30vw',
          background: theme.palette.background.paper,
          border: `${theme.palette.divider} ${dragActive ? 'solid' : 'dashed'} 2px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <Typography variant='h1'>{t('upload.header')}</Typography>
        <div>{t('upload.dragNotice')}</div>
        <label htmlFor='upload-input'>
          <Button variant='contained' startIcon={<CloudUpload />} component='span'>
            {t('upload.button')}
          </Button>
        </label>
      </Box>
      {dragActive && (
        <div
          id='upload-drop-notice'
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            variant='h1'
            sx={{
              background: 'white',
              border: `solid ${theme.palette.divider} 1px`,
              borderRadius: '1em',
              padding: '1em',
            }}
          >
            {t('upload.dropNotice')}
          </Typography>
        </div>
      )}
    </form>
  );
}
