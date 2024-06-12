// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useEffect, useState} from 'react';
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
