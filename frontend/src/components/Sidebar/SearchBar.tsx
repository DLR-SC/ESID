import {createStyles, makeStyles} from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';
import React, {useEffect, useState} from 'react';
import {useAppSelector} from '../../store/hooks';
import {useAppDispatch} from '../../store/hooks';
import {selectDistrict} from '../../store/DataSelectionSlice';
import {Autocomplete, Box, Container} from '@mui/material';
import {useTranslation} from 'react-i18next';

// css theme variables
const theme = {
  colors: {
    primary: '#1976d2',
    background: '#f8f8f9',
    backgroundAccent: '#d3d2d8',
    backgroundAccentHover: '#8c8c8c',
  },
};

const useStyles = makeStyles(() =>
  createStyles({
    // css style for the container of the search bar
    searchContainer: {
      width: '100%',
      marginTop: '10px',
      marginBottom: '10px',
      borderRadius: 4,
      backgroundColor: theme.colors.background,
      borderStyle: 'solid',
      borderWidth: '2px',
      color: theme.colors.backgroundAccent,

      '&:hover': {
        color: theme.colors.backgroundAccentHover,
      },

      '&:hover *': {
        color: theme.colors.backgroundAccentHover,
      },

      '&:focus-within': {
        color: theme.colors.primary,
      },

      '&:focus-within *': {
        color: theme.colors.primary,
      },
    },

    // css style for the search bar input field
    searchInput: {
      flexGrow: 1,
      borderStyle: 'none',
      fontSize: '16px',
      padding: '5px',

      '&:focus': {
        outline: 'none',
      },
    },
  })
);

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
  const classes = useStyles();
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const [countyList, setCountyList] = useState([{RS: '', GEN: '', BEZ: ''}]);
  const {t} = useTranslation('global');
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
        className={classes.searchContainer}
        sx={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', alignContent: 'center'}}
      >
        <SearchIcon style={{paddingLeft: '10px', paddingRight: '5px'}} />
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
          sx={{flexGrow: 1}}
          // override default input field, placeholder is a fallback, as value should always be a selected district or germany (initial/default value)
          renderInput={(params) => (
            <div ref={params.InputProps.ref} style={{display: 'flex'}}>
              <input type='search' {...params.inputProps} className={classes.searchInput} placeholder={t('search')} />
            </div>
          )}
        />
      </Box>
    </Container>
  );
}
