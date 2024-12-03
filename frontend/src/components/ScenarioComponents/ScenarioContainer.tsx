// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, darken, useTheme} from '@mui/material';
import {useContext, useEffect, useMemo, useState} from 'react';
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
import {Dictionary, dateToISOString} from 'util/util';
import {DataContext} from 'DataContext';
import {ScrollSync} from 'react-scroll-sync';
import {useBoundingclientrectRef} from 'rooks';
import {setReferenceDayTop} from 'store/LayoutSlice';
import React from 'react';
import CardContainer from './CardsComponents/CardContainer';
import CompartmentsRows from './CompartmentsComponents/CompartmentsRows';
import FilterDialogContainer from './FilterComponents/FilterDialogContainer';
import GeneralButton from './ExpandedButtonComponents/ExpandedButton';
import ReferenceDatePicker from './ReferenceDatePickerComponents.tsx/ReferenceDatePicker';
import {GroupFilter} from 'types/group';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {CardValue, FilterValue} from 'types/card';
import {setInitialVisit} from 'store/UserPreferenceSlice';

interface ScenarioContainerProps {
  /** The minimum number of compartment rows.*/
  minCompartmentsRows?: number;

  /** The maximum number of compartment rows.*/
  maxCompartmentsRows?: number;
}

/**
 * Renders the ScenarioContainer component.
 */
export default function ScenarioContainer({minCompartmentsRows = 4, maxCompartmentsRows = 6}: ScenarioContainerProps) {
  const {t} = useTranslation('backend');
  const dispatch = useAppDispatch();
  const {i18n} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const theme = useTheme();

  const {scenarios: scenarioData, compartments, referenceDateValues} = useContext(DataContext);

  const groupFilters = useAppSelector((state) => state.dataSelection.groupFilters);
  const storeCompartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const storeSelectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const storeStartDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const isInitialUserVisit = useAppSelector((state) => state.userPreference.isInitialVisit);

  const [cardValues, setCardValues] = useState<Dictionary<CardValue> | undefined>();
  const [filterValues, setFilterValues] = useState<Dictionary<FilterValue[]> | undefined>();
  const [compartmentsExpanded, setCompartmentsExpanded] = useState<boolean>(storeCompartmentsExpanded ?? false);
  const [selectedCompartment, setSelectedCompartment] = useState<string>(storeSelectedCompartment ?? 'MildInfections');
  const [startDay, setStartDay] = useState<string | null>(storeStartDay ?? '2024-07-08');
  const [resizeRef, resizeBoundingRect] = useBoundingclientrectRef();

  const scenarios = useMemo(
    () =>
      scenarioData?.map((scenario) => ({
        id: scenario.id,
        label: t(`scenario-names.${scenario.name}`),
      })) ?? [],
    [scenarioData, t]
  );

  const localization = useMemo(() => {
    return {
      formatNumber: formatNumber,
      customLang: 'backend',
    };
  }, [formatNumber]);

  // This effect updates the selected compartment in the state whenever it changes.
  useEffect(() => {
    dispatch(selectCompartment(selectedCompartment));
  }, [dispatch, selectedCompartment]);

  // This effect updates the start date in the state whenever the reference day changes.
  useEffect(() => {
    dispatch(setStartDate(startDay!));
  }, [startDay, dispatch]);

  const remainingCard = useMemo(() => {
    return scenarioSimulationDataForCard?.reduce(
      (acc: {[key: string]: CardValue}, scenarioSimulationDataCard, id) => {
        const compartments = scenarioSimulationDataCard?.results?.[0]?.compartments;
        acc[id.toString()] = {
          compartmentValues: compartments || null,
          startValues: startValues,
        };
        return acc;
      },
      {} as {[key: string]: CardValue}
    );
  }, [scenarioSimulationDataForCard, startValues]);

  /*
   * This useEffect hook is utilized to adapt the format of the scenario simulation & case data.
   * This effect takes the original data, provided by the ESID API through the context and transforms it,
   * ensuring it conforms to the new format required by the generalized Scenario cards.
   */
  useEffect(() => {
    const caseCompartments = caseScenarioData?.results?.[0]?.compartments;
    setCardValues({
      '0': {
        compartmentValues: caseCompartments || null,
        startValues: startValues,
      },
      ...remainingCard,
    });
  }, [caseScenarioData, remainingCard, startValues]);

  /*
   * This useEffect hook is used to adapting the data format for display in the filter appendage cards.
   * This effect takes the original data, provided by the ESID API through the context and transforms it,
   * ensuring it conforms to the new format required by the generalized Scenario cards.
   */
  useEffect(() => {
    if (
      !scenarioSimulationDataForCardFiltersValues ||
      scenarioSimulationDataForCardFiltersValues === undefined ||
      Object.keys(scenarioSimulationDataForCardFiltersValues).length === 0
    )
      return;

    const filterValuesTemp: Array<FilterValue[]> =
      scenarioSimulationDataForCardFiltersValues?.map((scenarioSimulation) => {
        return Object.values(groupFilters)
          .filter((groupFilter) => groupFilter.isVisible)
          .map((groupFilter) => {
            const groupResponse = scenarioSimulation?.[groupFilter.name]?.results?.[0]?.compartments || null;
            return {
              filteredTitle: groupFilter.name,
              filteredValues: groupResponse,
            };
          });
      }) || [];
    const temp: Dictionary<FilterValue[]> = {};
    getId?.forEach((id, index) => {
      temp[id.toString()] = filterValuesTemp[index];
    });
    setFilterValues(temp);
  }, [getId, groupFilters, scenarioSimulationDataForCardFiltersValues]);

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
      }

      if (isInitialUserVisit && scenarios.length > 0) {
        const baselineScenarioId = scenarios[0].id;
        setActiveScenarios((prevScenarios) => [...(prevScenarios ?? []), baselineScenarioId]);
        setSelectedScenario(baselineScenarioId);
      }
    }
    if (caseScenarioSimulationData) {
      const entries = caseScenarioSimulationData.results.map((entry) => entry.day).sort((a, b) => a.localeCompare(b));
      const firstCaseDataDay = entries[0];
      if (!minDate) {
        minDate = firstCaseDataDay;
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

    if (minDate && maxDate) {
      dispatch(setMinMaxDates({minDate, maxDate}));
    }

    // Setting the initial user visit to the data and
    if (isInitialUserVisit && scenarioListData !== undefined) {
      dispatch(setInitialVisit(false));
    }
  }, [activeScenarios, scenarioListData, dispatch, caseScenarioSimulationData, isInitialUserVisit]);

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
      <div style={{height: '100%'}} id='scenario-container'>
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
              id='scenario-datepicker-box'
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
                  compartments={compartments}
                  selectedCompartment={selectedCompartment}
                  setSelectedCompartment={(newCompartment) => dispatch(selectCompartment(newCompartment))}
                  minCompartmentsRows={minCompartmentsRows}
                  maxCompartmentsRows={maxCompartmentsRows}
                  compartmentValues={referenceDateValues}
                  localization={localization}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  padding: 1,
                  paddingRight: 3,
                  paddingLeft: 3,
                }}
              >
                <GeneralButton
                  buttonTexts={{clicked: t('less'), unclicked: t('more')}}
                  isDisabled={compartmentsMemo.length <= minCompartmentsRows}
                  handleClick={() => {
                    if (compartments.indexOf(selectedCompartment) >= minCompartmentsRows) {
                      setSelectedCompartment('MildInfections');
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
              setActiveScenarios={(newActiveScenarios) => dispatch(setActiveScenario(newActiveScenarios))}
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
              setGroupFilters={(newGroupFilters) => dispatch(setGroupFilters(newGroupFilters))}
              localization={localization}
            />
          )}
        </Box>
      </div>
    </ScrollSync>
  );
}
