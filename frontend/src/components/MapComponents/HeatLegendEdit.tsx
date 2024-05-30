import React, {useCallback, useEffect, useState} from 'react';
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
import legendPresets from '../../../assets/heatmap_legend_presets.json?url';
import {useTheme} from '@mui/material';
import {HeatmapLegend} from 'types/heatmapLegend';

interface HeatLegendEditProps {
  setLegend: (legend: HeatmapLegend) => void;
  legend: HeatmapLegend;
  selectedScenario?: number | null;
  t?: (key: string) => string;
  localization: {
    numberFormatter: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}
/**
 * This component displays an edit button to access a modal. In the modal you can edit the heatmap legend.
 */
export default function HeatLegendEdit({
  setLegend,
  legend,
  selectedScenario = null,
  t = (key: string) => key,
  localization,
}: HeatLegendEditProps) {
  const theme = useTheme();
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
          <FormControl fullWidth sx={{marginBottom: 3}}>
            <Select
              id='heatmap-select'
              aria-label={t('heatlegend.select')}
              value={legend.name}
              onChange={(event: SelectChangeEvent) => selectLegendByName(event.target.value)}
            >
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
                        localization={localization}
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
