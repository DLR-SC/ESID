// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Visibility, VisibilityOffOutlined, DeleteForever} from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Divider,
  CardActions,
  Checkbox,
  IconButton,
  useTheme,
} from '@mui/material';
import {useState} from 'react';
import ConfirmDialog from './ConfirmDialog';
import {useTranslation} from 'react-i18next';
import {GroupFilter} from '../../types/Filtertypes';
import {Dictionary} from '../../types/Cardtypes';
import React from 'react';

interface GroupFilterCardProps {
  /** The GroupFilter item to be displayed. */
  item: GroupFilter;

  groupFilters: Dictionary<GroupFilter> | undefined;

  setGroupFilters: React.Dispatch<React.SetStateAction<Dictionary<GroupFilter> | undefined>>;

  /** Whether the filter is selected or not. If it is selected, the detail view is displaying this filter's config. */
  selected: boolean;

  selectFilterCallback: (groupFilter: GroupFilter | null) => void;

  localization: {
    numberFormatter?: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}

export default function GroupFilterCard(props: GroupFilterCardProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const {t: defaultT} = useTranslation();
  const customLang = props.localization.customLang;
  const {t: customT} = useTranslation(customLang || undefined);
  const theme = useTheme();

  const ChangeVisibility = (id: string) => {
    // Find the filter with the specific id
    const filterToChange = props.groupFilters![id];

    // Check if the filter exists
    if (filterToChange) {
      // Create a new copy of groupFilters with the updated filter
      const newGroupFilters = {
        ...props.groupFilters,
        [id]: {
          ...filterToChange,
          isVisible: !filterToChange.isVisible,
        },
      };

      // Update the state with the new copy of groupFilters
      props.setGroupFilters(newGroupFilters);
    }
  };

  const DeleteFilter = (id: string) => {
    // Create a new copy of groupFilters without the filter with the specific id
    const newGroupFilters = {...props.groupFilters};
    delete newGroupFilters[id];

    // Update the state with the new copy of groupFilters
    props.setGroupFilters(newGroupFilters);
  };

  return (
    <Card
      variant='outlined'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <CardActionArea
        onClick={() => {
          props.selectFilterCallback(props.selected ? null : props.item);
        }}
      >
        <CardContent sx={{backgroundColor: props.selected ? theme.palette.info.main : theme.palette.background.paper}}>
          <Typography
            variant='body1'
            sx={{color: props.selected ? theme.palette.primary.contrastText : theme.palette.text.primary}}
          >
            {props.item.name}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Divider orientation='vertical' variant='middle' flexItem />
      <CardActions>
        <Checkbox
          checkedIcon={<Visibility />}
          icon={<VisibilityOffOutlined color='disabled' />}
          checked={props.item.isVisible}
          onClick={() => {
            ChangeVisibility(props.item.id);
          }}
        />
        <ConfirmDialog
          open={confirmDialogOpen}
          title={
            props.localization.overrides && props.localization.overrides['group-filters.confirm-deletion-title']
              ? customT(props.localization.overrides['group-filters.confirm-deletion-title'])
              : defaultT('group-filters.confirm-deletion-title')
          }
          text={
            props.localization.overrides && props.localization.overrides['group-filters.confirm-deletion-text']
              ? customT(props.localization.overrides['group-filters.confirm-deletion-text'], {
                  groupName: props.item.name,
                })
              : defaultT('group-filters.confirm-deletion-text', {groupName: props.item.name})
          }
          onAnswer={(answer) => {
            if (answer) {
              DeleteFilter(props.item.id);
            }
            setConfirmDialogOpen(false);
          }}
        />
        <IconButton onClick={() => setConfirmDialogOpen(true)}>
          <DeleteForever />
        </IconButton>
      </CardActions>
    </Card>
  );
}
