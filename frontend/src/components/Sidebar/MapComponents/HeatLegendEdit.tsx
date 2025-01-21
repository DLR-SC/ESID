// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import EditIcon from '@mui/icons-material/Edit';
import {
  useTheme,
  Typography,
  IconButton,
  MenuItem,
  FormControl,
  Dialog,
  Button,
  Box,
  Grid,
  Tooltip,
} from '@mui/material';
import {HeatmapLegend} from 'types/heatmapLegend';
import {Localization} from 'types/localization';
import {useTranslation} from 'react-i18next';

interface HeatLegendEditProps {
  /**
   * Function to set a new heatmap legend.
   */
  setSelectedLegend: (legend: HeatmapLegend) => void;

  /**
   * The current heatmap legend to be edited.
   */
  selectedLegend: HeatmapLegend;

  /**
   * The available legends.
   */
  legends: Array<HeatmapLegend>;

  /**
   * Optional localization settings for the component.
   * Includes number formatting and language overrides.
   */
  localization?: Localization;
}

/**
 * React Component to render a Heatmap Legend Editor.
 * @returns {JSX.Element} JSX Element to render the Heatmap Legend Editor.
 */
export default function HeatLegendEdit({
  setSelectedLegend,
  selectedLegend,
  legends,
  localization,
}: HeatLegendEditProps): JSX.Element {
  const theme = useTheme();
  const {t: defaultT} = useTranslation();

  const memoizedLocalization = useMemo(() => {
    return (
      localization || {
        formatNumber: (value) => value.toLocaleString(),
        customLang: 'global',
        overrides: {},
      }
    );
  }, [localization]);

  const {t: customT} = useTranslation(memoizedLocalization.customLang);

  // modal state
  const [heatLegendEditOpen, setHeatLegendEditOpen] = React.useState(false);

  // Try to select a heatlegend using the given name.
  const selectLegendByName = useCallback(
    (name: string) => {
      const preset = legends.find((legend) => legend.name === name);
      if (preset) {
        setSelectedLegend(preset);
      }
    },
    [legends, setSelectedLegend]
  );

  useEffect(() => {
    selectLegendByName(selectedLegend.name);
  }, [legends, selectLegendByName, selectedLegend.name]);

  return (
    <>
      <Tooltip
        title={
          memoizedLocalization.overrides?.['heatlegend.edit']
            ? customT(memoizedLocalization.overrides['heatlegend.edit'])
            : defaultT('heatlegend.edit')
        }
        placement='right'
        arrow
      >
        <IconButton
          color={'primary'}
          onClick={() => setHeatLegendEditOpen(true)}
          aria-label={
            memoizedLocalization.overrides?.['heatlegend.edit']
              ? customT(memoizedLocalization.overrides['heatlegend.edit'])
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
                memoizedLocalization.overrides?.['heatlegend.edit']
                  ? customT(memoizedLocalization.overrides['heatlegend.edit'])
                  : defaultT('heatlegend.edit')
              }
              value={selectedLegend.name}
              onChange={(event: SelectChangeEvent) => selectLegendByName(event.target.value)}
            >
              {legends.map((preset, i) => (
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
              {memoizedLocalization.overrides?.['okay']
                ? customT(memoizedLocalization.overrides['okay'])
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
