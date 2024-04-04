// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback} from 'react';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {Button, List, ListItem, ListItemText} from '@mui/material';
import {Clear, CloudUpload, Done, MoreHoriz} from '@mui/icons-material';

/**
 * This component displays the accessibility legal text.
 */
export default function DataUploadDialog(): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();
  const [dragActive, setDragActive] = React.useState(false);

  enum UploadStatus {
    Started,
    Error,
    Done,
  }

  const [uploadStat, setUploadStat] = React.useState<{filename: string; status: UploadStatus}[]>([]);

  const fileTypes: string[] = [];

  // Function to handle data upload.
  const handleFiles = useCallback(
    (filelist: FileList) => {
      const fileSizeToString = (size: number) => {
        if (size < 1024) {
          return `${size} B`;
        } else if (size >= 1024 && size < 1048576) {
          return `${(size / 1024).toFixed(1)} KB`;
        } else {
          return `${(size / 1048576).toFixed(1)} MB`;
        }
      };
      console.log(filelist);
      // update file display
      const displaylist: {filename: string; status: UploadStatus}[] = [];
      for (let i = 0; i < filelist.length; i++) {
        const file = filelist[i];

        displaylist.push({
          filename: `${file.name} (${fileSizeToString(file.size)})`,
          status: UploadStatus.Started,
        });
      }
      setUploadStat(displaylist);

      // TODO: init file upload, adjust UploadStat as needed
    },
    [UploadStatus]
  );

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
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  // Callback for files selected through dialog
  const handleClick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

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
        {uploadStat.length > 0 && (
          <List>
            {uploadStat.map((file) => (
              <ListItem
                key={file.filename}
                disableGutters
                secondaryAction={
                  file.status === UploadStatus.Done ? (
                    <Done sx={{color: theme.palette.primary.main}} />
                  ) : file.status === UploadStatus.Error ? (
                    <Clear sx={{color: theme.palette.error.main}} />
                  ) : (
                    <MoreHoriz sx={{color: theme.palette.divider}} /> // TODO: Throbber
                  )
                }
              >
                <ListItemText primary={file.filename} />
              </ListItem>
            ))}
          </List>
        )}
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
