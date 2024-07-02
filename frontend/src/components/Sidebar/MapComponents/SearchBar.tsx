// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Container from '@mui/material/Container';
import {Box, Autocomplete, useTheme} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {SyntheticEvent} from 'react';
import React from 'react';
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
          my: 3, // sx-shorthand for margin-top & -bottom = theme.spacing(3)
          borderRadius: 4,
          background: theme.palette.background.default,
          borderStyle: 'solid',
          borderWidth: '2px',
          borderColor: theme.palette.divider,
          '&:hover': {borderColor: theme.palette.primary.light},
          '&:hover *': {borderColor: theme.palette.primary.light},
          '&:focus-within': {borderColor: theme.palette.primary.main},
          '&:focus-within *': {borderColor: theme.palette.primary.main},
        }}
      >
        <SearchIcon
          color='primary'
          sx={{
            pl: 2, // sx-shorthand for padding-left = theme.spacing(2)
            pr: 1, // sx-shorthand for padding-right = theme.spacing(1)
          }}
        />
        <Autocomplete
          // set value to selectedDistrict contents from store
          value={autoCompleteValue}
          // function to compare value to options in list, comparing ags number and name of district
          isOptionEqualToValue={(option, value) => option![optionEqualProperty] === value![valueEqualProperty]}
          // onChange of input dispatch new selected district or initial value (ags: 00000, name: germany) if input is cleared
          onChange={onChange}
          // enable clearing/resetting the input field with escape key
          clearOnEscape
          // automatically highlights first option
          autoHighlight
          // selects highlighted option on focus loss
          //autoSelect
          // provide countyList as options for drop down
          options={data || []}
          // group dropdown contents by first letter (json array needs to be sorted alphabetically by name for this to work correctly)
          groupBy={sortProperty ? (option) => (option![sortProperty] as string)[0] : undefined}
          // provide function to display options in dropdown menu
          getOptionLabel={optionLabel}
          sx={{
            flexGrow: 1,
            //disable outline for any children
            '& *:focus': {outline: 'none'},
          }}
          // override default input field, placeholder is a fallback, as value should always be a selected district or germany (initial/default value)
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
                  fontSize: '16px',
                  padding: '5px',
                  borderTopRightRadius: 26,
                  borderBottomRightRadius: 26,
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
