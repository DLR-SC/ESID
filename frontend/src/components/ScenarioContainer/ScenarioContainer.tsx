// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, darken, useTheme} from '@mui/material';
import {Dictionary, Scenario, cardValue, filterValue} from '../../types/Cardtypes';
import CardContainer from '../CardsComponents/CardContainer';
import FilterDialogContainer from '../FilterComponents/FilterDialogContainer';
import {useContext, useEffect, useMemo, useState} from 'react';
import {GroupFilter} from '../../types/Filtertypes';
import CompartmentsRows from '../CompartmentsComponents/CompartmentsRows';
import GeneralButton from '../GeneralButtonComponents/GeneralButton';
import ReferenceDatePicker from '../ReferenceDatePickerComponents.tsx/ReferenceDatePicker';
import {NumberFormatter} from 'util/hooks';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {
  selectCompartment,
  selectScenario,
  setActiveScenario,
  setGroupFilters,
  setMinMaxDates,
  setStartDate,
  toggleCompartmentExpansion,
  toggleScenario,
} from 'store/DataSelectionSlice';
import {dateToISOString} from 'util/util';
import {DataContext} from 'DataContext';
import {ScrollSync} from 'react-scroll-sync';
import {setCompartments, setScenarios} from 'store/ScenarioSlice';
import {useBoundingclientrectRef} from 'rooks';
import {setReferenceDayTop} from 'store/LayoutSlice';
import React from 'react';

interface ScenarioContainerProps {
  minCompartmentsRows?: number;
  maxCompartmentsRows?: number;
}

export default function ScenarioContainer({minCompartmentsRows = 4, maxCompartmentsRows = 6}: ScenarioContainerProps) {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {i18n} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const theme = useTheme();
  const context = useContext(DataContext);

  const storeGroupFilters = useAppSelector((state) => state.dataSelection.groupFilters);
  const storeCompartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
  const storeActiveScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const storeSelectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const scenariosState = useAppSelector((state) => state.scenarioList.scenarios);
  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const storeSelectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const storeReferenceDay = useAppSelector((state) => state.dataSelection.simulationStart);

  const [cardValues, setCardValues] = useState<Dictionary<cardValue> | undefined>();
  const [filterValues, setFilterValues] = useState<Dictionary<filterValue[]> | undefined>();
  const [groupFilters, setgroupFilters] = useState<Dictionary<GroupFilter> | undefined>(storeGroupFilters);
  const [compartmentsExpanded, setCompartmentsExpanded] = useState<boolean>(storeCompartmentsExpanded ?? false);
  const [activeScenarios, setActiveScenarios] = useState<number[] | null>(storeActiveScenarios);
  const [selectedScenario, setSelectedScenario] = useState<number>(storeSelectedScenario ?? 0);
  const [selectedCompartment, setSelectedCompartment] = useState<string>(storeSelectedCompartment ?? 'Infected');
  const [referenceDay, setReferenceDay] = useState<string | null>(storeReferenceDay ?? '06-07-2021');
  const [resizeRef, resizeBoundingRect] = useBoundingclientrectRef();

  const scenarios: Scenario[] = useMemo(() => {
    const aux: Scenario[] = [];
    aux.push({
      id: 0,
      label: t(`Baseline Scenario`),
    });
    for (const scenarioKey in scenariosState) {
      aux.push(scenariosState[scenarioKey]);
    }
    return aux;
  }, [scenariosState, t]);

  const compartmentsMemo = useMemo(() => {
    return compartments;
  }, [compartments]);

  useEffect(() => {
    dispatch(setGroupFilters(groupFilters));
  }, [groupFilters, dispatch]);

  useEffect(() => {
    if (context.simulationModelData) {
      const {compartments} = context.simulationModelData;
      dispatch(setCompartments(compartments));
    }
  }, [context.simulationModelData, dispatch]);

  useEffect(() => {
    dispatch(selectScenario(selectedScenario));
  }, [selectedScenario, dispatch]);

  useEffect(() => {
    dispatch(setActiveScenario(activeScenarios));
  }, [activeScenarios, dispatch]);

  useEffect(() => {
    dispatch(selectCompartment(selectedCompartment));
  }, [dispatch, selectedCompartment]);

  useEffect(() => {
    setCardValues({
      '0': {
        compartmentValues:
          context.caseScenarioData && context.caseScenarioData.results.length > 0
            ? context.caseScenarioData.results[0].compartments
            : null,
        startValues: context.startValues,
      },
      '1': {
        compartmentValues:
          context.scenarioSimulationDataFirstCard && context.scenarioSimulationDataFirstCard.results.length > 0
            ? context.scenarioSimulationDataFirstCard.results[0].compartments
            : null,
        startValues: context.startValues,
      },
      '2': {
        compartmentValues:
          context.scenarioSimulationDataSecondCard && context.scenarioSimulationDataSecondCard.results.length > 0
            ? context.scenarioSimulationDataSecondCard.results[0].compartments
            : null,
        startValues: context.startValues,
      },
    });
  }, [
    context.caseScenarioData,
    context.scenarioSimulationDataFirstCard,
    context.scenarioSimulationDataSecondCard,
    context.startValues,
  ]);

  useEffect(() => {
    if (
      !context.scenarioSimulationDataFirstCardFiltersValues ||
      context.scenarioSimulationDataFirstCardFiltersValues === undefined ||
      Object.keys(context.scenarioSimulationDataFirstCardFiltersValues).length === 0 ||
      !context.scenarioSimulationDataSecondCardFiltersValues ||
      context.scenarioSimulationDataSecondCardFiltersValues === undefined ||
      Object.keys(context.scenarioSimulationDataSecondCardFiltersValues).length === 0
    )
      return;

    const filterValue1: filterValue[] = Object.values(groupFilters!)
      .filter((groupFilter) => groupFilter.isVisible)
      .map((groupFilter) => {
        const groupResponse =
          context.scenarioSimulationDataFirstCardFiltersValues?.[groupFilter.name]?.results?.[0]?.compartments || null;
        return {
          filteredTitle: groupFilter.name,
          filteredValues: groupResponse,
        };
      });

    const filterValue2: filterValue[] = Object.values(groupFilters!)
      .filter((groupFilter) => groupFilter.isVisible)
      .map((groupFilter) => {
        const groupResponse =
          context.scenarioSimulationDataSecondCardFiltersValues?.[groupFilter.name]?.results?.[0]?.compartments || null;
        return {
          filteredTitle: groupFilter.name,
          filteredValues: groupResponse,
        };
      });

    setFilterValues({
      '1': filterValue1,
      '2': filterValue2,
    });
  }, [
    context.scenarioSimulationDataFirstCardFiltersValues,
    context.scenarioSimulationDataSecondCardFiltersValues,
    groupFilters,
  ]);

  useEffect(() => {
    if (referenceDay) {
      dispatch(setStartDate(dateToISOString(new Date(referenceDay))));
    }
  }, [referenceDay, dispatch]);

  useEffect(() => {
    let minDate: string | null = null;
    let maxDate: string | null = null;

    if (context.scenarioListData) {
      const scenarios = context.scenarioListData.results.map((scenario) => ({
        id: scenario.id,
        label: scenario.description,
      }));
      dispatch(setScenarios(scenarios));

      //activate all scenarios initially
      if (!activeScenarios) {
        scenarios.forEach((scenario) => {
          dispatch(toggleScenario(scenario.id));
        });
      }

      if (scenarios.length > 0) {
        // The simulation data (results) are only available one day after the start day onward.
        const startDay = new Date(context.scenarioListData.results[0].startDay);
        startDay.setUTCDate(startDay.getUTCDate() + 1);

        const endDay = new Date(startDay);
        endDay.setDate(endDay.getDate() + context.scenarioListData.results[0].numberOfDays - 1);

        minDate = dateToISOString(startDay);
        maxDate = dateToISOString(endDay);

        dispatch(setStartDate(minDate));
      }
    }

    if (context.caseScenarioSimulationData) {
      const entries = context.caseScenarioSimulationData.results
        .map((entry) => entry.day)
        .sort((a, b) => a.localeCompare(b));
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
  }, [activeScenarios, context.scenarioListData, dispatch, context.caseScenarioSimulationData]);

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
            paddingTop: 1,
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
              sx={{
                borderRight: `2px dashed ${darken(theme.palette.divider, 0.25)}`,
                flexDirection: 'column',
                justifyContent: 'center',
                borderTop: '2px solid transparent',
                width: '274px',
                boxSizing: 'border-box',
                gap: 1,
                paddingTop: '29px',
                height: '100%',
              }}
            >
              <ReferenceDatePicker
                referenceDay={referenceDay}
                setReferenceDay={setReferenceDay}
                minDate={useAppSelector((state) => state.dataSelection.minDate)}
                maxDate={useAppSelector((state) => state.dataSelection.maxDate)}
              />
              <Box
                sx={{
                  height: compartmentsExpanded ? (248 / 6) * maxCompartmentsRows : 'auto',
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
                  compartmentValues={context.startValues}
                  localization={{numberFormatter: formatNumber}}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  padding: 1,
                  paddingRight: 3,
                  paddingLeft: 3,
                  marginTop: 3,
                  marginBottom: 2,
                }}
              >
                <GeneralButton
                  buttonTexts={{expanded: t('less'), collapsed: t('more')}}
                  isDisabled={() => compartmentsMemo.length < 5}
                  handleClick={() => {
                    if (compartments.indexOf(selectedCompartment) >= 4) {
                      setSelectedCompartment('Infected');
                    }
                    dispatch(toggleCompartmentExpansion());
                    setCompartmentsExpanded(!compartmentsExpanded);
                  }}
                  isExpanded={compartmentsExpanded}
                  localization={{}}
                />
              </Box>
              <Box sx={{height: 10}} />
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
              localization={{numberFormatter: formatNumber}}
              selectedScenario={selectedScenario}
              setSelectedScenario={setSelectedScenario}
              groupFilters={groupFilters}
            />
          </Box>
          {context.groupCategories &&
            context.groupCategories.results &&
            context.groupSubCategories &&
            context.groupSubCategories.results && (
              <FilterDialogContainer
                groupFilters={groupFilters}
                groupCategories={context.groupCategories.results}
                groupSubCategories={context.groupSubCategories.results}
                setGroupFilters={setgroupFilters}
                localization={{}}
              />
            )}
        </Box>
      </div>
    </ScrollSync>
  );
}
