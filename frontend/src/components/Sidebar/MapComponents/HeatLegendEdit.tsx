// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import legendPresets from '../../../../assets/heatmap_legend_presets.json?url';
import {useTheme} from '@mui/material';
import {HeatmapLegend} from 'types/heatmapLegend';
import {Localization} from 'types/localization';
import {useTranslation} from 'react-i18next';

interface HeatLegendEditProps {
  setLegend: (legend: HeatmapLegend) => void;
  legend: HeatmapLegend;
  selectedScenario?: number | null;
  localization?: Localization;
}
/**
 * This component displays an edit button to access a modal. In the modal you can edit the heatmap legend.
 */
export default function HeatLegendEdit({
  setLegend,
  legend,
  selectedScenario = null,
  localization = {
    formatNumber: (value) => value.toLocaleString(),
    customLang: 'global',
    overrides: {},
  },
}: HeatLegendEditProps) {
  const theme = useTheme();
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  // // This contains all legends using the default colors.
  // const [defaultLegends, setDefaultLegends] = useState<Array<HeatmapLegend>>([]);
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
        setLegend(preset);
      }
    },
    [availablePresets, setLegend]
  );

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
    if (selectedScenario == null || defaultLegends.length === 0) {
      return;
    }
    const scenarioDefault = defaultLegends[selectedScenario % defaultLegends.length];
    const legends = [...heatmapLegends];
    legends.unshift(scenarioDefault);

    if (legend.name !== 'Default' && heatmapLegends.length === 0) {
      legends.push(legend);
    }

    setAvailablePresets(legends);
  }, [selectedScenario, defaultLegends, heatmapLegends, legend]);

  // This effect updates the selected legend, if a default legend is selected and the scenario changes.
  useEffect(() => {
    if (legend.name !== 'Default' && legend.name !== 'uninitialized') {
      return;
    }

    selectLegendByName('Default');
  }, [legend, selectLegendByName]);

  return (
    <>
      <Tooltip
        title={
          localization.overrides && localization.overrides['heatlegend.edit']
            ? customT(localization.overrides['heatlegend.edit'])
            : defaultT('heatlegend.edit')
        }
        placement='right'
        arrow
      >
        <IconButton
          color={'primary'}
          onClick={() => setHeatLegendEditOpen(true)}
          aria-label={
            localization.overrides && localization.overrides['heatlegend.edit']
              ? customT(localization.overrides['heatlegend.edit'])
              : defaultT('heatlegend.edit')
          }
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
          <FormControl fullWidth sx={{marginBottom: 3}}>
            <Select
              id='heatmap-select'
              aria-label={
                localization.overrides && localization.overrides['heatlegend.edit']
                  ? customT(localization.overrides['heatlegend.edit'])
                  : defaultT('heatlegend.edit')
              }
              value={legend.name}
              onChange={(event: SelectChangeEvent) => selectLegendByName(event.target.value)}
            >
              {availablePresets.map((preset, i) => (
                <MenuItem key={'legendPresetSelect' + i.toString()} value={preset.name}>
                  <Box sx={{width: '100%'}}>
                    <LegendGradient legend={preset} />
                    <Box>
                      <Typography variant='h2' align='center'>
                        {preset.name}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container item justifyContent={'flex-end'}>
            <Button variant='contained' onClick={() => setHeatLegendEditOpen(false)}>
              {localization.overrides && localization.overrides['okay']
                ? customT(localization.overrides['okay'])
                : defaultT('okay')}
            </Button>
          </Grid>
        </Box>
      </Dialog>
    </>
  );
}

function LegendGradient({legend}: Readonly<{legend: HeatmapLegend}>): JSX.Element {
  const divRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!divRef.current) {
      return;
    }

    const gradient = legend.steps
      .map(({color, value}) => {
        return `${color} ${Math.round(value * 100)}%`;
      })
      .join(', ');

    divRef.current.style.background = `linear-gradient(90deg, ${gradient})`;
  }, [legend]);

  return (
    <div ref={divRef} id={`legend-gradient-${legend.name}`} style={{width: '100%', height: '50px', margin: '5px'}} />
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
        steps.push({
          color: element[stepCount - 1 - j],
          value: j / (stepCount - 1),
        });
      }
      legends.push({name: 'Default', isNormalized: true, steps});
    }
    setDefaultLegends(legends);
  }, [theme, setDefaultLegends]);

  return defaultLegends;
}
