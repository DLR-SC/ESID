// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useEffect, useMemo, useState} from 'react';
import {Dictionary} from '../../util/util';
import {useGetCaseDataSingleSimulationEntryQuery} from '../../store/services/caseDataApi';
import {useAppSelector} from '../../store/hooks';

export function useGetSimulationStartValues() {
  const startDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const node = useAppSelector((state) => state.dataSelection.district.ags);

  const [compartmentValues, setCompartmentValues] = useState<Dictionary<number> | null>(null);

  const {data: caseData} = useGetCaseDataSingleSimulationEntryQuery(
    {
      node: node,
      day: startDay ?? '',
      groups: ['total'],
    },
    {skip: !startDay}
  );

  useEffect(() => {
    if (caseData?.results && caseData.results.length > 0) {
      setCompartmentValues(caseData.results[0].compartments);
    }
  }, [caseData]);

  return compartmentValues;
}

function getState(
  name: string,
  shownScenarios: string[] | null,
  activeScenarios: string[] | null
): 'active' | 'inactive' | 'hidden' {
  if (shownScenarios?.includes(name) && activeScenarios?.includes(name)) {
    return 'active';
  }

  if (shownScenarios?.includes(name)) {
    return 'inactive';
  }

  return 'hidden';
}

export type ScenarioState = {id: number; name: string; state: 'active' | 'inactive' | 'hidden'};

export function useScenarioState(): Array<ScenarioState> {
  const scenarios = useAppSelector((state) => state.scenarioList.scenarios);
  const shownScenarios = useAppSelector((state) => state.dataSelection.shownScenarios);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);

  return useMemo(() => {
    const result = [
      {
        id: 0,
        name: 'casedata',
        state: getState('casedata', shownScenarios, activeScenarios),
      },
    ];

    for (const scenario of Object.values(scenarios)) {
      result.push({
        id: scenario.id,
        name: scenario.label,
        state: getState(scenario.label, shownScenarios, activeScenarios),
      });
    }

    return result;
  }, [scenarios, shownScenarios, activeScenarios]);
}

export function useActiveScenarios() {
  const scenarios = useScenarioState();

  return useMemo(() => scenarios.filter((scenario) => scenario.state === 'active'), [scenarios]);
}

export function useInactiveScenarios() {
  const scenarios = useScenarioState();

  return useMemo(() => scenarios.filter((scenario) => scenario.state === 'inactive'), [scenarios]);
}

export function useShownScenarios() {
  const scenarios = useScenarioState();

  return useMemo(() => scenarios.filter((scenario) => scenario.state !== 'hidden'), [scenarios]);
}

export function useHiddenScenarios() {
  const scenarios = useScenarioState();

  return useMemo(() => scenarios.filter((scenario) => scenario.state === 'hidden'), [scenarios]);
}

export function isActive(name: string, activeScenarios: Array<ScenarioState>): boolean {
  return !!activeScenarios.find((scenario) => scenario.name === name);
}

export function isShown(name: string, shownScenarios: Array<ScenarioState>): boolean {
  return !!shownScenarios.find((scenario) => scenario.name === name);
}
