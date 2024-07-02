// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, TextField, Typography, FormGroup, FormControlLabel, Checkbox, Button, useTheme} from '@mui/material';
import {useState, useEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {GroupCategory, GroupSubcategory} from 'store/services/groupApi';
import {GroupFilter} from 'types/group';
import {Dictionary} from 'util/util';
import {Localization} from 'types/localization';

interface GroupFilterEditorProps {
  /** The GroupFilter item to be edited. */
  groupFilter: GroupFilter;

  /** A dictionary of group filters.*/
  groupFilters: Dictionary<GroupFilter>;

  /** An array of group category.*/
  groupCategories: GroupCategory[];

  /** An array of group subcategory.*/
  groupSubCategories: GroupSubcategory[];

  /** A function that allows setting the groupFilter state so that if the user adds a filter, the new filter will be visible */
  setGroupFilters: React.Dispatch<React.SetStateAction<Dictionary<GroupFilter>>>;

  /**
   * Callback function that is called, when a new filter is created, so it will be selected immediately or when the user
   * wants to close the editor.
   * @param groupFilter - Either the current filter or null when the user wants to close the current filter's editor.
   */
  selectGroupFilterCallback: (groupFilter: GroupFilter | null) => void;

  /**
   * A callback that notifies the parent, if there are currently unsaved changes for this group filter.
   * @param unsavedChanges - If the group filter has been modified without saving.
   */
  unsavedChangesCallback: (unsavedChanges: boolean) => void;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This is the detail view of the GroupFilter dialog. It allows to edit and create groups. It has a text field for the
 * name at the top and columns of checkboxes for groups in the center. It requires that at least one checkbox of each
 * group is selected before the apply button becomes available. It is also possible to discard changes by clicking the
 * abort button before applying the changes.
 */
export default function GroupFilterEditor({
  groupFilter,
  groupFilters,
  groupCategories,
  groupSubCategories,
  setGroupFilters,
  selectGroupFilterCallback,
  unsavedChangesCallback,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: GroupFilterEditorProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  const theme = useTheme();
  const [name, setName] = useState(groupFilter.name);
  const [groups, setGroups] = useState(groupFilter.groups);

  // Every group must have at least one element selected to be valid.
  const [valid, setValid] = useState(name.length > 0 && Object.values(groups).every((group) => group.length > 0));
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Checks if the group filer is in a valid state.
  useEffect(() => {
    setValid(name.length > 0 && Object.values(groups).every((group) => group.length > 0));
  }, [name, groups]);

  // Updates the parent about the current save state of the group filter.
  useEffect(() => {
    unsavedChangesCallback(unsavedChanges);
  }, [unsavedChanges, unsavedChangesCallback]);

  const toggleGroup = useCallback(
    (subGroup: GroupSubcategory) => {
      let category = [...groups[subGroup.category]];

      if (category.includes(subGroup.key)) {
        category = category.filter((key) => key !== subGroup.key);
      } else {
        category.push(subGroup.key);
      }

      setGroups({
        ...groups,
        [subGroup.category]: category,
      });
      setUnsavedChanges(true);
    },
    [groups, setGroups]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: '1',
        flexDirection: 'column',
        padding: 3,
      }}
    >
      <TextField
        label={
          localization.overrides && localization.overrides['group-filters.name']
            ? customT(localization.overrides['group-filters.name'])
            : defaultT('group-filters.name')
        }
        variant='outlined'
        defaultValue={name}
        autoFocus={true}
        error={name.length === 0}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          setUnsavedChanges(true);
          setName(e.target.value);
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexGrow: '1',
          flexDirection: 'row',
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        {groupCategories.map((group) => (
          <Box
            key={group.key}
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              color={groups[group.key].length > 0 ? theme.palette.text.primary : theme.palette.error.main}
              variant='h2'
            >
              {localization.overrides && localization.overrides[`group-filters.categories.${group.key}`]
                ? customT(localization.overrides[`group-filters.categories.${group.key}`])
                : defaultT(`group-filters.categories.${group.key}`)}
            </Typography>
            <FormGroup>
              {groupSubCategories
                ?.filter((subCategory) => subCategory.category === group.key)
                .filter((subGroup) => subGroup.key !== 'total') // TODO: We filter out the total group for now.
                .map((subGroup) => (
                  <FormControlLabel
                    key={subGroup.key}
                    label={
                      localization.overrides && localization.overrides[`group-filters.groups.${subGroup.key}`]
                        ? customT(localization.overrides[`group-filters.groups.${subGroup.key}`])
                        : defaultT(`group-filters.groups.${subGroup.key}`)
                    }
                    control={
                      <Checkbox
                        checked={groups[group.key].includes(subGroup.key)}
                        onClick={() => toggleGroup(subGroup)}
                      />
                    }
                  />
                ))}
            </FormGroup>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexGrow: '1',
          gap: 2,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant='outlined'
          color='error'
          sx={{marginRight: theme.spacing(2)}}
          onClick={() => {
            setUnsavedChanges(false);
            selectGroupFilterCallback(null);
          }}
        >
          {localization.overrides && localization.overrides['group-filters.close']
            ? customT(localization.overrides['group-filters.close'])
            : defaultT('group-filters.close')}
        </Button>
        <Button
          variant='outlined'
          color='primary'
          disabled={!valid || !unsavedChanges}
          onClick={() => {
            setUnsavedChanges(false);
            const newFilter = {
              id: groupFilter.id,
              name: name,
              isVisible: true,
              groups: groups,
            };
            setGroupFilters({
              ...groupFilters,
              [newFilter.id]: newFilter,
            });
          }}
        >
          {localization.overrides && localization.overrides['group-filters.apply']
            ? customT(localization.overrides['group-filters.apply'])
            : defaultT('group-filters.apply')}
        </Button>
      </Box>
    </Box>
  );
}
