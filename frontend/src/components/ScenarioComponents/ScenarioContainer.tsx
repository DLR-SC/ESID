// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, darken, useTheme} from '@mui/material';
import {Dictionary, Scenario, cardValue, filterValue} from '../../types/Cardtypes';
import {useContext, useEffect, useMemo, useState} from 'react';
import {GroupCategories, GroupSubcategories} from 'store/services/groupApi';
import {NumberFormatter} from 'util/hooks';
import {useTranslation} from 'react-i18next';
import {
  selectCompartment,
  selectScenario,
  setActiveScenario,
  setGroupFilters,
  setMinMaxDates,
  setStartDate,
  toggleCompartmentExpansion,
} from 'store/DataSelectionSlice';
import {dateToISOString} from 'util/util';
import {DataContext} from 'DataContext';
import {ScrollSync} from 'react-scroll-sync';
import {setCompartments, setScenarios} from 'store/ScenarioSlice';
import {useBoundingclientrectRef} from 'rooks';
import {setReferenceDayTop} from 'store/LayoutSlice';
import React from 'react';
import CardContainer from './CardsComponents/CardContainer';
import CompartmentsRows from './CompartmentsComponents/CompartmentsRows';
import FilterDialogContainer from './FilterComponents/FilterDialogContainer';
import GeneralButton from './ExpandedButtonComponents/ExpandedButton';
import ReferenceDatePicker from './ReferenceDatePickerComponents.tsx/ReferenceDatePicker';
import {GroupFilter, GroupResponse} from 'types/group';
import {SimulationModel, SimulationDataByNode, Simulations} from 'types/scenario';
import {CaseDataByNode} from 'types/caseData';
import {useAppDispatch, useAppSelector} from 'store/hooks';

interface ScenarioContainerProps {
  /*The minimum number of compartment rows.*/
  minCompartmentsRows?: number;

  /*The maximum number of compartment rows.*/
  maxCompartmentsRows?: number;
}

/**
 * Renders the ScenarioContainer component.
 */
export default function ScenarioContainer({minCompartmentsRows = 4, maxCompartmentsRows = 6}: ScenarioContainerProps) {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {i18n} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const theme = useTheme();

  const {
    simulationModelData,
    caseScenarioData,
    startValues,
    scenarioListData,
    scenarioSimulationDataFirstCard,
    scenarioSimulationDataFirstCardFiltersValues,
    scenarioSimulationDataSecondCard,
    scenarioSimulationDataSecondCardFiltersValues,
    caseScenarioSimulationData,
    groupCategories,
    groupSubCategories,
  }: {
    simulationModelData: SimulationModel | undefined;
    caseScenarioData: SimulationDataByNode | undefined;
    startValues: Dictionary<number> | null;
    scenarioSimulationDataFirstCard: SimulationDataByNode | undefined;
    scenarioSimulationDataSecondCard: SimulationDataByNode | undefined;
    scenarioSimulationDataFirstCardFiltersValues: Dictionary<GroupResponse> | undefined;
    scenarioSimulationDataSecondCardFiltersValues: Dictionary<GroupResponse> | undefined;
    scenarioListData: Simulations | undefined;
    caseScenarioSimulationData: CaseDataByNode | undefined;
    groupCategories: GroupCategories | undefined;
    groupSubCategories: GroupSubcategories | undefined;
  } = useContext(DataContext) || {
    simulationModelData: undefined,
    caseScenarioData: undefined,
    startValues: null,
    scenarioListData: [],
    scenarioSimulationDataFirstCard: undefined,
    scenarioSimulationDataFirstCardFiltersValues: undefined,
    scenarioSimulationDataSecondCard: undefined,
    scenarioSimulationDataSecondCardFiltersValues: undefined,
    caseScenarioSimulationData: undefined,
    groupCategories: undefined,
    groupSubCategories: undefined,
  };

  const storeGroupFilters = useAppSelector((state) => state.dataSelection.groupFilters);
  const storeCompartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
  const storeActiveScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const storeSelectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const scenariosState = useAppSelector((state) => state.scenarioList.scenarios);
  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const storeSelectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const storeStartDay = useAppSelector((state) => state.dataSelection.simulationStart);

  const [cardValues, setCardValues] = useState<Dictionary<cardValue> | undefined>();
  const [filterValues, setFilterValues] = useState<Dictionary<filterValue[]> | undefined>();
  const [groupFilters, setgroupFilters] = useState<Dictionary<GroupFilter> | undefined>(storeGroupFilters);
  const [compartmentsExpanded, setCompartmentsExpanded] = useState<boolean>(storeCompartmentsExpanded ?? false);
  const [activeScenarios, setActiveScenarios] = useState<number[] | null>(storeActiveScenarios);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(storeSelectedScenario);
  const [selectedCompartment, setSelectedCompartment] = useState<string>(storeSelectedCompartment ?? 'Infected');
  const [startDay, setStartDay] = useState<string | null>(storeStartDay ?? '2021-06-07');
  const [resizeRef, resizeBoundingRect] = useBoundingclientrectRef();

  const scenarios: Scenario[] = useMemo(() => {
    const aux: Scenario[] = [];
    aux.push({
      id: 0,
      label: `Baseline Scenario`,
    });
    for (const scenarioKey in scenariosState) {
      aux.push(scenariosState[scenarioKey]);
    }
    return aux;
  }, [scenariosState]);

  const compartmentsMemo = useMemo(() => {
    return compartments;
  }, [compartments]);

  const localization = useMemo(() => {
    return {
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
        ['tooltip']: 'infection-states.tooltip',
        ['scenario-names.Baseline Scenario']: 'scenario-names.Baseline Scenario',
        ['scenario-names.Summer 2021 Simulation 1']: 'scenario-names.Summer 2021 Simulation 1',
        ['scenario-names.Summer 2021 Simulation 2']: 'scenario-names.Summer 2021 Simulation 2',
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
    };
  }, [formatNumber]);

  // This effect updates the group filters in the state whenever they change.
  useEffect(() => {
    dispatch(setGroupFilters(groupFilters));
  }, [groupFilters, dispatch]);

  // This effect updates the compartments in the state whenever the simulation model data changes.
  useEffect(() => {
    if (simulationModelData) {
      const {compartments} = simulationModelData;
      dispatch(setCompartments(compartments));
    }
  }, [simulationModelData, dispatch]);

  // This effect updates the selected scenario in the state whenever it changes.
  useEffect(() => {
    dispatch(selectScenario(selectedScenario));
  }, [selectedScenario, dispatch]);

  // This effect updates the active scenario in the state whenever the active scenarios change.
  useEffect(() => {
    if (activeScenarios?.length == 0) dispatch(setActiveScenario(null));
    else dispatch(setActiveScenario(activeScenarios));
  }, [activeScenarios, dispatch]);

  // This effect updates the selected compartment in the state whenever it changes.
  useEffect(() => {
    dispatch(selectCompartment(selectedCompartment));
  }, [dispatch, selectedCompartment]);

  // This effect updates the start date in the state whenever the reference day changes.
  useEffect(() => {
    dispatch(setStartDate(startDay!));
  }, [startDay, dispatch]);

  /*
   * This useEffect hook is utilized to adapt the format of the scenario simulation & case data.
   * This effect takes the original data, provided by the ESID API through the context and transforms it,
   * ensuring it conforms to the new format required by the generalized Scenario cards.
   */
  useEffect(() => {
    setCardValues({
      '0': {
        compartmentValues:
          caseScenarioData && caseScenarioData.results.length > 0 ? caseScenarioData.results[0].compartments : null,
        startValues: startValues,
      },
      '1': {
        compartmentValues:
          scenarioSimulationDataFirstCard && scenarioSimulationDataFirstCard.results.length > 0
            ? scenarioSimulationDataFirstCard.results[0].compartments
            : null,
        startValues: startValues,
      },
      '2': {
        compartmentValues:
          scenarioSimulationDataSecondCard && scenarioSimulationDataSecondCard.results.length > 0
            ? scenarioSimulationDataSecondCard.results[0].compartments
            : null,
        startValues: startValues,
      },
    });
  }, [caseScenarioData, scenarioSimulationDataFirstCard, scenarioSimulationDataSecondCard, startValues]);

  /*
   * This useEffect hook is used to adapting the data format for display in the filter appendage cards.
   * This effect takes the original data, provided by the ESID API through the context and transforms it,
   * ensuring it conforms to the new format required by the generalized Scenario cards.
   */
  useEffect(() => {
    if (
      !scenarioSimulationDataFirstCardFiltersValues ||
      scenarioSimulationDataFirstCardFiltersValues === undefined ||
      Object.keys(scenarioSimulationDataFirstCardFiltersValues).length === 0 ||
      !scenarioSimulationDataSecondCardFiltersValues ||
      scenarioSimulationDataSecondCardFiltersValues === undefined ||
      Object.keys(scenarioSimulationDataSecondCardFiltersValues).length === 0
    )
      return;

    const filterValue1: filterValue[] = Object.values(groupFilters!)
      .filter((groupFilter) => groupFilter.isVisible)
      .map((groupFilter) => {
        const groupResponse =
          scenarioSimulationDataFirstCardFiltersValues?.[groupFilter.name]?.results?.[0]?.compartments || null;
        return {
          filteredTitle: groupFilter.name,
          filteredValues: groupResponse,
        };
      });

    const filterValue2: filterValue[] = Object.values(groupFilters!)
      .filter((groupFilter) => groupFilter.isVisible)
      .map((groupFilter) => {
        const groupResponse =
          scenarioSimulationDataSecondCardFiltersValues?.[groupFilter.name]?.results?.[0]?.compartments || null;
        return {
          filteredTitle: groupFilter.name,
          filteredValues: groupResponse,
        };
      });

    setFilterValues({
      '1': filterValue1,
      '2': filterValue2,
    });
  }, [scenarioSimulationDataFirstCardFiltersValues, scenarioSimulationDataSecondCardFiltersValues, groupFilters]);

  // This effect calculates the start and end days from the case and scenario data.
  useEffect(() => {
    let minDate: string | null = null;
    let maxDate: string | null = null;

    if (scenarioListData) {
      const scenarios = scenarioListData.results.map((scenario) => ({
        id: scenario.id,
        label: scenario.description,
      }));
      dispatch(setScenarios(scenarios));

      if (scenarios.length > 0) {
        // The simulation data (results) are only available one day after the start day onward.
        const startDay = new Date(scenarioListData.results[0].startDay);
        startDay.setUTCDate(startDay.getUTCDate() + 1);

        const endDay = new Date(startDay);
        endDay.setDate(endDay.getDate() + scenarioListData.results[0].numberOfDays - 1);

        minDate = dateToISOString(startDay);
        maxDate = dateToISOString(endDay);

        dispatch(setStartDate(minDate));
      }
    }

    if (caseScenarioSimulationData) {
      const entries = caseScenarioSimulationData.results.map((entry) => entry.day).sort((a, b) => a.localeCompare(b));
      if (entries) {
        const firstCaseDataDay = entries[0];
        if (!minDate) {
          minDate = firstCaseDataDay;
          dispatch(setStartDate(minDate));
        } else {
          minDate = minDate.localeCompare(firstCaseDataDay) < 0 ? minDate : firstCaseDataDay;
        }

        const lastCaseDataDay = entries.slice(-1)[0];
        if (!maxDate) {
          maxDate = lastCaseDataDay;
        } else {
          maxDate = maxDate.localeCompare(lastCaseDataDay) > 0 ? maxDate : lastCaseDataDay;
        }
      }
    }

    if (minDate && maxDate) {
      dispatch(setMinMaxDates({minDate, maxDate}));
    }
  }, [activeScenarios, scenarioListData, dispatch, caseScenarioSimulationData]);

  /*
   * This useEffect hook is utilized to enable the connection between the dashed border line of the box
   * which contains the reference day and the compartments and the line in the line chart.
   */
  useEffect(() => {
    const x = resizeBoundingRect?.x ?? 0;
    const w = resizeBoundingRect?.width ?? 0;
    dispatch(setReferenceDayTop(x + w));
  }, [dispatch, resizeBoundingRect]);

  return (
    <ScrollSync>
      <div style={{height: '100%'}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            height: '100%',
            overflowY: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexGrow: 1,
              borderRight: `1px solid`,
              borderColor: 'divider',
              overflowX: 'hidden',
              height: '100%',
              justifyContent: 'left',
            }}
            className='hide-scrollbar'
          >
            <Box
              ref={resizeRef}
              className='datepicker-paddingTop'
              sx={{
                borderRight: `2px dashed ${darken(theme.palette.divider, 0.25)}`,
                flexDirection: 'column',
                justifyContent: 'center',
                borderTop: '2px solid transparent',
                width: '274px',
                boxSizing: 'border-box',
                gap: 1,
                height: '100%',
              }}
            >
              <ReferenceDatePicker
                startDay={startDay}
                setStartDay={setStartDay}
                minDate={useAppSelector((state) => state.dataSelection.minDate)}
                maxDate={useAppSelector((state) => state.dataSelection.maxDate)}
                localization={localization}
              />
              <Box
                sx={{
                  height: compartmentsExpanded ? (240 / 6) * maxCompartmentsRows : 'auto',
                  paddingBottom: 2,
                  width: '272px',
                }}
              >
                <CompartmentsRows
                  compartmentsExpanded={compartmentsExpanded}
                  compartments={compartmentsMemo}
                  selectedCompartment={selectedCompartment}
                  setSelectedCompartment={setSelectedCompartment}
                  minCompartmentsRows={minCompartmentsRows}
                  maxCompartmentsRows={maxCompartmentsRows}
                  compartmentValues={startValues}
                  localization={localization}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  padding: 1,
                  paddingRight: 3,
                  paddingLeft: 3,
                  marginTop: 3,
                }}
              >
                <GeneralButton
                  buttonTexts={{clicked: t('less'), unclicked: t('more')}}
                  isDisabled={() => compartmentsMemo.length < 5}
                  handleClick={() => {
                    if (compartments.indexOf(selectedCompartment) >= 4) {
                      setSelectedCompartment('Infected');
                    }
                    dispatch(toggleCompartmentExpansion());
                    setCompartmentsExpanded(!compartmentsExpanded);
                  }}
                  isExpanded={compartmentsExpanded}
                />
              </Box>
            </Box>
            <CardContainer
              compartmentsExpanded={compartmentsExpanded}
              cardValues={cardValues}
              filterValues={filterValues}
              selectedCompartment={selectedCompartment}
              scenarios={scenarios}
              compartments={compartmentsMemo}
              activeScenarios={activeScenarios}
              setActiveScenarios={setActiveScenarios}
              minCompartmentsRows={minCompartmentsRows}
              maxCompartmentsRows={maxCompartmentsRows}
              localization={localization}
              selectedScenario={selectedScenario}
              setSelectedScenario={setSelectedScenario}
              groupFilters={groupFilters}
            />
          </Box>
          {groupCategories && groupCategories.results && groupSubCategories && groupSubCategories.results && (
            <FilterDialogContainer
              groupFilters={groupFilters}
              groupCategories={groupCategories.results}
              groupSubCategories={groupSubCategories.results}
              setGroupFilters={setgroupFilters}
              localization={localization}
            />
          )}
        </Box>
      </div>
    </ScrollSync>
  );
}
