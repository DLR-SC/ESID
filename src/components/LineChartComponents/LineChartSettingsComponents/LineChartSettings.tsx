// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DataThresholdingIcon from '@mui/icons-material/DataThresholdingRounded';
import type {HorizontalThreshold} from 'types/horizontalThreshold';
import type {District} from 'types/district';
import {useTranslation} from 'react-i18next';
import HorizontalThresholdSettings from './HorizontalThresholdSettings/HorizontalThresholdSettings';

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

  /** Array of compartment names */
  compartments: Array<{id: string; name: string}>;

  /** The horizontal thresholds for the y-axis. */
  horizontalThresholds: Record<string, HorizontalThreshold>;

  /** The function to remove a horizontal threshold. */
  removeHorizontalThreshold: (id: string) => void;

  /** The function to update a horizontal threshold. */
  updateHorizontalThreshold: (newThreshold: HorizontalThreshold) => void;
}

/**
 * LineChartSettings component displays a button that opens a popover with settings for the line chart.
 * The settings include the ability to set horizontal thresholds for the y-axis.
 * The settings is also expandable to include more settings in the future.
 */
export default function LineChartSettings({
  selectedDistrict,
  selectedCompartment,
  compartments,
  horizontalThresholds,
  removeHorizontalThreshold,
  updateHorizontalThreshold,
}: LineChartSettingsProps) {
  const {t: tSettings} = useTranslation('settings');

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
    // filters: {
    //   label: tSettings('manageGroups'),
    //   view: 'filters',
    //   icon: <HorizontalRuleIcon />,
    // },
  };

  const [currentView, setCurrentView] = useState<SettingsView>('settingsMenu');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showPopover, setShowPopover] = useState<boolean>(false);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShowPopover(true);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setShowPopover(false);
  };

  const handleNavigate = (view: SettingsView) => {
    setCurrentView(view);
  };

  const handleBackButton = () => {
    setCurrentView('settingsMenu');
  };

  const renderHeader = (title: string) => (
    <Box
      sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginY: '1rem'}}
      data-testid={`${currentView}-setting-container`}
    >
      <IconButton onClick={() => handleBackButton()} disabled={currentView === 'settingsMenu'}>
        <ArrowBackIosNewIcon fontSize='small' data-testid='settings-back-button' />
      </IconButton>
      <Typography variant='h1'>{title}</Typography>
      <IconButton onClick={handlePopoverClose} data-testid='settings-close-button'>
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
        onClose={handlePopoverClose}
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
          <Box p={4} data-testid='main-settings-menu'>
            {renderHeader(tSettings('title'))}
            {Object.entries(settingsMenu).map(([key, item]) => (
              <Box key={key}>
                <Divider sx={{marginY: 2}} variant='middle' />
                <Button
                  data-testid={`settings-menu-item-${key}`}
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
                    <Typography variant='h2'>{item.label}</Typography>
                    <Typography variant='body1' sx={{textTransform: 'none', color: 'gray'}}>
                      {item.description}
                    </Typography>
                  </Box>
                </Button>
              </Box>
            ))}
          </Box>
        )}
        {currentView === 'horizontalThresholdSettings' && (
          <Box p={4}>
            {renderHeader(tSettings('horizontalThresholds.title'))}

            <HorizontalThresholdSettings
              selectedDistrict={selectedDistrict}
              selectedCompartment={selectedCompartment}
              compartments={compartments}
              horizontalThresholds={horizontalThresholds}
              removeHorizontalThreshold={removeHorizontalThreshold}
              updateHorizontalThreshold={updateHorizontalThreshold}
            />
          </Box>
        )}
      </Popover>
    </Box>
  );
}
