import React, {useEffect} from 'react';
import {useTheme} from '@mui/material/styles';
import {Box, Dialog, Grid, IconButton, Radio, Typography} from '@mui/material';
import HeatLegend from './HeatLegend';
import EditIcon from '@mui/icons-material/Edit';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  selectDefaultLegend,
  selectHeatmapLegend,
  setDefaultLegends,
  setHeatmapLegends,
} from '../../store/UserPreferenceSlice';
import {HeatmapLegend} from '../../types/heatmapLegend';

/**
 * This component displays an edit button to access a modal. In the modal you can edit the heatmap legend.
 */
export default function HeatLegendEdit(): JSX.Element {
  const dispatch = useAppDispatch();
  const activeScenario = useAppSelector((state) => state.dataSelection.scenario);
  const legend = useAppSelector((state) => state.userPreference.selectedHeatmap);
  const presets = useAppSelector((state) => state.userPreference.heatmaps);
  const theme = useTheme();

  const [heatLegendEditOpen, setHeatLegendEditOpen] = React.useState(false);
  const heatLegendEditClicked = () => {
    setHeatLegendEditOpen(true);
  };
  const handleClick = (preset: HeatmapLegend) => {
    dispatch(selectHeatmapLegend({legend: preset}));
  };

  useEffect(() => {
    // get heatmap legend preset list from assets and select default
    fetch('assets/heatmap_legend_presets.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => {
        // interpret content as JSON
        return response.json();
      })
      .then(
        // Resolve Promise
        (presetList: HeatmapLegend[]) => {
          presetList.forEach((legend) => {
            if (legend.isNormalized) {
              legend.steps.forEach((step) => {
                step.value = step.value / legend.steps[legend.steps.length - 1].value;
              });
            }
          });
          //create default legends
          const defaultLegends: HeatmapLegend[] = [];
          const stepCount = theme.custom.scenarios[0].length - 1;
          for (let i = 0; i < theme.custom.scenarios.length; i++) {
            const steps = [];
            for (let j = 0; j < stepCount; j++) {
              steps.push({color: theme.custom.scenarios[i][stepCount - 1 - j], value: j / (stepCount - 1)});
            }
            defaultLegends.push({name: 'Default', isNormalized: true, steps});
          }
          dispatch(setDefaultLegends({legends: defaultLegends}));

          //add default preset to the front of the presetList
          presetList.unshift(defaultLegends[0]);
          // fill presets state with list
          dispatch(setHeatmapLegends({legends: presetList}));
          dispatch(selectHeatmapLegend({legend: defaultLegends[0]}));
        },
        // Reject Promise
        () => {
          console.warn('Did not receive proper heatmap legend presets');
        }
      );
    // this init should only run once on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeScenario) {
      dispatch(selectDefaultLegend({selectedScenario: activeScenario - 1}));
    }
  }, [activeScenario, dispatch]);

  return (
    <>
      <IconButton onClick={heatLegendEditClicked}>
        <EditIcon />
      </IconButton>
      <Dialog maxWidth='lg' fullWidth={true} open={heatLegendEditOpen} onClose={() => setHeatLegendEditOpen(false)}>
        <Box
          sx={{
            padding: theme.spacing(4),
            background: theme.palette.background.paper,
          }}
        >
          <Grid container>
            {presets.map((preset, i) => (
              <Grid item container xs={12} md={6} key={'legendPreset' + i.toString()}>
                <Grid item container xs={1} alignItems='center' justifyContent='flex-end'>
                  <Radio
                    checked={preset.name === legend.name}
                    name='radio-buttons'
                    value={preset.name}
                    onChange={() => handleClick(preset)}
                  />
                </Grid>
                <Grid item xs={11}>
                  <HeatLegend
                    legend={preset}
                    exposeLegend={() => {
                      return;
                    }}
                    min={0}
                    max={preset.steps[preset.steps.length - 1].value}
                    noText={preset.isNormalized}
                    id={preset.name}
                  />
                  <Typography variant='h2' align='center'>
                    {preset.name}
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Dialog>
    </>
  );
}
