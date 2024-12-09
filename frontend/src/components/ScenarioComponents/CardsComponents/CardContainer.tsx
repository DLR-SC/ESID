// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import DataCard from './DataCard';
import React, {Dispatch, useMemo} from 'react';
import Box from '@mui/material/Box/Box';
import {FilterValues} from 'types/card';
import {GroupFilter} from 'types/group';
import {Localization} from 'types/localization';

interface CardContainerProps {
  /** A boolean indicating whether the compartments are expanded. */
  compartmentsExpanded: boolean;

  /** A dictionary of card values. Each value is an object containing 'startValues', a dictionary used for rate calculation, and 'compartmentValues' for each card.
   *'startValues' help determine whether the values have increased, decreased, or remained the same. */
  cardValues: Record<string, Record<string, number>> | undefined;

  referenceValues: Record<string, number> | undefined;

  /** A dictionary of filter values. This is an array of objects, each containing a title and a dictionary of numbers representing
   * the filtered information to be displayed, it's used a dictionary because each card has to have the same amount of filter. */
  filterValues?: Record<string, FilterValues[]> | null;

  /** The compartment that is currently selected. */
  selectedCompartmentId: string | null;

  /** An array of scenarios. */
  scenarios: Array<{id: string; name: string; color: string}>;

  /** An array of active scenarios. */
  activeScenarios: string[];

  /** A function to set the active scenarios. */
  setActiveScenario: Dispatch<{id: string; state: boolean}>;

  /** The selected scenario. */
  selectedScenario: string | null;

  /** A function to set the selected scenario. */
  setSelectedScenario: Dispatch<{id: string; state: boolean}>;

  /** The minimum number of compartment rows. */
  minCompartmentsRows: number;

  /** The maximum number of compartment rows. */
  maxCompartmentsRows: number;

  /** An object containing localization information (translation & number formattation). */
  localization?: Localization;

  /** A dictionary of group filters. */
  groupFilters: Record<string, GroupFilter> | undefined;

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
  selectedCompartmentId,
  scenarios,
  activeScenarios,
  cardValues,
  referenceValues,
  minCompartmentsRows,
  maxCompartmentsRows,
  setActiveScenario,
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
    return (
      <DataCard
        key={scenario.id}
        id={scenario.id}
        color={scenario.color}
        title={scenario.name}
        compartmentsExpanded={compartmentsExpanded}
        compartmentValues={cardValues ? cardValues[scenario.id] : null}
        referenceValues={referenceValues ?? null}
        selectedCompartmentId={selectedCompartmentId}
        filterValues={filterValues}
        isSelected={selectedScenario === scenario.id}
        isActive={activeScenarios.includes(scenario.id)}
        setSelected={setSelectedScenario}
        setActive={setActiveScenario}
        minCompartmentsRows={minCompartmentsRows}
        maxCompartmentsRows={maxCompartmentsRows}
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
