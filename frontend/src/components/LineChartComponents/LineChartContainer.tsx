// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useContext, useEffect, useMemo, useState} from 'react';
import LineChart from './LineChart';
import LoadingContainer from '../shared/LoadingContainer';
import {useTheme} from '@mui/material';
import {DataContext} from '../../DataContext';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {selectDate, setGroupFilters} from 'store/DataSelectionSlice';
import {setReferenceDayBottom} from 'store/LayoutSlice';
import {useTranslation} from 'react-i18next';
import {LineChartSettings} from './LineChartSettingsComponents/LineChartSettings';
import {Dictionary} from 'util/util';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import {setHorizontalYAxisThresholds} from 'store/UserPreferenceSlice';
import {NumberFormatter} from 'util/hooks';
import {GroupFilter} from 'types/group';
import {GroupCategories, GroupSubcategories} from 'store/services/groupApi';
import {LineChartData} from 'types/lineChart';

export default function LineChartContainer() {
  const {t} = useTranslation('backend');
  const {i18n} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {
    isChartDataFetching,
    chartData,
    groupCategories,
    groupSubCategories,
  }: {
    isChartDataFetching: boolean;
    chartData: LineChartData[] | undefined;
    groupCategories: GroupCategories | undefined;
    groupSubCategories: GroupSubcategories | undefined;
  } = useContext(DataContext) || {
    isChartDataFetching: false,
    chartData: undefined,
    groupCategories: undefined,
    groupSubCategories: undefined,
  };

  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const selectedDateInStore = useAppSelector((state) => state.dataSelection.date);
  const storeHorizontalThresholds = useAppSelector((state) => state.userPreference.horizontalYAxisThresholds ?? {});
  const storeGroupFilters = useAppSelector((state) => state.dataSelection.groupFilters);
  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);

  const [selectedDate, setSelectedDate] = useState<string>(selectedDateInStore ?? '2024-08-07');
  const [referenceDayBottomPosition, setReferenceDayBottomPosition] = useState<number>(0);
  const [horizontalThresholds, sethorizontalThresholds] =
    useState<Dictionary<HorizontalThreshold>>(storeHorizontalThresholds);
  const [groupFilters, setgroupFilters] = useState<Dictionary<GroupFilter>>(storeGroupFilters);

  const yAxisLabel = useMemo(() => {
    return t(`infection-states.${selectedCompartment}`);
  }, [selectedCompartment, t]);

  const localization = useMemo(
    () => ({
      formatNumber: formatNumber,
      customLang: 'backend',
      overrides: {
        ['compartments.Infected']: 'infection-states.Infected',
        ['compartments.MildInfections']: 'infection-states.MildInfections',
        ['compartments.Hospitalized']: 'infection-states.Hospitalized',
        ['compartments.ICU']: 'infection-states.ICU',
        ['compartments.Dead']: 'infection-states.Dead',
        ['compartments.DeadV1']: 'infection-states.DeadV1',
        ['compartments.DeadV2']: 'infection-states.DeadV2',
        ['compartments.Exposed']: 'infection-states.Exposed',
        ['compartments.Recovered']: 'infection-states.Recovered',
        ['compartments.Carrier']: 'infection-states.Carrier',
        ['compartments.Susceptible']: 'infection-states.Susceptible',
        ['compartments.InfectedT']: 'infection-states.InfectedT',
        ['compartments.InfectedTV1']: 'infection-states.InfectedTV1',
        ['compartments.InfectedTV2']: 'infection-states.InfectedTV2',
        ['compartments.InfectedV1']: 'infection-states.InfectedV1',
        ['compartments.InfectedV2']: 'infection-states.InfectedV2',
        ['compartments.HospitalizedV1']: 'infection-states.HospitalizedV1',
        ['compartments.HospitalizedV2']: 'infection-states.HospitalizedV2',
        ['compartments.ICUV1']: 'infection-states.ICUV1',
        ['compartments.ICUV2']: 'infection-states.ICUV2',
        ['compartments.ExposedV1']: 'infection-states.ExposedV1',
        ['compartments.ExposedV2']: 'infection-states.ExposedV2',
        ['compartments.CarrierT']: 'infection-states.CarrierT',
        ['compartments.CarrierTV1']: 'infection-states.CarrierTV1',
        ['compartments.CarrierTV2']: 'infection-states.CarrierTV2',
        ['compartments.CarrierV1']: 'infection-states.CarrierV1',
        ['compartments.CarrierV2']: 'infection-states.CarrierV2',
        ['compartments.SusceptibleV1']: 'infection-states.SusceptibleV1',
        ['compartments.SusceptibleV2']: 'infection-states.SusceptibleV2',
        ['group-filters.categories.age']: 'group-filters.categories.age',
        ['group-filters.categories.gender']: 'group-filters.categories.gender',
        ['group-filters.groups.age_0']: 'group-filters.groups.age_0',
        ['group-filters.groups.age_1']: 'group-filters.groups.age_1',
        ['group-filters.groups.age_2']: 'group-filters.groups.age_2',
        ['group-filters.groups.age_3']: 'group-filters.groups.age_3',
        ['group-filters.groups.age_4']: 'group-filters.groups.age_4',
        ['group-filters.groups.age_5']: 'group-filters.groups.age_5',
        ['group-filters.groups.total']: 'group-filters.groups.total',
        ['group-filters.groups.female']: 'group-filters.groups.female',
        ['group-filters.groups.male']: 'group-filters.groups.male',
        ['group-filters.groups.nonbinary']: 'group-filters.groups.nonbinary',
      },
    }),
    [formatNumber]
  );

  // Set horizontal thresholds in store
  useEffect(() => {
    dispatch(setHorizontalYAxisThresholds(horizontalThresholds));
  }, [horizontalThresholds, dispatch]);

  // This effect updates the group filters in the state whenever they change.
  useEffect(() => {
    dispatch(setGroupFilters(groupFilters));
  }, [groupFilters, dispatch]);

  // Set selected date in store
  useEffect(() => {
    dispatch(selectDate(selectedDate));
    // This effect should only run when the selectedDate changes
  }, [selectedDate, dispatch]);

  // Set selected date in state when it changes in store
  useEffect(() => {
    if (selectedDateInStore) {
      setSelectedDate(selectedDateInStore);
    }
    // This effect should only run when the selectedDateInStore changes
  }, [selectedDateInStore]);

  // Set reference day in store
  useEffect(() => {
    dispatch(setReferenceDayBottom(referenceDayBottomPosition));
    // This effect should only run when the referenceDay changes
  }, [referenceDayBottomPosition, dispatch]);

  return (
    <LoadingContainer
      sx={{width: '100%', height: '100%'}}
      show={isChartDataFetching}
      overlayColor={theme.palette.background.paper}
    >
      <LineChart
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setReferenceDayBottom={setReferenceDayBottomPosition}
        lineChartData={chartData}
        minDate={minDate}
        maxDate={maxDate}
        referenceDay={referenceDay}
        yAxisLabel={yAxisLabel}
        horizontalYAxisThreshold={horizontalThresholds[`${selectedDistrict.ags}-${selectedCompartment}`]?.threshold}
      />
      <LineChartSettings
        selectedDistrict={selectedDistrict}
        selectedCompartment={selectedCompartment ?? ''}
        horizontalThresholds={horizontalThresholds}
        setHorizontalThresholds={sethorizontalThresholds}
        groupFilters={groupFilters}
        setGroupFilters={setgroupFilters}
        groupCategories={groupCategories?.results}
        groupSubCategories={groupSubCategories?.results}
        localization={localization}
      />
    </LoadingContainer>
  );
}
