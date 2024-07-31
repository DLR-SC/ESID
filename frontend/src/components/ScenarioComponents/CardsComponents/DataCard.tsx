// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import React, {useEffect, useMemo, useState} from 'react';
import MainCard from './MainCard/MainCard';
import FiltersContainer from './GroupFilter/FiltersContainer';
import {FilterValue} from 'types/card';
import {GroupFilter} from 'types/group';
import {Localization} from 'types/localization';
import {Dictionary} from 'util/util';

interface DataCardProps {
  /** A unique identifier for the card.*/
  index: number;

  /** A dictionary of compartment values associated with the card.*/
  compartmentValues: Dictionary<number> | null;

  /** A dictionary of start values used for calculating the rate. This determines whether the values have increased, decreased, or remained the same. */
  startValues: Dictionary<number> | null;

  /** The title of the card.*/
  label: string;

  /** A boolean indicating whether the compartments are expanded.*/
  compartmentsExpanded: boolean;

  /** An array of compartments.*/
  compartments: string[];

  /** The compartment that is currently selected.*/
  selectedCompartment: string;

  /** A boolean indicating whether the scenario is selected.*/
  selectedScenario: boolean;

  /** The color of the card.*/
  color: string;

  /** An array of active scenarios.*/
  activeScenarios: number[] | null;

  /** A dictionary of filter values. This is an array of objects, each containing a title and a dictionary of numbers representing
   * the filtered information to be displayed, it's used a disctionary because each card has to have the same amount of filter. */
  filterValues?: Dictionary<FilterValue[]> | null;

  /** A function to set the selected scenario.*/
  setSelectedScenario: React.Dispatch<React.SetStateAction<number | null>>;

  /** A function to set the active scenarios.*/
  setActiveScenarios: React.Dispatch<React.SetStateAction<number[] | null>>;

  /** The number of the selected scenario.*/
  numberSelectedScenario: number | null;

  /** The minimum number of compartment rows.*/
  minCompartmentsRows: number;

  /** The maximum number of compartment rows.*/
  maxCompartmentsRows: number;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;

  /** A dictionary of group filters.*/
  groupFilters: Dictionary<GroupFilter> | undefined;

  /** Boolean to determine if the arrow is displayed */
  arrow?: boolean;
}

/**
 * This component renders a card for either the case data or the scenario cards. Each card contains a title, a list of
 * compartment values, and change rates relative to the simulation start. Additionally, the component includes a filter container.
 * The filter container renders a button and generates the necessary number of cards based on the presence of any filters.
 */
export default function DataCard({
  index,
  compartmentValues,
  startValues,
  label,
  compartmentsExpanded,
  compartments,
  selectedCompartment,
  filterValues,
  color,
  activeScenarios,
  selectedScenario,
  numberSelectedScenario,
  minCompartmentsRows,
  maxCompartmentsRows,
  setSelectedScenario,
  setActiveScenarios,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
  groupFilters,
  arrow = true,
}: DataCardProps) {
  const [hover, setHover] = useState<boolean>(false);
  const [folded, setFolded] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<boolean>(true);

  const filteredTitles: string[] = useMemo(() => {
    if (activeScenarios?.includes(index) && filterValues?.[index.toString()]) {
      return filterValues[index.toString()].map((filterValue: FilterValue) => filterValue.filteredTitle);
    }
    return [];
  }, [activeScenarios, filterValues, index]);

  const filteredValues: Array<Dictionary<number> | null> = useMemo(() => {
    if (activeScenarios?.includes(index) && filterValues?.[index.toString()]) {
      return filterValues[index.toString()].map((filterValue: FilterValue) => filterValue.filteredValues);
    }
    return [];
  }, [activeScenarios, filterValues, index]);

  /*
   * This useEffect hook updates the visibility of the component based on groupFilters and filteredTitles.
   * It checks if the first title in filteredTitles matches any filter name in groupFilters and if that filter is visible.
   * If at least one matching filter is visible, the component becomes visible; otherwise, it remains hidden.
   */
  useEffect(() => {
    function checkVisibility(): boolean {
      if (groupFilters) {
        return Object.values(groupFilters)
          .map((filter) => (filter.name == filteredTitles[0] ? filter.isVisible : false))
          .includes(true);
      }
      return false;
    }
    setVisibility(checkVisibility);
  }, [filteredTitles, groupFilters]);

  return (
    <Box
      id={`data-card-${index}`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      <MainCard
        index={index}
        label={label}
        hover={hover}
        color={color}
        startValues={startValues}
        compartmentValues={compartmentValues}
        setHover={setHover}
        compartments={compartments}
        compartmentsExpanded={compartmentsExpanded}
        selectedCompartment={selectedCompartment}
        selectedScenario={selectedScenario}
        activeScenario={activeScenarios?.includes(index) ?? false}
        setSelectedScenario={setSelectedScenario}
        setActiveScenarios={setActiveScenarios}
        numberSelectedScenario={numberSelectedScenario}
        activeScenarios={activeScenarios}
        minCompartmentsRows={minCompartmentsRows}
        maxCompartmentsRows={maxCompartmentsRows}
        localization={localization}
        arrow={arrow}
      />
      {activeScenarios?.includes(index) &&
        filterValues?.[index.toString()] &&
        Object.keys(groupFilters || {}).length !== 0 &&
        visibility && (
          <FiltersContainer
            index={index}
            filteredTitles={filteredTitles}
            folded={folded}
            setFolded={setFolded}
            compartmentsExpanded={compartmentsExpanded}
            compartments={compartments}
            selectedCompartment={selectedCompartment}
            filteredValues={filteredValues}
            minCompartmentsRows={minCompartmentsRows}
            maxCompartmentsRows={maxCompartmentsRows}
            localization={localization}
          />
        )}
    </Box>
  );
}
