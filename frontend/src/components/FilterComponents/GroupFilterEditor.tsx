// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, TextField, Typography, FormGroup, FormControlLabel, Checkbox, Button, useTheme} from '@mui/material';
import {useState, useEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {GroupFilter} from '../../types/Filtertypes';
import {Dictionary} from '../../types/Cardtypes';
import React from 'react';
import {GroupCategory} from 'store/services/groupApi';

interface GroupSubcategory {
  key: string;
  name: string;
  description: string;
  category: string;
}

interface GroupFilterEditorProps {
  /** The GroupFilter item to be edited. */
  groupFilter: GroupFilter;

  groupFilters: Dictionary<GroupFilter> | undefined;

  groupCategories: GroupCategory[];

  groupSubCategories: GroupSubcategory[];

  setGroupFilters: React.Dispatch<React.SetStateAction<Dictionary<GroupFilter> | undefined>>;

  selectGroupFilterCallback: (groupFilter: GroupFilter | null) => void;

  unsavedChangesCallback: (unsavedChanges: boolean) => void;

  localization: {
    numberFormatter?: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}

export default function GroupFilterEditor(props: GroupFilterEditorProps) {
  const {t: defaultT} = useTranslation();
  const customLang = props.localization.customLang;
  const {t: customT} = useTranslation(customLang || undefined);
  const theme = useTheme();
  const [name, setName] = useState(props.groupFilter.name);
  const [groups, setGroups] = useState(props.groupFilter.groups);

  // Every group must have at least one element selected to be valid.
  const [valid, setValid] = useState(name.length > 0 && Object.values(groups).every((group) => group.length > 0));
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Checks if the group filer is in a valid state.
  useEffect(() => {
    setValid(name.length > 0 && Object.values(groups).every((group) => group.length > 0));
  }, [name, groups, props]);

  // Updates the parent about the current save state of the group filter.
  useEffect(() => {
    props.unsavedChangesCallback(unsavedChanges);
  }, [props, unsavedChanges]);

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
          props.localization.overrides && props.localization.overrides['group-filters.name']
            ? customT(props.localization.overrides['group-filters.name'])
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
        {props.groupCategories.map((group) => (
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
              {props.localization.overrides &&
              props.localization.overrides[`group-filters-editor.categories.${group.key}`]
                ? customT(props.localization.overrides[`group-filters-editor.categories.${group.key}`])
                : defaultT(`group-filters-editor.categories.${group.key}`)}
            </Typography>
            <FormGroup>
              {props.groupSubCategories
                ?.filter((subCategory) => subCategory.category === group.key)
                .filter((subGroup) => subGroup.key !== 'total') // TODO: We filter out the total group for now.
                .map((subGroup) => (
                  <FormControlLabel
                    key={subGroup.key}
                    label={
                      props.localization.overrides &&
                      props.localization.overrides[`group-filters-editor.groups.${subGroup.key}`]
                        ? customT(props.localization.overrides[`group-filters-editor.groups.${subGroup.key}`])
                        : defaultT(`group-filters-editor.groups.${subGroup.key}`)
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
            props.selectGroupFilterCallback(null);
          }}
        >
          {props.localization.overrides && props.localization.overrides['group-filters.close']
            ? customT(props.localization.overrides['group-filters.close'])
            : defaultT('group-filters.close')}
        </Button>
        <Button
          variant='outlined'
          color='primary'
          disabled={!valid || !unsavedChanges}
          onClick={() => {
            setUnsavedChanges(false);
            const newFilter = {
              id: props.groupFilter.id,
              name: name,
              isVisible: true,
              groups: groups,
            };
            props.setGroupFilters({
              ...props.groupFilters,
              [newFilter.id]: newFilter,
            });
          }}
        >
          {props.localization.overrides && props.localization.overrides['group-filters.apply']
            ? customT(props.localization.overrides['group-filters.apply'])
            : defaultT('group-filters.apply')}
        </Button>
      </Box>
    </Box>
  );
}
