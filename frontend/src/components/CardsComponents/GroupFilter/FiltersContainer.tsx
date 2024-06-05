// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0
import {Box, Collapse, useTheme} from '@mui/material';
import FilterButton from './FilterButton';
import FilterCard from './FilterCard';
import {Dictionary} from '../../../types/Cardtypes';
import React from 'react';

interface FiltersContainerProps {
  filteredTitles: string[];
  index: number;
  folded: boolean;
  setFolded: (folded: boolean) => void;
  compartmentsExpanded: boolean;
  selectedCompartment: string;
  compartments: string[];
  filteredValues: Array<Dictionary<number> | null>;
  minCompartmentsRows: number;
  maxCompartmentsRows: number;
  localization: {
    numberFormatter: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}

export default function FiltersContainer({
  index,
  folded,
  setFolded,
  compartmentsExpanded,
  selectedCompartment,
  compartments,
  filteredValues,
  filteredTitles,
  maxCompartmentsRows,
  minCompartmentsRows,
  localization,
}: FiltersContainerProps) {
  const theme = useTheme();
  return (
    <Box
      id={`filters-container-${index}`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        maxHeight: `${(340 / 6) * maxCompartmentsRows}px`,
        boxSizing: 'border-box',
        border: 1,
        borderColor: theme.custom.scenarios[index % theme.custom.scenarios.length][0],
        borderRadius: 1,
        bgcolor: 'white',
        zIndex: 2,
      }}
    >
      <FilterButton
        folded={folded}
        setFolded={setFolded}
        borderColor={theme.palette.divider}
        backgroundColor='white'
        idNumber={1}
        maxCompartmentsRows={maxCompartmentsRows}
      />
      <Collapse in={folded} orientation='horizontal'>
        <Box
          id={`filtercards-container-${index}`}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: '9px',
            paddingBottom: '9px',
            maxHeight: `${(335 / 6) * maxCompartmentsRows}px`,
          }}
        >
          {filteredValues.map((_, id: number) => (
            <FilterCard
              key={id}
              color={theme.custom.scenarios[index % theme.custom.scenarios.length][0]}
              title={filteredTitles[id]}
              compartments={compartments}
              groupFilterIndex={id}
              totalCardNumber={filteredValues.length}
              compartmentExpanded={compartmentsExpanded}
              selectedCompartment={selectedCompartment}
              filteredValues={filteredValues[id]}
              minCompartmentsRows={minCompartmentsRows}
              maxCompartmentsRows={maxCompartmentsRows}
              localization={localization}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
