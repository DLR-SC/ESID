import {Close, GroupAdd} from '@mui/icons-material';
import {Box, Typography, IconButton, Divider, Card, CardActionArea, CardContent, Button, useTheme} from '@mui/material';
import {useState, useEffect} from 'react';
import ConfirmDialog from './ConfirmDialog';
import GroupFilterCard from './GroupFilterCard';
import GroupFilterEditor from './GroupFilterEditor';
import {useTranslation} from 'react-i18next';
import {Dictionary} from '../../types/Cardtypes';
import {GroupFilter} from '../../types/Filtertypes';
import React from 'react';
import {GroupCategory, GroupSubcategory} from 'store/services/groupApi';

export interface ManageGroupDialogProps {
  groupFilters: Dictionary<GroupFilter> | undefined;
  groupCategories: GroupCategory[];
  groupSubCategories: GroupSubcategory[];
  onCloseRequest: () => void;
  unsavedChangesCallback: (unsavedChanges: boolean) => void;
  setGroupFilters: React.Dispatch<React.SetStateAction<Dictionary<GroupFilter> | undefined>>;
  localization: {
    numberFormatter?: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}

export default function ManageGroupDialog({
  groupFilters,
  groupCategories,
  groupSubCategories,
  onCloseRequest,
  unsavedChangesCallback,
  setGroupFilters,
  localization,
}: ManageGroupDialogProps) {
  const {t: defaultT} = useTranslation();
  const customLang = localization.customLang;
  const {t: customT} = useTranslation(customLang || undefined);
  // The currently selected filter.
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<GroupFilter | null>(null);

  // A filter the user might open. It will first be checked, if unsaved changes are present.
  const [nextSelectedGroupFilter, setNextSelectedGroupFilter] = useState<GroupFilter | null>(null);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

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
  }, [unsavedChanges, nextSelectedGroupFilter, selectedGroupFilter, unsavedChangesCallback, onCloseRequest]);

  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: '1',
        padding: '26px',
        alignItems: 'center',
      }}
    >
      <Box
        id='group-filter-dialog-title-bar'
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gridColumnGap: '5px',
          alignItems: 'center',
          justifyItems: 'center',
          width: '100%',
          marginBottom: 2,
        }}
      >
        <div />
        <Typography variant='h1'>
          {localization.overrides && localization.overrides['group-filters.title']
            ? customT(localization.overrides['group-filters.title'])
            : defaultT('group-filters.title')}
        </Typography>
        <IconButton color='primary' sx={{marginLeft: 'auto'}} onClick={onCloseRequest}>
          <Close />
        </IconButton>
      </Box>
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
            selectGroupFilterCallback={(groupFilter) => setNextSelectedGroupFilter(groupFilter)}
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
