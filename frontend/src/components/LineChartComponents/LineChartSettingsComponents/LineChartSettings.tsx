// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import {Button, Divider, Popover, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DataThresholdingIcon from '@mui/icons-material/DataThresholdingRounded';
import FilterAltIcon from '@mui/icons-material/FilterAltOutlined';
import {Dictionary} from 'util/util';
import type {HorizontalThreshold} from 'types/horizontalThreshold';
import type {GroupFilter} from 'types/group';
import {GroupCategory, GroupSubcategory} from 'store/services/groupApi';
import type {District} from 'types/district';
import type {Localization} from 'types/localization';
import {useTranslation} from 'react-i18next';
import HorizontalThresholdSettings from './HorizontalThresholdSettings/HorizontalThresholdSettings';
import FilterContainer from './FilterComponents/FilterContainer';
import ConfirmDialog from 'components/shared/ConfirmDialog';

/**
 * The different views that can be displayed in the settings popover.
 * You can add more views here if you want to add more settings.
 */
type SettingsView = 'settingsMenu' | 'horizontalThresholdSettings' | 'filters';

type SettingsMenu = {
  [key: string]: {
    label: string;
    description: string;
    view: string;
    icon: JSX.Element;
  };
};
export interface LineChartSettingsProps {
  /** The district to which the settings apply. */
  selectedDistrict: District;

  /** The compartment to which the settings apply. */
  selectedCompartment: string;

  /** The horizontal thresholds for the y-axis. */
  horizontalThresholds: Dictionary<HorizontalThreshold>;

  groupFilters: Dictionary<GroupFilter>;

  groupCategories: GroupCategory[] | undefined;

  groupSubCategories: GroupSubcategory[] | undefined;

  setGroupFilters: React.Dispatch<React.SetStateAction<Dictionary<GroupFilter>>>;

  /** A function that sets the horizontal thresholds for the y-axis. */
  setHorizontalThresholds: React.Dispatch<React.SetStateAction<Dictionary<HorizontalThreshold>>>;

  /** An object containing localization information (translation & number formattation). */
  localization?: Localization;
}

/**
 * LineChartSettings component displays a button that opens a popover with settings for the line chart.
 * The settings include the ability to set horizontal thresholds for the y-axis.
 * The settings is also expandable to include more settings in the future.
 */
export function LineChartSettings({
  selectedDistrict,
  selectedCompartment,
  horizontalThresholds,
  groupFilters,
  groupCategories,
  groupSubCategories,
  setGroupFilters,
  setHorizontalThresholds,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: LineChartSettingsProps) {
  const {t: tSettings} = useTranslation('settings');
  const {t: customT} = useTranslation(localization.customLang);

  /**
   * The settings menu for the line chart. Each item in the menu has a label, a view, and an icon.
   */
  const settingsMenu: SettingsMenu = {
    horizontalThreshold: {
      label: tSettings('manageThreshold'),
      description: tSettings('manageThresholdDescription'),
      view: 'horizontalThresholdSettings',
      icon: (
        <DataThresholdingIcon
          sx={{backgroundColor: 'primary.main', color: 'white', padding: '4px', borderRadius: '10%'}}
        />
      ),
    },
    filters: {
      label: tSettings('manageGroups'),
      description: tSettings('manageGroupsDescription'),
      view: 'filters',
      icon: (
        <FilterAltIcon sx={{backgroundColor: 'primary.main', color: 'white', padding: '4px', borderRadius: '10%'}} />
      ),
    },
  };

  const [currentView, setCurrentView] = useState<SettingsView>('settingsMenu');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [unsavedChanges, setunsavedChanges] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShowPopover(true);
  };

  const handlePopoverCloseRequest = () => {
    if (unsavedChanges) {
      setConfirmDialogOpen(true);
    } else {
      handlePopoverClose();
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setShowPopover(false);
  };

  const handleConfirmDialogClose = (discard: boolean) => {
    setConfirmDialogOpen(false);
    if (discard) {
      setunsavedChanges(false);
      handlePopoverClose();
    }
  };

  const handleNavigate = (view: SettingsView) => {
    setCurrentView(view);
  };

  const handleBackButton = () => {
    if (unsavedChanges) {
      setConfirmDialogOpen(true);
    } else {
      setCurrentView('settingsMenu');
    }
  };

  const renderHeader = (title: string, handleCustomBackButton?: void) => (
    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginY: '1rem'}}>
      <IconButton
        onClick={handleCustomBackButton ?? handleBackButton}
        disabled={currentView === 'settingsMenu'}
        sx={{
          opacity: currentView === 'settingsMenu' ? 0 : 1,
        }}
      >
        <ArrowBackIosNewIcon fontSize='small' data-testid='settings-back-button' />
      </IconButton>
      <Typography variant='h1'>{title}</Typography>
      <IconButton onClick={handlePopoverCloseRequest} data-testid='settings-close-button'>
        <CloseIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 1000,
      }}
    >
      <Button
        onClick={handlePopoverOpen}
        aria-label='settings-popover-button'
        data-testid='settings-popover-button-testid'
      >
        <SettingsIcon />
      </Button>
      <Popover
        aria-label='line-chart-settings'
        data-testid='line-chart-settings-popover-testid'
        anchorEl={anchorEl}
        open={showPopover}
        onClose={handlePopoverCloseRequest}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {minWidth: '30%', minHeight: '50%'},
          },
        }}
      >
        {currentView === 'settingsMenu' && (
          <Box p={4}>
            {renderHeader(tSettings('title'))}
            {Object.entries(settingsMenu).map(([key, item]) => (
              <>
                <Divider sx={{marginY: 2}} variant='middle' />

                <Button
                  key={key}
                  onClick={() => handleNavigate(item.view as SettingsView)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'flex-start',
                    alignContent: 'center',
                  }}
                >
                  {item.icon}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      marginLeft: 4,
                    }}
                  >
                    <Typography variant='h2' sx={{textTransform: 'none', color: 'black'}}>
                      {item.label}
                    </Typography>
                    <Typography variant='subtitle1' sx={{textTransform: 'none', color: 'gray'}}>
                      {item.description}
                    </Typography>
                  </Box>
                </Button>
              </>
            ))}
          </Box>
        )}
        {currentView === 'horizontalThresholdSettings' && (
          <Box p={4}>
            {renderHeader(tSettings('horizontalThresholds.title'))}

            <HorizontalThresholdSettings
              selectedDistrict={selectedDistrict}
              selectedCompartment={selectedCompartment}
              horizontalThresholds={horizontalThresholds}
              setHorizontalThresholds={setHorizontalThresholds}
              localization={localization}
            />
          </Box>
        )}
        {currentView === 'filters' && (
          <Box p={4}>
            {renderHeader(
              localization.overrides && localization.overrides['group-filters.title']
                ? customT(localization.overrides['group-filters.title'])
                : tSettings('group-filters.title')
            )}
            {groupCategories && groupSubCategories && (
              <FilterContainer
                groupFilters={groupFilters}
                setGroupFilters={setGroupFilters}
                groupCategories={groupCategories}
                groupSubCategories={groupSubCategories}
                setUnsavedChanges={setunsavedChanges}
                localization={localization}
              />
            )}
          </Box>
        )}
        <ConfirmDialog
          open={confirmDialogOpen}
          title={localization.overrides?.['group-filters.confirm-discard-title'] ?? 'Discard changes?'}
          text={localization.overrides?.['group-filters.confirm-discard-text'] ?? 'You have unsaved changes. Discard?'}
          abortButtonText={localization.overrides?.['group-filters.close'] ?? 'Cancel'}
          confirmButtonText={localization.overrides?.['group-filters.discard'] ?? 'Discard'}
          onAnswer={handleConfirmDialogClose}
        />
      </Popover>
    </Box>
  );
}
