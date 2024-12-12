// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import DeleteForever from '@mui/icons-material/DeleteForever';
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
import React, {Dispatch, useState} from 'react';
import ConfirmDialog from '../../shared/ConfirmDialog';
import {useTranslation} from 'react-i18next';
import {GroupFilter} from 'types/group';
import {Localization} from 'types/localization';

interface GroupFilterCardProps {
  /** The GroupFilter item to be displayed. */
  item: GroupFilter;

  /** A function that allows setting the groupFilter state so that if the user adds a filter, the new filter will be visible */
  toggleGroupFilter: Dispatch<GroupFilter>;

  /**
   * Dispatch function to handle deletion of a group filter.
   */
  deleteGroupFilter: Dispatch<string>;

  /** Whether the filter is selected or not. If it is selected, the detail view is displaying this filter's config. */
  selected: boolean;

  /**
   * Callback function that is called when the filter is selected or unselected.
   * @param groupFilter - Either this filter, if it was selected or null, if it was unselected.
   */
  selectFilterCallback: (groupFilter: GroupFilter | null) => void;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * GroupFilterCard component displays a card that represents a single filter for the group filter list. The card shows
 * the filter name, a toggle switch to turn on or off the filter, and a delete button to remove the filter.
 */
export default function GroupFilterCard({
  item,
  toggleGroupFilter,
  deleteGroupFilter,
  selected,
  selectFilterCallback,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
}: GroupFilterCardProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  const theme = useTheme();

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
          selectFilterCallback(selected ? null : item);
        }}
      >
        <CardContent sx={{backgroundColor: selected ? theme.palette.info.main : theme.palette.background.paper}}>
          <Typography
            variant='body1'
            sx={{color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary}}
          >
            {item.name}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Divider orientation='vertical' variant='middle' flexItem />
      <CardActions>
        <Checkbox
          checkedIcon={<Visibility />}
          icon={<VisibilityOffOutlined color='disabled' />}
          checked={item.isVisible}
          onClick={() => {
            item.isVisible = !item.isVisible;
            toggleGroupFilter(item);
          }}
        />
        <ConfirmDialog
          open={confirmDialogOpen}
          title={
            localization.overrides && localization.overrides['group-filters.confirm-deletion-title']
              ? customT(localization.overrides['group-filters.confirm-deletion-title'])
              : defaultT('group-filters.confirm-deletion-title')
          }
          text={
            localization.overrides && localization.overrides['group-filters.confirm-deletion-text']
              ? customT(localization.overrides['group-filters.confirm-deletion-text'], {
                  groupName: item.name,
                })
              : defaultT('group-filters.confirm-deletion-text', {groupName: item.name})
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
              deleteGroupFilter(item.id);
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
