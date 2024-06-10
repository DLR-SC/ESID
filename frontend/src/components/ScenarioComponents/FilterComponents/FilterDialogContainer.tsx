// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, Button, Dialog, useTheme} from '@mui/material';
import ConfirmDialog from './ConfirmDialog';
import {useState} from 'react';
import ManageGroupDialog from './ManageGroupDialog';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {GroupCategory, GroupSubcategory} from 'store/services/groupApi';
import {GroupFilter} from 'types/group';
import {Dictionary} from 'util/util';
import {Localization} from 'types/localization';

export interface FilterDialogContainerProps {
  /* A dictionary of group filters.*/
  groupFilters: Dictionary<GroupFilter> | undefined;

  /* An array of group category.*/
  groupCategories: GroupCategory[];

  /* An array of group subcategory.*/
  groupSubCategories: GroupSubcategory[];

  /* A function that allows setting the groupFilter state so that if the user adds a filter, the new filter will be visible */
  setGroupFilters: React.Dispatch<React.SetStateAction<Dictionary<GroupFilter> | undefined>>;

  /*An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This component renders a the container for the filters dialog.
 */
export default function FilterDialogContainer({
  groupFilters,
  setGroupFilters,
  groupCategories,
  groupSubCategories,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: FilterDialogContainerProps) {
  const [open, setOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [groupEditorUnsavedChanges, setGroupEditorUnsavedChanges] = useState(false);
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  const theme = useTheme();
  return (
    <>
      <Box
        id='scenario-footer-container'
        sx={{
          minHeight: '20vh',
          paddingLeft: 4,
          paddingRight: 2,
          paddingTop: 2,
          gap: '20px',
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
            fontWeight: 'bolder',
            fontSize: '3rem',
            border: `2px ${theme.palette.divider} dashed`,
            borderRadius: '3px',
            color: `${theme.palette.divider}`,
            alignSelf: 'top',
            '&:hover': {
              border: `2px ${theme.palette.divider} dashed`,
              background: '#E7E7E7',
            },
          }}
          aria-label={
            localization.overrides && localization.overrides['scenario.add']
              ? customT(localization.overrides['scenario.add'])
              : defaultT('scenario.add')
          }
        >
          +
        </Button>
        <Button
          id='manage-filters-button'
          variant='outlined'
          color='primary'
          sx={{
            width: '200px',
            alignSelf: 'center',
          }}
          onClick={() => {
            setOpen(true);
          }}
          aria-label={
            localization.overrides && localization.overrides['group-filters.title']
              ? customT(localization.overrides['group-filters.title'])
              : defaultT('group-filters.title')
          }
        >
          {localization.overrides && localization.overrides['scenario.manage-groups']
            ? customT(localization.overrides['scenario.manage-groups'])
            : defaultT('scenario.manage-groups')}
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
          groupFilters={groupFilters}
          setGroupFilters={setGroupFilters}
          groupCategories={groupCategories}
          groupSubCategories={groupSubCategories}
          onCloseRequest={() => {
            if (groupEditorUnsavedChanges) {
              setCloseDialogOpen(true);
            } else {
              setOpen(false);
            }
          }}
          unsavedChangesCallback={(unsavedChanges) => setGroupEditorUnsavedChanges(unsavedChanges)}
          localization={localization}
        />
        <ConfirmDialog
          open={closeDialogOpen}
          title={
            localization.overrides && localization.overrides['group-filters.confirm-discard-title']
              ? customT(localization.overrides['group-filters.confirm-discard-title'])
              : defaultT('group-filters.confirm-discard-title')
          }
          text={
            localization.overrides && localization.overrides['group-filters.confirm-discard-text']
              ? customT(localization.overrides['group-filters.confirm-discard-text'])
              : defaultT('group-filters.confirm-discard-text')
          }
          abortButtonText={
            localization.overrides && localization.overrides['group-filters.close']
              ? customT(localization.overrides['group-filters.close'])
              : defaultT('group-filters.close')
          }
          confirmButtonText={
            localization.overrides && localization.overrides['group-filters.discard']
              ? customT(localization.overrides['group-filters.discard'])
              : defaultT('group-filters.discard')
          }
          onAnswer={(answer) => {
            if (answer) {
              setOpen(false);
            }
            setCloseDialogOpen(false);
          }}
        />
      </Dialog>
    </>
  );
}
