import Container from '@mui/material/Container';
import {Box, Autocomplete} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {SyntheticEvent, useEffect, useState} from 'react';
import React from 'react';
import {FeatureProperties, FeatureCollection, Feature} from 'types/map';

interface SearchBarProps {
  data: undefined | FeatureCollection;
  defaultValue?: FeatureProperties;
  sortProperty?: string;
  optionLabel: (option: FeatureProperties) => string;
  autoCompleteValue: FeatureProperties;
  optionEqualProperty?: string;
  valueEqualProperty?: string;
  onChange: (event: SyntheticEvent<Element, Event>, value: FeatureProperties | null) => void;
  placeholder?: string;
  background?: string;
  borderColor?: string;
  borderColorHover?: string;
  borderColorFocus?: string;
}
export default function SearchBar({
  data,
  defaultValue,
  sortProperty,
  optionLabel,
  autoCompleteValue,
  optionEqualProperty = 'id',
  valueEqualProperty = 'id',
  onChange,
  placeholder = '',
  background = '#F0F0F2',
  borderColor = '#D2D1DB',
  borderColorHover = '#998BF5',
  borderColorFocus = '#543CF0',
}: SearchBarProps) {
  const [featureproperties, setFeatureProperties] = useState<FeatureProperties[]>([]);

  // fetch data from URL, add default value and sort by sortProperty
  useEffect(() => {
    if (!data) return;
    const properties = data.features.map((feature: Feature) => {
      return feature.properties;
    });
    if (defaultValue) properties.push(defaultValue);
    if (sortProperty) {
      properties.sort((a: FeatureProperties, b: FeatureProperties) => {
        return a[sortProperty].toString().localeCompare(b[sortProperty].toString());
      });
      setFeatureProperties(properties);
    }
  }, [data, defaultValue, sortProperty]);
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
          //   background: theme.palette.background.default,
          borderStyle: 'solid',
          borderWidth: '2px',
          background: background,
          borderColor: borderColor,
          '&:hover': {borderColor: borderColorHover},
          '&:hover *': {borderColor: borderColorHover},
          '&:focus-within': {borderColor: borderColorFocus},
          '&:focus-within *': {borderColor: borderColorFocus},
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
          isOptionEqualToValue={(option, value) => option[optionEqualProperty] === value[valueEqualProperty]}
          // onChange of input dispatch new selected district or initial value (ags: 00000, name: germany) if input is cleared
          onChange={onChange}
          // enable clearing/resetting the input field with escape key
          clearOnEscape
          // automatically highlights first option
          autoHighlight
          // selects highlighted option on focus loss
          //autoSelect
          // provide countyList as options for drop down
          options={featureproperties}
          // group dropdown contents by first letter (json array needs to be sorted alphabetically by name for this to work correctly)
          groupBy={sortProperty ? (option) => option[sortProperty].toString()[0] : undefined}
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
