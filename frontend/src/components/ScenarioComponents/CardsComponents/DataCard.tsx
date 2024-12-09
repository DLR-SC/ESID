// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import React, {Dispatch, useEffect, useMemo, useState} from 'react';
import MainCard from './MainCard/MainCard';
import FiltersContainer from './GroupFilter/FiltersContainer';
import {FilterValues} from 'types/card';
import {GroupFilter} from 'types/group';
import {Localization} from 'types/localization';

interface DataCardProps {
  /** A unique identifier for the card.*/
  id: string;

  /** A dictionary of compartment values associated with the card.*/
  compartmentValues: Record<string, number> | null;

  /** A dictionary of start values used for calculating the rate. This determines whether the values have increased, decreased, or remained the same. */
  referenceValues: Record<string, number> | null;

  /** The title of the card.*/
  title: string;

  /** A boolean indicating whether the compartments are expanded.*/
  compartmentsExpanded: boolean;

  /** The compartment that is currently selected.*/
  selectedCompartmentId: string | null;

  /** A boolean indicating whether the scenario is selected.*/
  isSelected: boolean;

  /** The color of the card.*/
  color: string;

  /** if this scenario is active.*/
  isActive: boolean;

  /** A dictionary of filter values. This is an array of objects, each containing a title and a dictionary of numbers representing
   * the filtered information to be displayed, it's used a disctionary because each card has to have the same amount of filter. */
  filterValues?: Record<string, FilterValues[]> | null;

  /** A function to set the selected scenario.*/
  setSelected: Dispatch<{id: string; state: boolean}>;

  /** A function to set the active scenario.*/
  setActive: Dispatch<{id: string; state: boolean}>;

  /** The minimum number of compartment rows.*/
  minCompartmentsRows: number;

  /** The maximum number of compartment rows.*/
  maxCompartmentsRows: number;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;

  /** A dictionary of group filters.*/
  groupFilters: Record<string, GroupFilter> | undefined;

  /** Boolean to determine if the arrow is displayed */
  arrow?: boolean;
}

/**
 * This component renders a card for either the case data or the scenario cards. Each card contains a title, a list of
 * compartment values, and change rates relative to the simulation start. Additionally, the component includes a filter container.
 * The filter container renders a button and generates the necessary number of cards based on the presence of any filters.
 */
export default function DataCard({
  id,
  compartmentValues,
  referenceValues,
  title,
  compartmentsExpanded,
  selectedCompartmentId,
  filterValues,
  color,
  isActive,
  isSelected,
  minCompartmentsRows,
  maxCompartmentsRows,
  setSelected,
  setActive,
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
    if (isActive && filterValues?.[id.toString()]) {
      return filterValues[id.toString()].map((filterValue: FilterValues) => filterValue.filteredTitle);
    }
    return [];
  }, [isActive, filterValues, id]);

  const filteredValues = useMemo(() => {
    if (isActive && filterValues?.[id.toString()]) {
      return filterValues[id.toString()].map((filterValue: FilterValues) => filterValue.filteredValues);
    }
    return [];
  }, [isActive, filterValues, id]);

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
      id={`data-card-${id}`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      <MainCard
        id={id}
        label={title}
        hover={hover}
        color={color}
        referenceValues={referenceValues}
        compartmentValues={compartmentValues}
        setHover={setHover}
        compartmentsExpanded={compartmentsExpanded}
        selectedCompartmentId={selectedCompartmentId}
        isSelected={isSelected}
        isActive={isActive}
        setSelected={setSelected}
        setActive={setActive}
        minCompartmentsRows={minCompartmentsRows}
        maxCompartmentsRows={maxCompartmentsRows}
        localization={localization}
        arrow={arrow}
      />
      {isActive && filterValues?.[id.toString()] && Object.keys(groupFilters || {}).length !== 0 && visibility && (
        <FiltersContainer
          id={id}
          color={color}
          filteredTitles={filteredTitles}
          folded={folded}
          setFolded={setFolded}
          compartmentsExpanded={compartmentsExpanded}
          selectedCompartmentId={selectedCompartmentId}
          filteredValues={filteredValues}
          minCompartmentsRows={minCompartmentsRows}
          maxCompartmentsRows={maxCompartmentsRows}
          localization={localization}
        />
      )}
    </Box>
  );
}
