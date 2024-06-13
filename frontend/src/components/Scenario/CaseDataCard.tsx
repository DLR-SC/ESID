// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Dictionary} from '../../util/util';
import {useTranslation} from 'react-i18next';
import React, {useMemo} from 'react';
import {useAppSelector} from '../../store/hooks';
import {useGetCaseDataSingleSimulationEntryQuery} from '../../store/services/caseDataApi';
import {DataCard} from './DataCard';
import {ScenarioState} from './hooks';

interface CaseDataCardProps {
  scenario: ScenarioState;

  /** If the card is currently selected. */
  selected: boolean;

  /** The simulation start values for all compartments. */
  startValues: Dictionary<number> | null;

  /** A callback for when the card is being selected. */
  onClick: () => void;

  /** A callback for when the card is being activated or deactivated. */
  onToggle: () => void;
}

/**
 * This component renders a list of values and rates for each compartment for case data inside a black card.
 */
export function CaseDataCard(props: Readonly<CaseDataCardProps>): JSX.Element {
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
      scenario={props.scenario}
      label={t('chart.caseData')}
      color={'#000000'}
      selected={props.selected}
      compartmentValues={compartmentValues}
      startValues={props.startValues}
      onClick={props.onClick}
      onToggle={props.onToggle}
    />
  );
}
