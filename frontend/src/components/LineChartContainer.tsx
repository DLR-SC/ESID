// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useContext, useEffect, useMemo, useState} from 'react';
import LineChart from './LineChartComponents/LineChart';
import LoadingContainer from './shared/LoadingContainer';
import {useTheme} from '@mui/material';
import {DataContext} from '../DataContext';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {selectDate} from 'store/DataSelectionSlice';
import {setReferenceDayBottom} from 'store/LayoutSlice';
import {useTranslation} from 'react-i18next';
import {LineChartData} from '../types/lineChart';
import {InfectionData} from '../store/services/APITypes';

export default function LineChartContainer() {
  const {t} = useTranslation('backend');
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {lineChartData, scenarios, compartments} = useContext(DataContext);

  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);

  const [referenceDayBottomPosition, setReferenceDayBottomPosition] = useState<number>(0);

  const yAxisLabel = useMemo(() => {
    return t(`infection-states.${compartments?.find((c) => c.id === selectedCompartment)?.name}`);
  }, [compartments, selectedCompartment, t]);

  const mappedLineChartData = useMemo(() => {
    return Object.entries(lineChartData ?? {}).flatMap(([id, data]) => {
      const lines: Array<LineChartData> = [];

      lines.push({
        seriesId: id,
        name: scenariosState[id].name,
        visible: true,
        stroke: {
          color: scenariosState[id]?.colors[0] ?? 'transparent',
        },
        valueYField: id,
        values: infectionDataToLineChartData(data),
      });

      const percentiles: Array<{lower: string; upper: string}> = [];

      if (data.length > 0) {
        const bandLines = Object.keys(data[0]).filter((percentile) => percentile !== '50');
        for (let i = 0; i < bandLines.length / 2; i++) {
          percentiles.push({lower: bandLines[i], upper: bandLines[bandLines.length - 1 - i]});
        }
      }

      percentiles.forEach((percentile, index) => {
        lines.push({
          seriesId: `${id}-${percentile.lower}-${percentile.upper}`,
          name: scenarios?.find((scenario) => scenario.id === id)?.name,
          visible: true,
          fill: scenariosState[id]?.colors[0] ?? 'transparent',
          fillOpacity: 0.2 + 0.6 * (index / percentiles.length),
          valueYField: 'percentileUp',
          openValueYField: 'percentileDown',
          stroke: {strokeWidth: 0},
          values: infectionDataToLineChartData(data),
        });
      });

      return lines;
    });
  }, [lineChartData, scenarios, scenariosState]);

  // Set reference day in store
  useEffect(() => {
    dispatch(setReferenceDayBottom(referenceDayBottomPosition));
    // This effect should only run when the referenceDay changes
  }, [referenceDayBottomPosition, dispatch]);

  return (
    <LoadingContainer
      sx={{width: '100%', height: '100%'}}
      show={lineChartData === undefined}
      overlayColor={theme.palette.background.paper}
    >
      <LineChart
        selectedDate={selectedDate}
        setSelectedDate={(newDate) => dispatch(selectDate(newDate))}
        setReferenceDayBottom={setReferenceDayBottomPosition}
        lineChartData={mappedLineChartData}
        minDate={minDate}
        maxDate={maxDate}
        referenceDay={referenceDay}
        yAxisLabel={yAxisLabel}
      />
    </LoadingContainer>
  );
}

function infectionDataToLineChartData(
  data: InfectionData
  // percentiles: Array<string>
): Array<{day: string; value: number | Array<number>}> {
  return data.map((entry) => ({
    day: entry.date!,
    value: entry.value,
  }));
}
