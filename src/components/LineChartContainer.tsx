// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useContext, useEffect, useMemo, useState} from 'react';
import LineChart from './LineChartComponents/LineChart';
import LineChartSettings from './LineChartComponents/LineChartSettingsComponents/LineChartSettings';
import LoadingContainer from './shared/LoadingContainer';
import useTheme from '@mui/material/styles/useTheme';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {selectDate} from 'store/DataSelectionSlice';
import {setReferenceDayBottom} from 'store/LayoutSlice';
import {useTranslation} from 'react-i18next';
import {LineChartData} from 'types/lineChart';
import {InfectionData} from 'store/services/APITypes';
import {DataContext} from 'context/SelectedDataContext';
import {updateHorizontalYAxisThreshold, removeHorizontalYAxisThreshold} from 'store/UserPreferenceSlice';
export default function LineChartContainer() {
  const {t: tBackend, i18n: i18nBackend} = useTranslation('backend');
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {lineChartData, scenarios, compartments, groupFilterData} = useContext(DataContext)!;

  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const horizontalThresholds = useAppSelector((state) => state.userPreference.horizontalYAxisThresholds ?? {});
  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);
  const groups = useAppSelector((state) => state.dataSelection.groupFilters);

  const [referenceDayBottomPosition, setReferenceDayBottomPosition] = useState<number>(0);

  const yAxisLabel = useMemo(() => {
    return tBackend(`infection-states.${compartments?.find((c) => c.id === selectedCompartment)?.name}`);
  }, [compartments, selectedCompartment, tBackend]);

  const compartmentNames = useMemo(() => {
    return (
      compartments?.map((compartment) => {
        const name = i18nBackend.exists(`infection-states.${compartment.name}`, {ns: 'backend'})
          ? tBackend(`infection-states.${compartment.name}`)
          : compartment.name;
        return {id: compartment.id, name};
      }) ?? []
    );
  }, [compartments, i18nBackend, tBackend]);

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

      if (id === selectedScenario) {
        const scenario = scenarios.find((scenario) => scenario.id === id)!;
        const percentiles: Array<{lower: number; upper: number}> = [];

        if (scenario.percentiles.length > 0) {
          const bandLines = scenario.percentiles.filter((percentile) => percentile !== 50);
          for (let i = 0; i < bandLines.length / 2; i++) {
            percentiles.push({lower: bandLines[i], upper: bandLines[bandLines.length - 1 - i]});
          }
        }

        percentiles.forEach((percentile, index) => {
          lines.push({
            seriesId: `${id}-${percentile.lower}-${percentile.upper}`,
            name: `${scenariosState[id].name} (${percentile.lower} - ${percentile.upper})`,
            visible: true,
            fill: scenariosState[id]?.colors[0] ?? 'transparent',
            fillOpacity: 0.2 + 0.6 * (index / percentiles.length),
            valueYField: id + percentile.lower,
            openValueYField: id + percentile.upper,
            stroke: {strokeWidth: 0, visible: false},
            values: percentileDataToLineChartData(data, percentile.lower, percentile.upper),
          });
        });
      }

      return lines;
    });
  }, [lineChartData, scenarios, scenariosState, selectedScenario]);

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
        horizontalYAxisThreshold={horizontalThresholds[`${selectedDistrict.nuts}-${selectedCompartment}`]?.threshold}
      />
      <LineChartSettings
        selectedDistrict={selectedDistrict}
        selectedCompartment={selectedCompartment ?? ''}
        compartments={compartmentNames}
        horizontalThresholds={horizontalThresholds}
        removeHorizontalThreshold={(id: string) => dispatch(removeHorizontalYAxisThreshold(id))}
        updateHorizontalThreshold={(newThreshold) =>
          dispatch(
            updateHorizontalYAxisThreshold({
              key: `${newThreshold.district.nuts}-${newThreshold.compartment}`,
              threshold: newThreshold,
            })
          )
        }
      />
    </LoadingContainer>
  );
}

function infectionDataToLineChartData(data: InfectionData): Array<{day: string; value: number}> {
  return data
    .filter((entry) => entry.percentile === 50)
    .map((entry) => ({
      day: entry.date!,
      value: entry.value,
    }));
}

function percentileDataToLineChartData(
  data: InfectionData,
  lower: number,
  upper: number
): Array<{day: string; value: number; openValue: number}> {
  const lowerPs = data.filter((entry) => entry.percentile === lower).sort((a, b) => a.date!.localeCompare(b.date!));
  const upperPs = data.filter((entry) => entry.percentile === upper).sort((a, b) => a.date!.localeCompare(b.date!));

  return lowerPs.map((entry, i) => ({
    day: entry.date!,
    value: entry.value,
    openValue: upperPs[i].value,
  }));
}
