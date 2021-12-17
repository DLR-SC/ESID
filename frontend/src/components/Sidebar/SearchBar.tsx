import React, {useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import {useAppSelector} from '../../store/hooks';
import {useAppDispatch} from '../../store/hooks';
import {selectDistrict} from '../../store/DataSelectionSlice';
import SearchIcon from '@mui/icons-material/Search';
import {Autocomplete, Box, Container} from '@mui/material';
import {useTranslation} from 'react-i18next';

/**
 * CountyItem type definition
 * @typedef {object} CountyItem
 * @property {string} RS  - ID for the district (Amtlicher Gemeindeschlüssel) (same as ags in store).
 * @property {string} GEN - label/name of the district (same as name in store).
 * @property {string} BEZ - region type identifier (same as type in store).
 * @see DataSelectionSlice
 */
interface CountyItem {
  RS: string;
  GEN: string;
  BEZ: string;
}

/**
 * The SearchBar component helps select a specific district of the map.
 * @returns {JSX.Element} JSX Element to render the search bar container.
 */
export default function SearchBar(): JSX.Element {
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const [countyList, setCountyList] = useState([{RS: '', GEN: '', BEZ: ''}]);
  const {t} = useTranslation('global');
  const theme = useTheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // get option list from assets
    fetch('assets/lk_germany_reduced_list.json', {
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
          // fill countyList state with list
          setCountyList(jsonlist);
        },
        // Reject Promise
        () => {
          console.warn('Did not receive proper county list');
        }
      );
    console.log(countyList);
    // this init should only run once on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          alignContent: 'center',
          width: 1,
          my: 3, // margin top & bottom = theme.spacing(3)
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
            pl: 2,
            pr: 1,
          }}
        />
        <Autocomplete
          // set value to selectedDistrict contents from store
          value={{RS: selectedDistrict.ags, GEN: selectedDistrict.name, BEZ: selectedDistrict.type}}
          // function to compare value to options in list, comparing ags number and name of district
          isOptionEqualToValue={(option, value) => option.RS === value.RS && option.GEN === value.GEN}
          // onChange of input dispatch new selected district or initial value (ags: 00000, name: germany) if input is cleared
          onChange={(_event, newValue: CountyItem | null) => {
            dispatch(
              selectDistrict({
                ags: newValue?.RS ?? '00000',
                name: newValue?.GEN ?? t('germany'),
                type: newValue?.BEZ ?? '',
              })
            );
          }}
          // enable clearing/resetting the input field with escape key
          clearOnEscape
          // provide countyList as options for drop down
          options={countyList}
          // group dropdown contents by first letter (json array needs to be sorted alphabetically by name for this to work correctly)
          groupBy={(option) => option.GEN[0]}
          // provide function to display options in dropdown menu
          getOptionLabel={(option) => `${option.GEN} ${option.BEZ ? `(${t(`BEZ.${option.BEZ}`)})` : ''}`}
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
                placeholder={t('search')}
              />
            </div>
          )}
        />
      </Box>
    </Container>
  );
}
