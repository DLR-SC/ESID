// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HeatLegend from './HeatLegend';
import EditIcon from '@mui/icons-material/Edit';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {selectHeatmapLegend} from '../../store/UserPreferenceSlice';
import {HeatmapLegend} from '../../types/heatmapLegend';
import {useTranslation} from 'react-i18next';
import legendPresets from '../../../assets/heatmap_legend_presets.json?url';

/**
 * This component displays an edit button to access a modal. In the modal you can edit the heatmap legend.
 */
export default function HeatLegendEdit(): JSX.Element {
  const dispatch = useAppDispatch();
  const activeScenario = useAppSelector((state) => state.dataSelection.scenario);
  const legend = useAppSelector((state) => state.userPreference.selectedHeatmap);
  const theme = useTheme();
  const {t} = useTranslation();

  // This contains all legends using the default colors.
  const defaultLegends = useDefaultLegends();

  // This contains all legends from the presets file.
  const [heatmapLegends, setHeatmapLegends] = useState<Array<HeatmapLegend>>([]);

  // This contains the default legend and the presets and is used for displaying the list to the user.
  const [availablePresets, setAvailablePresets] = useState<Array<HeatmapLegend>>([]);

  // modal state
  const [heatLegendEditOpen, setHeatLegendEditOpen] = React.useState(false);

  // Try to select a heatlegend using the given name.
  const selectLegendByName = useCallback(
    (name: string) => {
      const preset = availablePresets.find((preset) => preset.name === name);
      if (preset) {
        dispatch(selectHeatmapLegend({legend: preset}));
      }
    },
    [dispatch, availablePresets]
  );

  const handleChange = (event: SelectChangeEvent) => selectLegendByName(event.target.value);

  // This effect loads the presets file, once the modal is opened the first time.
  useEffect(() => {
    if (heatmapLegends.length === 0 && heatLegendEditOpen) {
      fetch(legendPresets, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then((response) => response.json())
        .then(
          (presetList: HeatmapLegend[]) => {
            presetList.forEach((legend) => {
              if (legend.isNormalized) {
                legend.steps.forEach((step) => {
                  //set step to normalized values
                  step.value = step.value / legend.steps[legend.steps.length - 1].value;
                });
              }
            });

            setHeatmapLegends(presetList);
          },
          // Reject Promise
          () => {
            console.warn('Did not receive proper heatmap legend presets');
          }
        );
    }
  }, [setHeatmapLegends, heatmapLegends, heatLegendEditOpen]);

  // This effect builds the list of available presets from the "defaultLegends" and "heatmapLegends".
  useEffect(() => {
    if (activeScenario === null || defaultLegends.length === 0) {
      return;
    }

    const scenarioDefault = defaultLegends[activeScenario % defaultLegends.length];
    const legends = [...heatmapLegends];
    legends.unshift(scenarioDefault);

    // In the case, where a non default legend is selected, but the legends haven't been loaded from file we add the
    // legend to the selection.
    if (legend.name !== 'Default' && heatmapLegends.length === 0) {
      legends.push(legend);
    }

    setAvailablePresets(legends);
  }, [defaultLegends, heatmapLegends, activeScenario, legend]);

  // This effect updates the selected legend, if a default legend is selected and the scenario changes.
  useEffect(() => {
    if (activeScenario === null) {
      return;
    }

    if (legend.name !== 'Default' && legend.name !== 'uninitialized') {
      return;
    }

    selectLegendByName('Default');
  }, [activeScenario, legend, selectLegendByName]);

  return (
    <>
      <Tooltip title={t('heatlegend.edit').toString()} placement='right' arrow>
        <IconButton
          color={'primary'}
          onClick={() => setHeatLegendEditOpen(true)}
          aria-label={t('heatlegend.edit')}
          size='small'
          sx={{padding: theme.spacing(0), marginBottom: theme.spacing(1)}}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Dialog maxWidth='lg' fullWidth={true} open={heatLegendEditOpen} onClose={() => setHeatLegendEditOpen(false)}>
        <Box
          sx={{
            padding: theme.spacing(4),
            background: theme.palette.background.paper,
          }}
        >
          <FormControl fullWidth sx={{marginBottom: theme.spacing(3)}}>
            <Select id='heatmap-select' aria-label={t('heatlegend.select')} value={legend.name} onChange={handleChange}>
              {availablePresets.map((preset, i) => (
                <MenuItem key={'legendPresetSelect' + i.toString()} value={preset.name}>
                  <Grid container maxWidth='lg'>
                    <Grid item xs={12}>
                      <HeatLegend
                        legend={preset}
                        exposeLegend={() => {
                          return;
                        }}
                        min={0}
                        max={preset.steps[preset.steps.length - 1].value}
                        displayText={!preset.isNormalized}
                        id={preset.name}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='h2' align='center'>
                        {preset.name}
                      </Typography>
                    </Grid>
                  </Grid>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container item justifyContent={'flex-end'}>
            <Button variant='contained' onClick={() => setHeatLegendEditOpen(false)}>
              {t('okay')}
            </Button>
          </Grid>
        </Box>
      </Dialog>
    </>
  );
}

/**
 * This hook generates the heatmap legends for all scenarios using the current theme.
 */
function useDefaultLegends(): Array<HeatmapLegend> {
  const theme = useTheme();
  const [defaultLegends, setDefaultLegends] = useState<Array<HeatmapLegend>>([]);

  useEffect(() => {
    const legends: Array<HeatmapLegend> = [];
    const stepCount = theme.custom.scenarios[0].length - 1;
    for (const element of theme.custom.scenarios) {
      const steps = [];
      for (let j = 0; j < stepCount; j++) {
        steps.push({color: element[stepCount - 1 - j], value: j / (stepCount - 1)});
      }
      legends.push({name: 'Default', isNormalized: true, steps});
    }

    setDefaultLegends(legends);
  }, [theme, setDefaultLegends]);

  return defaultLegends;
}
