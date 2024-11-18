// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import GroupAdd from '@mui/icons-material/GroupAdd';
import {Box, Typography, Divider, Card, CardActionArea, CardContent, Button, useTheme} from '@mui/material';
import {useState, useEffect} from 'react';
import ConfirmDialog from 'components/shared/ConfirmDialog';
import GroupFilterCard from './GroupFilterCard';
import GroupFilterEditor from './GroupFilterEditor';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {GroupCategory, GroupSubcategory} from 'store/services/groupApi';
import {GroupFilter} from 'types/group';
import {Dictionary} from 'util/util';
import {Localization} from 'types/localization';

export interface ManageGroupDialogProps {
  /** A dictionary of group filters.*/
  groupFilters: Dictionary<GroupFilter>;

  /** An array of group category.*/
  groupCategories: GroupCategory[];

  /** An array of group subcategory.*/
  groupSubCategories: GroupSubcategory[];

  /** Callback function, which is called, when the close button is called.*/
  onCloseRequest: () => void;

  /**
   * A callback that notifies the parent, if there are currently unsaved changes for this group filter.
   * @param unsavedChanges - If the group filter has been modified without saving.
   */
  unsavedChangesCallback: (unsavedChanges: boolean) => void;

  /** A function that allows setting the groupFilter state so that if the user adds a filter, the new filter will be visible.*/
  setGroupFilters: React.Dispatch<React.SetStateAction<Dictionary<GroupFilter>>>;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This filter menu provides an editor to create, edit, toggle and delete group filters. It uses a classic master detail view
 * with the available filters on the left and the filter configuration on the right.
 */
export default function ManageGroup({
  groupFilters,
  groupCategories,
  groupSubCategories,
  unsavedChangesCallback,
  setGroupFilters,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: ManageGroupDialogProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  // The currently selected filter.
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<GroupFilter | null>(null);

  // A filter the user might open. It will first be checked, if unsaved changes are present.
  const [nextSelectedGroupFilter, setNextSelectedGroupFilter] = useState<GroupFilter | null>(null);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Trigger layout recalculation when switching to GroupFilterEditor
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [selectedGroupFilter]);

  // This effect ensures that the user doesn't discard unsaved changes without confirming it first.
  useEffect(() => {
    if (nextSelectedGroupFilter && nextSelectedGroupFilter.id !== selectedGroupFilter?.id) {
      // A new group filter has been selected.

      if (selectedGroupFilter && unsavedChanges) {
        // There are unsaved changes. Ask for confirmation first!
        setConfirmDialogOpen(true);
      } else {
        // Everything is saved. Change the selected filter.
        setSelectedGroupFilter(nextSelectedGroupFilter);
      }
    } else if (!nextSelectedGroupFilter && !unsavedChanges) {
      // This case is handled, when the user presses the 'abort' button.
      setSelectedGroupFilter(null);
    }
    unsavedChangesCallback(unsavedChanges);
  }, [unsavedChanges, nextSelectedGroupFilter, selectedGroupFilter, unsavedChangesCallback]);

  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: '1',
        minWidth: '800px',
        alignItems: 'center',
      }}
    >
      <Divider orientation='horizontal' variant='middle' flexItem />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: '1',
          width: '100%',
        }}
      >
        <Box
          sx={{
            minWidth: '300px',
            padding: 2,
            marginRight: 3,
            marginTop: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {Object.values(groupFilters || {})?.map((item) => (
            <GroupFilterCard
              key={item.id}
              item={item}
              groupFilters={groupFilters}
              setGroupFilters={setGroupFilters}
              selected={selectedGroupFilter?.id === item.id}
              selectFilterCallback={(groupFilter) => setNextSelectedGroupFilter(groupFilter)}
              localization={localization}
            />
          ))}
          <Card
            id='group-filter-add-card'
            variant='outlined'
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: theme.palette.primary.main,
            }}
          >
            <CardActionArea
              aria-label={
                localization.overrides && localization.overrides['group-filters.add-group']
                  ? customT(localization.overrides['group-filters.add-group'])
                  : defaultT('group-filters.add-group')
              }
              onClick={() => {
                const groups: Dictionary<Array<string>> = {};
                groupCategories.forEach((group) => (groups[group.key] = []));
                setNextSelectedGroupFilter({
                  id: crypto.randomUUID(),
                  name: '',
                  isVisible: false,
                  groups: groups,
                });
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant='button' sx={{color: '#543CF0'}}>
                  {localization.overrides && localization.overrides['group-filters.add-group']
                    ? customT(localization.overrides['group-filters.add-group'])
                    : defaultT('group-filters.add-group')}
                </Typography>
                <GroupAdd color='primary' />
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
        <Divider orientation='vertical' flexItem />
        {selectedGroupFilter ? (
          <GroupFilterEditor
            key={selectedGroupFilter.id}
            groupFilter={selectedGroupFilter}
            groupFilters={groupFilters}
            setGroupFilters={setGroupFilters}
            selectGroupFilterCallback={(groupFilter: GroupFilter | null) => setNextSelectedGroupFilter(groupFilter)}
            unsavedChangesCallback={(edited) => setUnsavedChanges(edited)}
            groupCategories={groupCategories}
            groupSubCategories={groupSubCategories}
            localization={localization}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexGrow: '1',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
            }}
          >
            <Typography variant='body1'>
              {localization.overrides && localization.overrides['group-filters.nothing-selected']
                ? customT(localization.overrides['group-filters.nothing-selected'])
                : defaultT('group-filters.nothing-selected')}
            </Typography>
            <Button
              variant='outlined'
              aria-label={
                localization.overrides && localization.overrides['group-filters.add-group']
                  ? customT(localization.overrides['group-filters.add-group'])
                  : defaultT('group-filters.add-group')
              }
              sx={{marginTop: 2}}
              onClick={() => {
                const groups: Dictionary<Array<string>> = {};
                groupCategories.forEach((group) => (groups[group.key] = []));
                setNextSelectedGroupFilter({
                  id: crypto.randomUUID(),
                  name: '',
                  isVisible: false,
                  groups: groups,
                });
              }}
            >
              <GroupAdd color='primary' />
            </Button>
          </Box>
        )}
      </Box>
      <ConfirmDialog
        open={confirmDialogOpen}
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
            setSelectedGroupFilter(nextSelectedGroupFilter);
          } else {
            setNextSelectedGroupFilter(null);
          }
          setConfirmDialogOpen(false);
        }}
      />
    </Box>
  );
}
