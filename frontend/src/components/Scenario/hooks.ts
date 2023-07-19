import {useEffect, useState} from 'react';
import {Dictionary} from '../../util/util';
import {useGetCaseDataSingleSimulationEntryQuery} from '../../store/services/caseDataApi';
import {useAppSelector} from '../../store/hooks';

export function useGetSimulationStartValues() {
  const startDay = useAppSelector((state) => state.dataSelection.minDate);
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
    if (caseData) {
      setCompartmentValues(caseData.results[0].compartments);
    }
  }, [caseData]);

  return compartmentValues;
}