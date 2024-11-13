// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Container from '@mui/material/Container';
import {Box, Autocomplete, useTheme} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, {SyntheticEvent} from 'react';
import {GeoJsonProperties} from 'geojson';

interface SearchBarProps {
  /**
   * Array of data items to be used as options in the autocomplete.
   */
  data: GeoJsonProperties[] | undefined;

  /**
   * Property name by which the options are sorted and grouped.
   */
  sortProperty?: string;

  /**
   * Function to determine the label for each option.
   * @param option - The option whose label is being determined.
   * @returns The label for the given option.
   */
  optionLabel: (option: GeoJsonProperties) => string;

  /**
   * The currently selected value for the autocomplete.
   */
  autoCompleteValue: GeoJsonProperties;

  /**
   * Property name used to compare options for equality.
   */
  optionEqualProperty?: string;

  /**
   * Property name used to compare the selected value for equality.
   */
  valueEqualProperty?: string;

  /**
   * Event handler for when the selected option changes.
   */
  onChange: (event: SyntheticEvent<Element, Event>, value: GeoJsonProperties) => void;

  /**
   * Placeholder text for the search input field.
   */
  placeholder?: string;
}

/**
 * React Component to render a Search Bar for the Map.
 * @returns {JSX.Element} JSX Element to render the Search Bar.
 */
export default function SearchBar({
  data,
  sortProperty,
  optionLabel,
  autoCompleteValue,
  optionEqualProperty = 'id',
  valueEqualProperty = 'id',
  onChange,
  placeholder = '',
}: SearchBarProps): JSX.Element {
  const theme = useTheme();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          alignContent: 'center',
          width: 1,
          my: 3,
          borderRadius: 1,
          background: 'white',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: theme.palette.divider,
          transition: 'border-color 0.3s ease-in-out',
          '&:hover': {
            borderColor: 'rgba(0,0,0,.55)',
          },
          '&:hover *': {
            borderColor: theme.palette.primary.light,
            transition: 'border-color 0.3s ease-in-out',
          },
          '&:focus-within': {
            borderColor: theme.palette.primary.main,
          },
          '&:focus-within *': {
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <SearchIcon
          sx={{
            pl: 2,
            pr: 0.5,
            py: 0.5,
            borderRadius: '3px',
            color: 'rgba(0,0,0, 0.3)',
            width: '18px',
            background: 'white',
          }}
        />
        <Autocomplete
          value={autoCompleteValue}
          isOptionEqualToValue={(option, value) => option![optionEqualProperty] === value![valueEqualProperty]}
          onChange={onChange}
          clearOnEscape
          autoHighlight
          options={data || []}
          groupBy={sortProperty ? (option) => (option![sortProperty] as string)[0] : undefined}
          getOptionLabel={optionLabel}
          sx={{
            flexGrow: 1,
            '& *:focus': {outline: 'none'},
          }}
          renderInput={(params) => (
            <div
              ref={params.InputProps.ref}
              style={{
                display: 'flex',
              }}
            >
              <input
                type='search'
                {...params.inputProps}
                style={{
                  flexGrow: 1,
                  borderStyle: 'none',
                  fontSize: '14px',
                  padding: '5px',
                  background: 'white',
                  borderRadius: '3px',
                  fontWeight: 'bold',
                  color: 'rgba(0, 0, 0, 0.8)',
                }}
                placeholder={placeholder}
              />
            </div>
          )}
        />
      </Box>
    </Container>
  );
}
