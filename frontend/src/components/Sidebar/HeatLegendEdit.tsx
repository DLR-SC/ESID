import React, {useEffect} from 'react';
import {useTheme} from '@mui/material/styles';
import {
  Box,
  Dialog,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
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

  //modal state
  const [heatLegendEditOpen, setHeatLegendEditOpen] = React.useState(false);
  const heatLegendEditClicked = () => {
    setHeatLegendEditOpen(true);
  };

  const handleChange = (event: SelectChangeEvent) => {
    const preset = presets.find((preset) => preset.name == event.target.value);
    if (preset) {
      dispatch(selectHeatmapLegend({legend: preset}));
    }
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
                //set step to normalized values
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
          // select default legend
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
      //change the default Legend according to the active Scenario
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
          <FormControl fullWidth>
            <InputLabel id='heatmap-select-label'>Legend</InputLabel>
            <Select
              labelId='heatmap-select-label'
              id='heatmap-select'
              value={legend.name}
              onChange={handleChange}
              label='Legend'
            >
              {presets.map((preset, i) => (
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
                        noText={preset.isNormalized}
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
        </Box>
      </Dialog>
    </>
  );
}
