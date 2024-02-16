// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {selectDistrict} from '../../store/DataSelectionSlice';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {useTranslation} from 'react-i18next';
import countyData from '../../../assets/lk_germany_reduced_list.json?url';

/** Type definition for the CountyItems of the Autocomplete field
 *  @see DataSelectionSlice
 */
interface CountyItem {
  /** ID for the district (Amtlicher Gemeindeschlüssel) (same as ags in store). */
  RS: string;
  /** Label/Name of the district (same as the name in the data store). */
  GEN: string;
  /** Region type identifier (same as the type in the data store). */
  BEZ: string;
}

/**
 * The SearchBar component helps select a specific district of the map.
 * @returns {JSX.Element} JSX Element to render the search bar container.
 */
export default function SearchBar(): JSX.Element {
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const {t} = useTranslation('global');
  const [countyList, setCountyList] = useState<Array<CountyItem>>([]);
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // This ensures that the displayed name of Germany is always localized.
  useEffect(() => {
    if (selectedDistrict.ags === '00000' && selectedDistrict.name !== t('germany')) {
      dispatch(selectDistrict({ags: '00000', name: t('germany'), type: ''}));
    }
  }, [t, selectedDistrict, dispatch]);

  useEffect(() => {
    // get option list from assets
    fetch(countyData, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => {
        // interpret content as JSON
        return response.json();
      })
      .then(
        // Resolve Promise
        (jsonlist: CountyItem[]) => {
          // append germany to list
          jsonlist.push({RS: '00000', GEN: t('germany'), BEZ: ''});
          // sort list to put germany at the right place (loading and sorting takes 1.5 ~ 2 sec)
          jsonlist.sort((a, b) => {
            return a.GEN.localeCompare(b.GEN);
          });
          // fill countyList state with list
          setCountyList(jsonlist);
        },
        // Reject Promise
        () => {
          console.warn('Did not receive proper county list');
        }
      );
    // this init should only run once on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

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
          value={{RS: selectedDistrict.ags, GEN: selectedDistrict.name, BEZ: selectedDistrict.type}}
          // function to compare value to options in list, comparing ags number and name of district
          isOptionEqualToValue={(option, value) => option.RS === value.RS}
          // onChange of input dispatch new selected district or initial value (ags: 00000, name: germany) if input is cleared
          onChange={(_event, newValue: CountyItem | null) => {
            if (newValue) {
              dispatch(
                selectDistrict({
                  ags: newValue?.RS ?? '00000',
                  name: newValue?.GEN ?? t('germany'),
                  type: newValue?.BEZ ?? '',
                })
              );
            }
          }}
          // enable clearing/resetting the input field with escape key
          clearOnEscape
          // automatically highlights first option
          autoHighlight
          // selects highlighted option on focus loss
          //autoSelect
          // provide countyList as options for drop down
          options={countyList}
          // group dropdown contents by first letter (json array needs to be sorted alphabetically by name for this to work correctly)
          groupBy={(option) => option.GEN[0]}
          // provide function to display options in dropdown menu
          getOptionLabel={(option) => `${option.GEN}${option.BEZ ? ` (${t(`BEZ.${option.BEZ}`)})` : ''}`}
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
                placeholder={`${selectedDistrict.name}${
                  selectedDistrict.type ? ` (${t(`BEZ.${selectedDistrict.type}`)})` : ''
                }`}
              />
            </div>
          )}
        />
      </Box>
    </Container>
  );
}
