// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {useAppSelector} from '../../store/hooks';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import {ScrollSync} from 'react-scroll-sync';
import ConfirmDialog from '../shared/ConfirmDialog';
import CompartmentList from './CompartmentList';
import DataCardList from './DataCardList';

// Let's import pop-ups only once they are opened.
const ManageGroupDialog = React.lazy(() => import('../ManageGroupDialog'));

/**
 * React Component to render the Scenario Cards Section
 * @returns {JSX.Element} JSX Element to render the scenario card container and the scenario cards within.
 * @see ScenarioCard
 */
export default function Scenario(): JSX.Element {
  // State for the groups management dialog
  const [open, setOpen] = React.useState(false);

  const {t} = useTranslation();
  const theme = useTheme();

  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);

  const [groupEditorUnsavedChanges, setGroupEditorUnsavedChanges] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  return (
    <ScrollSync enabled={compartmentsExpanded ?? false}>
      <Box
        id='scenario-view-root'
        sx={{
          display: 'flex',
          cursor: 'default',
          background: theme.palette.background.default,
          maxWidth: '100%',
        }}
      >
        <CompartmentList />
        <DataCardList />
        <Box
          id='scenario-footer-container'
          sx={{
            borderLeft: `1px solid`,
            borderColor: 'divider',
            minHeight: '20vh',
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Button
            id='scenario-add-button'
            variant='outlined'
            color='success'
            sx={{
              height: '244px',
              width: '200px',
              margin: theme.spacing(3),
              marginTop: theme.spacing(2),
              fontWeight: 'bolder',
              fontSize: '3rem',
              border: `2px ${theme.palette.divider} dashed`,
              borderRadius: '3px',
              color: theme.palette.divider,
              alignSelf: 'top',

              '&:hover': {
                border: `2px ${theme.palette.divider} dashed`,
                background: '#E7E7E7',
              },
            }}
            aria-label={t('scenario.add')}
          >
            +
          </Button>

          <Button
            id='manage-filters-button'
            disabled // disable filters for pilot study as there is no filterable data yet
            variant='outlined'
            color='primary'
            sx={{
              width: '200px',
              margin: theme.spacing(2),
              alignSelf: 'center',
            }}
            onClick={() => {
              setOpen(true);
            }}
            aria-label={t('group-filters.title')}
          >
            {t('scenario.manage-groups')}
          </Button>
        </Box>
        <Dialog
          id='manage-filters-dialog'
          maxWidth='lg'
          fullWidth={true}
          open={open}
          onClose={() => {
            if (groupEditorUnsavedChanges) {
              setCloseDialogOpen(true);
            } else {
              setOpen(false);
            }
          }}
        >
          <ManageGroupDialog
            onCloseRequest={() => {
              if (groupEditorUnsavedChanges) {
                setCloseDialogOpen(true);
              } else {
                setOpen(false);
              }
            }}
            unsavedChangesCallback={(unsavedChanges) => setGroupEditorUnsavedChanges(unsavedChanges)}
          />
          <ConfirmDialog
            open={closeDialogOpen}
            title={t('group-filters.confirm-discard-title')}
            text={t('group-filters.confirm-discard-text')}
            abortButtonText={t('group-filters.close')}
            confirmButtonText={t('group-filters.discard')}
            onAnswer={(answer) => {
              if (answer) {
                setOpen(false);
              }
              setCloseDialogOpen(false);
            }}
          />
        </Dialog>
      </Box>
    </ScrollSync>
  );
}
