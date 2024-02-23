// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useMemo} from 'react';
import {useTheme} from '@mui/material/styles';
import {useAppSelector} from 'store/hooks';
import {useGetSingleSimulationEntryQuery} from 'store/services/scenarioApi';
import {Dictionary} from '../../util/util';
import {useTranslation} from 'react-i18next';
import {DataCard} from './DataCard';

/** Type definition for the ScenarioCard props */
interface ScenarioCardProps {
  /** The scenario this card is displaying. */
  scenario: {
    /** The identifier for the scenario. */
    id: number;

    /** The label for the scenario displayed to the user. */
    label: string;
  };

  /** The key for this scenario (index from the map function for the scenario list). */
  key: number;

  /** Boolean value whether the scenario is the selected scenario. */
  selected: boolean;

  /** Boolean value whether the scenario is active (not flipped). */
  active: boolean;

  /** The color of the card. */
  color: string;

  startValues: Dictionary<number> | null;

  /** The function that is executed when the scenario card is clicked. */
  onClick: () => void;

  /** The function that is executed when the disable toggle is clicked. */
  onToggle: () => void;
}

/**
 * React Component to render an individual Scenario Card.
 * @prop {ScenarioCardProps} props - The props for the component.
 * @returns {JSX.Element} JSX Element to render the scenario card.
 */
export function ScenarioCard(props: ScenarioCardProps): JSX.Element {
  const {t: tBackend} = useTranslation('backend');
  const theme = useTheme();

  const node = useAppSelector((state) => state.dataSelection.district?.ags);
  const day = useAppSelector((state) => state.dataSelection.date);

  const {data} = useGetSingleSimulationEntryQuery(
    {
      id: props.scenario.id,
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
      id={props.scenario.id}
      label={tBackend(`scenario-names.${props.scenario.label}`)}
      color={theme.custom.scenarios[props.scenario.id % theme.custom.scenarios.length][0]}
      selected={props.selected}
      active={props.active}
      compartmentValues={compartmentValues}
      startValues={props.startValues}
      onClick={props.onClick}
      onToggle={props.onToggle}
    />
  );
}
