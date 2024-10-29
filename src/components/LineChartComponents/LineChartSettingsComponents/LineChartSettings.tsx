// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import {Button, Divider, Popover, Typography} from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import {Dictionary} from 'util/util';
import type {HorizontalThreshold} from 'types/horizontalThreshold';
import type {District} from 'types/district';
import type {Localization} from 'types/localization';
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
  setHorizontalThresholds,
  localization,
}: LineChartSettingsProps) {
  const {t: tSettings} = useTranslation('settings');

  /**
   * The settings menu for the line chart. Each item in the menu has a label, a view, and an icon.
   */

  const settingsMenu: SettingsMenu = {
    horizontalThreshold: {
      label: tSettings('manageThreshold'),
      view: 'horizontalThresholdSettings',
      icon: <HorizontalRuleIcon />,
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
    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginY: '1rem'}}>
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
        slotProps={{
          paper: {
            sx: {minWidth: '30%'},
          },
        }}
      >
        {currentView === 'settingsMenu' && (
          <Box p={4}>
            {renderHeader(tSettings('title'))}
            {Object.entries(settingsMenu).map(([key, item]) => (
              <>
                <Divider sx={{marginY: 2}} />
                <Box>
                  <Button key={key} onClick={() => handleNavigate(item.view as SettingsView)}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 2,
                        borderRadius: 1,
                        gap: 2,
                      }}
                    >
                      {item.icon}

                      <Typography variant='h2'>{item.label}</Typography>
                    </Box>
                  </Button>
                </Box>
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
      </Popover>
    </Box>
  );
}
