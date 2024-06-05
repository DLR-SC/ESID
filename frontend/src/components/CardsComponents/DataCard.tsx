// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import {useEffect, useMemo, useState} from 'react';
import MainCard from './MainCard/MainCard';
import FiltersContainer from './GroupFilter/FiltersContainer';
import {Dictionary, filterValue} from '../../types/Cardtypes';
import React from 'react';
import {GroupFilter} from 'types/group';

interface DataCardProps {
  index: number;
  compartmentValues: Dictionary<number> | null;
  startValues: Dictionary<number> | null;
  label: string;
  compartmentsExpanded: boolean;
  compartments: string[];
  selectedCompartment: string;
  selectedScenario: boolean;
  color: string;
  activeScenarios: number[] | null;
  filterValues?: Dictionary<filterValue[]> | null;
  setSelectedScenario: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveScenarios: React.Dispatch<React.SetStateAction<number[] | null>>;
  numberSelectedScenario: number | null;
  minCompartmentsRows: number;
  maxCompartmentsRows: number;
  localization: {
    numberFormatter: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
  groupFilters: Dictionary<GroupFilter> | undefined;
}

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
  localization,
  groupFilters,
}: DataCardProps) {
  const [hover, setHover] = useState<boolean>(false);
  const [folded, setFolded] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<boolean>(true);

  const filteredTitles: string[] = useMemo(() => {
    const temp: string[] = [];
    if (activeScenarios?.includes(index) && filterValues?.[index.toString()]) {
      filterValues[index.toString()].forEach((filterValue: filterValue) => {
        temp.push(filterValue.filteredTitle);
      });
    }
    return temp;
  }, [activeScenarios, filterValues, index]);
  const filteredValues: Array<Dictionary<number> | null> = useMemo(() => {
    const temp: Array<Dictionary<number> | null> = [];
    if (activeScenarios?.includes(index) && filterValues?.[index.toString()]) {
      filterValues[index.toString()].forEach((filterValue: filterValue) => {
        temp.push(filterValue.filteredValues);
      });
    }
    return temp;
  }, [activeScenarios, filterValues, index]);

  useEffect(() => {
    function checkVisibility(): boolean {
      const check = Object.values(groupFilters || {})?.map((filter) => {
        if (filter.name == filteredTitles[0]) {
          return filter.isVisible;
        } else return false;
      });
      if (!check.includes(true)) return false;
      else return true;
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
      />
      {activeScenarios?.includes(index) &&
      filterValues?.[index.toString()] &&
      Object.keys(groupFilters || {}).length !== 0 &&
      visibility ? (
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
      ) : null}
    </Box>
  );
}
