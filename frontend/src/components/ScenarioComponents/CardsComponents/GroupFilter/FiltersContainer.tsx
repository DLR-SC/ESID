// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, Collapse, useTheme} from '@mui/material';
import FilterButton from './FilterButton';
import FilterCard from './FilterCard';
import React from 'react';
import {Localization} from 'types/localization';

interface FiltersContainerProps {
  /** Id of the filter container */
  id: string;

  color: string;

  /** Array of filtered titles */
  filteredTitles: string[];

  /** Boolean to determine if the filter container is folded */
  folded: boolean;

  /** Function to set the folded state */
  setFolded: (folded: boolean) => void;

  /** Boolean to determine if the compartments are expanded */
  compartmentsExpanded: boolean;

  /** Selected compartment */
  selectedCompartmentId: string | null;

  /** Array of filtered values */
  filteredValues: Array<Record<string, number>>;

  /** Minimum number of compartment rows */
  minCompartmentsRows: number;

  /** Maximum number of compartment rows */
  maxCompartmentsRows: number;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This component renders a container for filter cards. The container can be opened by clicking a button, which triggers a collapsing animation.
 * It also supports localization.
 */
export default function FiltersContainer({
  id,
  color,
  folded,
  setFolded,
  compartmentsExpanded,
  selectedCompartmentId,
  filteredValues,
  filteredTitles,
  maxCompartmentsRows,
  minCompartmentsRows,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
}: FiltersContainerProps) {
  const theme = useTheme();
  return (
    <Box
      id={`filters-container-${id}`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        maxHeight: compartmentsExpanded
          ? maxCompartmentsRows > 5
            ? `${(390 / 6) * maxCompartmentsRows}px`
            : `${(480 / 6) * maxCompartmentsRows}px`
          : minCompartmentsRows < 4
            ? `${(365 / 4) * minCompartmentsRows}px`
            : `${(325 / 4) * minCompartmentsRows}px`,
        boxSizing: 'border-box',
        border: 1,
        borderColor: color,
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
        id={'1'}
        maxCompartmentsRows={maxCompartmentsRows}
        compartmentsExpanded={compartmentsExpanded}
        minCompartmentsRows={minCompartmentsRows}
      />
      <Collapse in={folded} orientation='horizontal'>
        <Box
          id={`filtercards-container-${id}`}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: '9px',
            paddingBottom: '9px',
            maxHeight: compartmentsExpanded
              ? maxCompartmentsRows > 5
                ? `${(390 / 6) * maxCompartmentsRows}px`
                : `${(480 / 6) * maxCompartmentsRows}px`
              : minCompartmentsRows < 4
                ? `${(365 / 4) * minCompartmentsRows}px`
                : `${(325 / 4) * minCompartmentsRows}px`,
          }}
        >
          {filteredValues.map((filter, index) => (
            <FilterCard
              key={index}
              color={color}
              title={filteredTitles[index]}
              compartmentExpanded={compartmentsExpanded}
              selectedCompartmentId={selectedCompartmentId}
              filteredValues={filter}
              minCompartmentsRows={minCompartmentsRows}
              maxCompartmentsRows={maxCompartmentsRows}
              localization={localization}
              compartmentsExpanded={compartmentsExpanded}
              isFirstCard={index === 0}
              isLastCard={index === filteredValues.length - 1}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
