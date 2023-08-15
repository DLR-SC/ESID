import {Dictionary} from '../../util/util';
import {useTranslation} from 'react-i18next';
import React, {useMemo} from 'react';
import {useAppSelector} from '../../store/hooks';
import {useGetCaseDataSingleSimulationEntryQuery} from '../../store/services/caseDataApi';
import {DataCard} from './DataCard';

interface CaseDataCardProps {
  selected: boolean;
  active: boolean;
  startValues: Dictionary<number> | null;
  onClick: () => void;
  onToggle: () => void;
}

export function CaseDataCard(props: CaseDataCardProps): JSX.Element {
  const {t} = useTranslation();

  const node = useAppSelector((state) => state.dataSelection.district?.ags);
  const day = useAppSelector((state) => state.dataSelection.date);

  const {data} = useGetCaseDataSingleSimulationEntryQuery(
    {
      node: node,
      day: day ?? '',
      groups: ['total'],
    },
    {skip: !day}
  );

  const compartmentValues = useMemo(() => {
    if (data && data.results.length > 0) {
      return data.results[0].compartments;
    }

    return null;
  }, [data]);

  return (
    <DataCard
      id={0}
      label={t('chart.caseData')}
      color={'#000000'}
      selected={props.selected}
      active={props.active}
      compartmentValues={compartmentValues}
      startValues={props.startValues}
      onClick={props.onClick}
      onToggle={props.onToggle}
    />
  );
}
