// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useEffect, useState} from 'react';
import {Dictionary} from '../../util/util';
import {useGetCaseDataSingleSimulationEntryQuery} from '../../store/services/caseDataApi';

export function useGetSimulationStartValues(node: string, startDay: string|null) {
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