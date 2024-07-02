// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useEffect, useState} from 'react';
import {Dictionary} from '../../util/util';
import {useGetCaseDataSingleSimulationEntryQuery} from '../../store/services/caseDataApi';
import {useAppSelector} from 'store/hooks';

/**
 * Custom hook that retrieves the simulation start values for a given node in a specific day.
 * @param node - The node for which to retrieve the simulation start values.
 * @returns The compartment values for the simulation start.
 */
export function useGetSimulationStartValues(node: string) {
  const startDay = useAppSelector((state) => state.dataSelection.simulationStart);
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
