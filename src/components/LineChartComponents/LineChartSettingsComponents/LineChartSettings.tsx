// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useMemo, useState} from 'react';
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
import ShowChartIcon from '@mui/icons-material/ShowChart';
import type {Threshold} from 'types/threshold';
import type {District} from 'types/district';
import {useTranslation} from 'react-i18next';
import ThresholdSettings from './ThresholdSettings/ThresholdSettings';
import YAxisValueSettings from './yAxisValueSettings/yAxisValueSettings';
import {NumberFormatter} from 'util/hooks';

/**
 * The different views that can be displayed in the settings popover.
 * You can add more views here if you want to add more settings.
 */
type SettingsView = 'settingsMenu' | 'thresholdSettings' | 'yAxisMaxValueSettings';

type NavigationItem = {
  kind: 'navigate';
  label?: string;
  description: string;
  icon: JSX.Element;
  view: SettingsView; // 'horizontalThresholdSettings' | ...
};

type InlineItem = {
  kind: 'inline';
  label?: string;
  description?: string;
  icon?: JSX.Element;
  element: JSX.Element; // the component you want to show inline
};

type SettingsItem = NavigationItem | InlineItem;

export interface LineChartSettingsProps {
  /** The district to which the settings apply. */
  selectedDistrict: District;

  /** The compartment to which the settings apply. */
  selectedCompartment: string;

  /** Array of compartment names */
  compartments: Array<{id: string; name: string}>;

  /** The horizontal thresholds for the y-axis. */
  thresholds: Record<string, Threshold>;

  /** The function to remove a horizontal threshold. */
  removeThreshold: (id: string) => void;

  /** The function to update a horizontal threshold. */
  updateThreshold: (newThreshold: Threshold) => void;

  /** The maximum value for the y-axis. */
  yAxisMaxValue: number | undefined;

  /** The maximum value for the data. */
  maxDataValue: number;

  /** The function to update the maximum value for the y-axis. */
  updateYAxisMaxValue: (newYAxisMaxValue: number) => void;
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
  thresholds,
  removeThreshold,
  updateThreshold,
  yAxisMaxValue,
  maxDataValue,
  updateYAxisMaxValue,
}: LineChartSettingsProps) {
  const {t: tSettings} = useTranslation('settings');
  const {i18n} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);

  const [currentView, setCurrentView] = useState<SettingsView>('settingsMenu');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showPopover, setShowPopover] = useState<boolean>(false);

  const localization = useMemo(() => {
    return {
      formatNumber: formatNumber,
      customLang: 'backend',
    };
  }, [formatNumber]);

  /**
   * The settings menu for the line chart. Each item in the menu has a label, a view, and an icon.
   * kind: 'inline' - the item is displayed inline
   * kind: 'navigate' - the item is displayed as a button that navigates to a new view
   */
  const settingsMenu: SettingsItem[] = [
    {
      kind: 'inline',
      label: tSettings('yAxisMaxValue'),
      element: (
        <Box sx={{display: 'flex', p: 2, alignItems: 'center'}}>
          <ShowChartIcon sx={{bgcolor: 'primary.main', color: 'white', p: '4px', borderRadius: '10%'}} />
          <YAxisValueSettings
            yAxisMaxValue={yAxisMaxValue}
            maxDataValue={maxDataValue}
            updateYAxisMaxValue={updateYAxisMaxValue}
            localization={localization}
          />
        </Box>
      ),
    },
    {
      kind: 'navigate',
      label: tSettings('manageThreshold'),
      description: tSettings('manageThresholdDescription'),
      icon: <DataThresholdingIcon sx={{bgcolor: 'primary.main', color: 'white', p: '4px', borderRadius: '10%'}} />,
      view: 'thresholdSettings',
    },
  ];

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
            {settingsMenu.map((item, idx) => (
              <Box key={idx}>
                <Divider sx={{my: '10px'}} variant='middle' />
                {item.kind === 'navigate' ? (
                  <Button
                    onClick={() => handleNavigate(item.view)}
                    sx={{display: 'flex', width: '100%', justifyContent: 'flex-start'}}
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
                ) : (
                  <Box>{item.element}</Box>
                )}
              </Box>
            ))}
          </Box>
        )}
        {currentView === 'thresholdSettings' && (
          <Box p={4}>
            {renderHeader(tSettings('thresholds.title'))}

            <ThresholdSettings
              selectedDistrict={selectedDistrict}
              selectedCompartment={selectedCompartment}
              compartments={compartments}
              thresholds={thresholds}
              removeThreshold={removeThreshold}
              updateThreshold={updateThreshold}
            />
          </Box>
        )}
      </Popover>
    </Box>
  );
}
