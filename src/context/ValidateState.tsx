// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {ReactNode, useEffect, useMemo} from 'react';

import {BaseData} from 'context/BaseDataContext';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import {
  addScenario,
  orderScenarios,
  removeScenario,
  selectCompartment,
  selectDate,
  selectDistrict,
  selectScenario,
  setMinMaxDates,
  setStartDate,
  updateScenario,
} from 'store/DataSelectionSlice';
import {Compartments, Nodes, ScenarioPreview, Scenarios} from 'store/services/APITypes';
import {useTranslation} from 'react-i18next';
import theme from 'util/Theme';
import SelectedDataContext from 'context/SelectedDataContext';

/**
 * Validates the application state based on the provided data and renders appropriate content, either the children
 * within a valid context or an error message indicating invalid state details.
 */
export default function ValidateState(props: {baseData: BaseData; children: ReactNode}) {
  // 1. Select a default district.
  const validatedDistrictSelection = useValidateDistrictSelection(props.baseData.nodes);

  // 1. Select a default compartment.
  const validatedCompartmentSelection = useValidateCompartmentSelection(props.baseData.compartments);

  // 1. Sync the local and remote scenario states.
  const scenariosSynced = useSyncScenarios(props.baseData.scenarios);

  // 2. Validate case data and baseline scenario state.
  const validatedSpecialScenarios = useValidateSpecialScenarios(props.baseData.scenarios, scenariosSynced);

  // 2. Order scenarios.
  const scenariosOrdered = useValidateScenarioOrder(props.baseData.scenarios, scenariosSynced);

  // 2. Set a reference date.
  const validatedReferenceDate = useValidateReferenceDate(props.baseData.scenarios, scenariosSynced);

  // 2. Set date range.
  const validatedDateRange = useValidateDateRange(props.baseData.scenarios, scenariosSynced);

  // 3. Select a date.
  const validatedSelectedDate = useValidateDate(validatedDateRange);

  // 3. Select a default scenario.
  const validatedSelectedScenario = useValidateSelectedScenario(validatedSpecialScenarios && scenariosOrdered);

  const validState = useMemo(
    () =>
      validatedDistrictSelection &&
      validatedCompartmentSelection &&
      scenariosSynced &&
      validatedSpecialScenarios &&
      scenariosOrdered &&
      validatedReferenceDate &&
      validatedDateRange &&
      validatedSelectedDate &&
      validatedSelectedScenario,
    [
      scenariosOrdered,
      scenariosSynced,
      validatedCompartmentSelection,
      validatedDateRange,
      validatedDistrictSelection,
      validatedReferenceDate,
      validatedSelectedDate,
      validatedSelectedScenario,
      validatedSpecialScenarios,
    ]
  );

  if (validState) {
    return <SelectedDataContext baseData={props.baseData}>{props.children}</SelectedDataContext>;
  }

  return (
    <div>
      <h1>Invalid state</h1>
      {!validatedDistrictSelection && <p>No district selected</p>}
      {!validatedCompartmentSelection && <p>No compartment selected</p>}
      {!scenariosSynced && <p>Scenarios not synchronized</p>}
      {!validatedSpecialScenarios && <p>Special scenarios not properly configured</p>}
      {!scenariosOrdered && <p>Scenarios not properly ordered</p>}
      {!validatedReferenceDate && <p>Reference date not set</p>}
      {!validatedDateRange && <p>Date range not properly set</p>}
      {!validatedSelectedDate && <p>Selected date not valid</p>}
      {!validatedSelectedScenario && <p>No valid scenario selected</p>}
    </div>
  );
}

/**
 * Synchronizes the scenarios from the API with the application's state. This function ensures that the scenarios stored
 * in the application's state match the provided API scenarios. It removes obsolete scenarios and adds new ones based on
 * the provided data.
 */
function useSyncScenarios(apiScenarios: Scenarios): boolean {
  const {t, i18n} = useTranslation('backend');
  const dispatch = useAppDispatch();

  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);

  const valid = useMemo(
    () =>
      apiScenarios.length === Object.keys(scenariosState).length &&
      apiScenarios.every((scenario) => scenariosState[scenario.id]),
    [apiScenarios, scenariosState]
  );

  useEffect(() => {
    if (valid) return;

    // Remove scenarios that are no longer in the API
    for (const [id, _] of Object.entries(scenariosState)) {
      if (!apiScenarios.find((s) => s.id === id)) {
        dispatch(removeScenario(id));
      }
    }

    // Add scenarios that are not in the state yet
    for (const scenario of apiScenarios) {
      if (!scenariosState[scenario.id]) {
        dispatch(
          addScenario({
            id: scenario.id,
            state: {
              name: i18n.exists(`scenario-names.${scenario.name}`, {ns: 'backend'})
                ? t(`scenario-names.${scenario.name}`)
                : scenario.name,
              description: scenario.description,
              visibility: 'hidden',
              colors: [],
            },
          })
        );
      }
    }
  }, [dispatch, i18n, apiScenarios, scenariosState, t, valid]);

  return valid;
}

/**
 * Validates and updates the visibility states for specific scenarios based on their current visibility and synchronized
 * state. Ensures scenarios are correctly set to a visible state if needed.
 */
function useValidateSpecialScenarios(apiScenarios: Scenarios, scenariosSynced: boolean): boolean {
  const dispatch = useAppDispatch();
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);

  const caseData = apiScenarios.find((scenario) => scenario.name === 'casedata');
  const baseLine = apiScenarios.find((scenario) => scenario.name === 'baseline');

  const valid = useMemo(
    () =>
      scenariosSynced &&
      (caseData
        ? scenariosState[caseData.id].visibility === 'faceUp' || scenariosState[caseData.id].visibility === 'faceDown'
        : true) &&
      (baseLine
        ? scenariosState[baseLine.id].visibility === 'faceUp' || scenariosState[baseLine.id].visibility === 'faceDown'
        : true),
    [baseLine, caseData, scenariosState, scenariosSynced]
  );

  useEffect(() => {
    if (!scenariosSynced || valid) return;

    if (
      caseData &&
      (scenariosState[caseData.id].visibility === 'hidden' || scenariosState[caseData.id].visibility === 'inLibrary')
    ) {
      dispatch(updateScenario({id: caseData.id, state: {visibility: 'faceUp', colors: theme.custom.scenarios[0]}}));
    }

    if (
      baseLine &&
      (scenariosState[baseLine.id].visibility === 'hidden' || scenariosState[baseLine.id].visibility === 'inLibrary')
    ) {
      dispatch(updateScenario({id: baseLine.id, state: {visibility: 'faceUp', colors: theme.custom.scenarios[1]}}));
    }
  }, [baseLine, caseData, dispatch, scenariosState, scenariosSynced, valid]);

  return valid;
}

/**
 * Validates and ensures the correct order of scenarios based on predefined criteria.
 *
 * This hook checks if the scenarios from the API match the expected order within the application state.
 * If the scenarios are out of order, it dispatches an action to reorder them correctly.
 */
function useValidateScenarioOrder(apiScenarios: Scenarios, scenariosSynced: boolean): boolean {
  const dispatch = useAppDispatch();
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);

  const caseData = apiScenarios.find((scenario) => scenario.name === 'casedata');
  const baseLine = apiScenarios.find((scenario) => scenario.name === 'baseline');

  const ordered = useMemo(
    () =>
      scenariosSynced &&
      (caseData ? Object.keys(scenariosState)[0] === caseData.id : true) &&
      (baseLine ? Object.keys(scenariosState)[1] === baseLine.id : true),
    [baseLine, caseData, scenariosState, scenariosSynced]
  );

  useEffect(() => {
    if (!scenariosSynced || ordered) return;

    const scenarios = Object.entries(scenariosState);

    const orderedIds = [
      ...(caseData ? [caseData.id] : []),
      ...(baseLine ? [baseLine.id] : []),
      ...scenarios.map(([id, _]) => id).filter((id) => id !== caseData?.id && id !== baseLine?.id),
    ];

    if (orderedIds.length > 0) {
      dispatch(orderScenarios(orderedIds));
    }
  }, [baseLine, caseData, dispatch, ordered, scenariosState, scenariosSynced]);

  return ordered;
}

/**
 * Validates the selected scenario based on the state of scenarios and their visibility.
 * Ensures that a valid scenario is selected if none is selected or if the visibility constraints are not met.
 */
function useValidateSelectedScenario(scenariosValidated: boolean): boolean {
  const dispatch = useAppDispatch();
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);

  const valid = useMemo(
    () =>
      scenariosValidated &&
      (Object.values(scenariosState).every((scenario) => scenario.visibility !== 'faceUp') ||
        (selectedScenario !== null && scenariosState[selectedScenario].visibility === 'faceUp')),
    [scenariosState, scenariosValidated, selectedScenario]
  );

  useEffect(() => {
    if (!scenariosValidated || valid) return;

    if (!selectedScenario || scenariosState[selectedScenario].visibility !== 'faceUp') {
      const faceUpScenarios = Object.entries(scenariosState)
        .filter(([_, scenario]) => scenario.visibility === 'faceUp')
        .map(([id, _]) => id);

      dispatch(selectScenario(faceUpScenarios.length > 0 ? faceUpScenarios[faceUpScenarios.length - 1] : null));
    }
  }, [dispatch, scenariosState, selectedScenario, scenariosValidated, valid]);

  return valid;
}

/**
 * Validates and manages the selection of a district. If no district is selected, it defaults the selection to a
 * specified node (e.g., Germany).
 */
function useValidateDistrictSelection(nodes: Nodes): boolean {
  const dispatch = useAppDispatch();
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district.id);

  useEffect(() => {
    if (selectedDistrict !== '') return;

    const GERMANY_NODE_ID = '00000';

    const germanyNode = nodes.find((node) => node.name === GERMANY_NODE_ID);
    if (germanyNode) {
      dispatch(selectDistrict({...germanyNode, type: ''}));
    }
  }, [dispatch, nodes, selectedDistrict]);

  return selectedDistrict !== '';
}

/**
 * Custom hook to validate the selection of a compartment. Ensures at least one compartment is selected by dispatching
 * an action to select the first compartment if none is selected.
 */
function useValidateCompartmentSelection(compartments: Compartments): boolean {
  const dispatch = useAppDispatch();
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);

  useEffect(() => {
    if (selectedCompartment) return;

    if (compartments.length > 0) {
      dispatch(selectCompartment(compartments[0].id));
    }
  }, [compartments, dispatch, selectedCompartment]);

  return selectedCompartment !== null;
}

/**
 * Validates the reference date based on provided scenarios and validation state.
 * Updates the reference date using the first scenario with name 'casedata' if a reference date is not set.
 */
function useValidateReferenceDate(scenarios: Scenarios, scenariosValidated: boolean): boolean {
  const dispatch = useAppDispatch();
  const referenceDate = useAppSelector((state) => state.dataSelection.simulationStart);

  useEffect(() => {
    if (!scenariosValidated || referenceDate) return;

    const caseData = scenarios.find((scenario) => scenario.name === 'casedata');

    if (caseData) {
      dispatch(setStartDate(caseData.endDate));
    }
  }, [dispatch, referenceDate, scenariosValidated, scenarios]);

  return referenceDate !== null;
}

/**
 * Validates the date range for scenarios and dispatches minimum and maximum dates based on active scenarios.
 */
function useValidateDateRange(scenarios: Scenarios, scenariosValidated: boolean): boolean {
  const dispatch = useAppDispatch();
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);

  useEffect(() => {
    if (!scenariosValidated || !scenariosState) return;

    const active = Object.entries(scenariosState)
      .filter(([_, scenario]) => scenario.visibility === 'faceUp')
      .map(([id, _]) => scenarios.find((scenario) => scenario.id === id))
      .filter((scenario) => scenario !== undefined) as Array<ScenarioPreview>;

    if (active.length > 0) {
      const minMax = active.reduce(
        (
          previous: {
            min: string;
            max: string;
          },
          current
        ) => ({
          min: previous.min.localeCompare(current.startDate) < 0 ? previous.min : current.startDate,
          max: previous.max.localeCompare(current.endDate) > 0 ? previous.max : current.endDate,
        }),
        {min: 'XXXX-XX-XX', max: '0000-00-00'}
      );

      if (minMax) {
        dispatch(setMinMaxDates({minDate: minMax.min, maxDate: minMax.max}));
      }
    }
  }, [dispatch, scenarios, scenariosState, scenariosValidated]);

  // I think any date range is valid, so we can return true here.
  return true;
}

/**
 * Validates whether the currently selected date falls within a specified date range.
 */
function useValidateDate(validatedDateRange: boolean): boolean {
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const min = useAppSelector((state) => state.dataSelection.minDate);
  const max = useAppSelector((state) => state.dataSelection.maxDate);

  const valid = useMemo(
    () =>
      validatedDateRange &&
      selectedDate !== null &&
      min !== null &&
      max !== null &&
      selectedDate.localeCompare(min) >= 0 &&
      selectedDate.localeCompare(max) <= 0,
    [max, min, selectedDate, validatedDateRange]
  );

  useEffect(() => {
    if (!validatedDateRange || !min || !max || valid) return;

    if (!selectedDate) {
      dispatch(selectDate(max));
    } else if (selectedDate.localeCompare(min) < 0) {
      dispatch(selectDate(min));
    } else if (selectedDate.localeCompare(max) > 0) {
      dispatch(selectDate(max));
    }
  }, [dispatch, selectedDate, min, max, validatedDateRange, valid]);

  return valid;
}
