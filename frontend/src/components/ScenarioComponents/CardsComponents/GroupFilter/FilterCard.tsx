// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0
import React, {useMemo} from 'react';
import {Box, useTheme} from '@mui/material';
import Divider from '@mui/material/Divider';
import FilterRows from './FilterRows';
import CardTitle from '../MainCard/CardTitle';
import {Localization} from 'types/localization';
import {Dictionary} from 'util/util';

interface FilterCardProps {
  /** Title of the filter card */
  title: string;

  /** Color of the filter card */
  color: string;

  /** Array of compartments */
  compartments: string[];

  /** Dictionary of filtered values */
  filteredValues: Dictionary<number> | null;

  /** Index of the group filter */
  groupFilterIndex: number;

  /** Total number of cards */
  totalCardNumber: number;

  /** Boolean to determine if the compartment is expanded */
  compartmentExpanded?: boolean;

  /** Selected compartment */
  selectedCompartment: string;

  /** Minimum number of compartment rows */
  minCompartmentsRows: number;

  /** Maximum number of compartment rows */
  maxCompartmentsRows: number;

  /** A boolean indicating whether the compartments are expanded. */
  compartmentsExpanded: boolean;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This component renders a filter card with a title, and a list of values that are the filtered values.
 * It also supports localization.
 */
export default function FilterCard({
  title,
  color,
  compartments,
  filteredValues,
  groupFilterIndex,
  totalCardNumber,
  compartmentExpanded,
  selectedCompartment,
  maxCompartmentsRows,
  minCompartmentsRows,
  compartmentsExpanded,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
}: FilterCardProps) {
  const theme = useTheme();

  const maxHeight = useMemo(() => {
    let height;
    if (compartmentsExpanded) {
      if (maxCompartmentsRows > 5) {
        height = (390 / 6) * maxCompartmentsRows;
      } else {
        height = (480 / 6) * maxCompartmentsRows;
      }
    } else {
      if (minCompartmentsRows < 4) {
        height = (365 / 4) * minCompartmentsRows;
      } else {
        height = (325 / 4) * minCompartmentsRows;
      }
    }
    return `${height}px`;
  }, [compartmentsExpanded, maxCompartmentsRows, minCompartmentsRows]);

  return (
    <Box
      id={`external-cardfilter-container-${groupFilterIndex}`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Box
        id={`cardfilter-title&cardContent-container-${groupFilterIndex}`}
        className='hide-scrollbar'
        sx={{
          maxHeight: maxHeight,
          minWidth: '130px',
          bgcolor: theme.palette.background.paper,
          zIndex: 0,
          display: 'flex',
          flexDirection: 'column',
          borderColor: groupFilterIndex == 0 ? null : 'divider',
          borderRadius: groupFilterIndex == totalCardNumber - 1 ? '0 0.2em 0.2em 0' : '0',
        }}
      >
        <Box
          id={`cardfilter-title-container-${groupFilterIndex}`}
          sx={{
            display: 'flex',
            height: '58px',
            alignItems: 'self-end',
            width: 'full',
            paddingRight: 2,
            paddingLeft: 1,
          }}
        >
          <CardTitle label={title} color={color} />
        </Box>
        <FilterRows
          compartments={compartments}
          filteredValues={filteredValues}
          compartmentExpanded={compartmentExpanded}
          selectedCompartment={selectedCompartment}
          maxCompartmentsRows={maxCompartmentsRows}
          minCompartmentsRows={minCompartmentsRows}
          localization={localization}
        />
      </Box>
      {groupFilterIndex != totalCardNumber - 1 && <Divider orientation='vertical' flexItem />}
    </Box>
  );
}
