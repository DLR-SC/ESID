// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import DataCard from './DataCard';
import {Dispatch, SetStateAction} from 'react';
import React, {useMemo} from 'react';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box/Box';
import {Scenario} from 'store/ScenarioSlice';
import {CardValue, FilterValue} from 'types/card';
import {GroupFilter} from 'types/group';
import {Localization} from 'types/localization';
import {getScenarioPrimaryColor} from 'util/Theme';
import {Dictionary} from 'util/util';

interface CardContainerProps {
  /** A boolean indicating whether the compartments are expanded. */
  compartmentsExpanded: boolean;

  /** A dictionary of card values. Each value is an object containing 'startValues', a dictionary used for rate calculation, and 'compartmentValues' for each card.
   *'startValues' help determine whether the values have increased, decreased, or remained the same. */
  cardValues: Dictionary<CardValue> | undefined;

  /** A dictionary of filter values. This is an array of objects, each containing a title and a dictionary of numbers representing
   * the filtered information to be displayed, it's used a disctionary because each card has to have the same amount of filter. */
  filterValues?: Dictionary<FilterValue[]> | null;

  /** The compartment that is currently selected. */
  selectedCompartment: string;

  /** An array of scenarios. */
  scenarios: Scenario[];

  /** An array of compartments. */
  compartments: string[];

  /** An array of active scenarios. */
  activeScenarios: number[] | null;

  /** A function to set the active scenarios. */
  setActiveScenarios: React.Dispatch<React.SetStateAction<number[] | null>>;

  /** The selected scenario. */
  selectedScenario: number | null;

  /** A function to set the selected scenario. */
  setSelectedScenario: Dispatch<SetStateAction<number | null>>;

  /** The minimum number of compartment rows. */
  minCompartmentsRows: number;

  /** The maximum number of compartment rows. */
  maxCompartmentsRows: number;

  /** An object containing localization information (translation & number formattation). */
  localization?: Localization;

  /** A dictionary of group filters. */
  groupFilters: Dictionary<GroupFilter> | undefined;

  /** Boolean to determine if the arrow is displayed */
  arrow?: boolean;
}

/**
 * This component renders a container for data cards. Each card represents a scenario and contains a title, a list of
 * compartment values, and change rates relative to the simulation start.
 */
export default function CardContainer({
  compartmentsExpanded,
  filterValues,
  selectedCompartment,
  compartments,
  scenarios,
  activeScenarios,
  cardValues,
  minCompartmentsRows,
  maxCompartmentsRows,
  setActiveScenarios,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
  selectedScenario,
  setSelectedScenario,
  groupFilters,
  arrow = true,
}: CardContainerProps) {
  const theme = useTheme();
  const minHeight = useMemo(() => {
    let height;
    if (compartmentsExpanded) {
      if (maxCompartmentsRows > 5) {
        height = (390 / 6) * maxCompartmentsRows;
      } else {
        height = (660 / 6) * maxCompartmentsRows;
      }
    } else {
      if (minCompartmentsRows < 4) {
        height = (480 / 4) * minCompartmentsRows;
      } else {
        height = (325 / 4) * minCompartmentsRows;
      }
    }
    return `${height}px`;
  }, [compartmentsExpanded, maxCompartmentsRows, minCompartmentsRows]);

  const dataCards = scenarios.map((scenario) => {
    const cardValue = cardValues ? cardValues[scenario.id.toString()] : null;
    if (!cardValue) {
      return null;
    }
    return (
      <DataCard
        key={scenario.id}
        index={scenario.id}
        color={scenario.id == 0 ? '#00000' : getScenarioPrimaryColor(scenario.id, theme)}
        label={scenario.label}
        compartmentsExpanded={compartmentsExpanded}
        compartments={compartments}
        compartmentValues={cardValue.compartmentValues}
        startValues={cardValue.startValues}
        selectedCompartment={selectedCompartment}
        filterValues={filterValues}
        selectedScenario={selectedScenario == scenario.id}
        activeScenarios={activeScenarios}
        setSelectedScenario={setSelectedScenario}
        numberSelectedScenario={selectedScenario ?? null}
        setActiveScenarios={setActiveScenarios}
        minCompartmentsRows={minCompartmentsRows}
        maxCompartmentsRows={compartments.length < maxCompartmentsRows ? compartments.length : maxCompartmentsRows}
        localization={localization}
        groupFilters={groupFilters}
        arrow={arrow}
      />
    );
  });

  return (
    <Box
      id='card-container'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        minHeight: minHeight,
        overflowX: 'auto',
        minWidth: 400,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 2,
      }}
    >
      {dataCards}
    </Box>
  );
}
