// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0
import {Box, Collapse, useTheme} from '@mui/material';
import FilterButton from './FilterButton';
import FilterCard from './FilterCard';
import React from 'react';
import {Dictionary} from 'types/Cardtypes';
import {Localization} from 'types/localization';
import {getScenarioPrimaryColor} from 'util/Theme';

interface FiltersContainerProps {
  /* Array of filtered titles */
  filteredTitles: string[];

  /* Index of the filter container */
  index: number;

  /* Boolean to determine if the filter container is folded */
  folded: boolean;

  /* Function to set the folded state */
  setFolded: (folded: boolean) => void;

  /* Boolean to determine if the compartments are expanded */
  compartmentsExpanded: boolean;

  /* Selected compartment */
  selectedCompartment: string;

  /* Array of compartments */
  compartments: string[];

  /* Array of filtered values */
  filteredValues: Array<Dictionary<number> | null>;

  /* Minimum number of compartment rows */
  minCompartmentsRows: number;

  /* Maximum number of compartment rows */
  maxCompartmentsRows: number;

  /*An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This component renders a container for filter cards. The container can be opened by clicking a button, which triggers a collapsing animation.
 * It also supports localization.
 */
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
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
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
        borderColor: getScenarioPrimaryColor(index, theme),
        borderRadius: 1,
        bgcolor: theme.palette.background.paper,
        zIndex: 2,
      }}
    >
      <FilterButton
        folded={folded}
        setFolded={setFolded}
        borderColor={theme.palette.divider}
        backgroundColor={theme.palette.background.paper}
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
              color={getScenarioPrimaryColor(index, theme)}
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
