import {createStyles, makeStyles} from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';
import React, {useEffect, useState} from 'react';
//import {useAppSelector} from '../../store/hooks';
import {Autocomplete, Box, Container, TextField} from '@mui/material';
import {useTranslation} from 'react-i18next';

const useStyles = makeStyles(() =>
  createStyles({
    searchContainer: {
      width: '100%',
      marginTop: '10px',
      marginBottom: '10px',
      borderRadius: 4,
      backgroundColor: '#FFF',
    },
    searchIcon: {
      position: 'absolute',
      pointerEvents: 'none',
    },
    inputInput: {
      padding: '1 1 1 0',
    },
  })
);

interface CountyItem {
  RS: string;
  GEN: string;
  BEZ: string;
}

/** The SearchBar component helps select a specific district of the map. */
export default function SearchBar(): JSX.Element {
  const classes = useStyles();
  //const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const [countyList, setCountyList] = useState([{RS: '', GEN: '', BEZ: ''}]);
  const {t} = useTranslation('global');

  useEffect(() => {
    console.log('init Search...');
    fetch('assets/lk_germany_reduced_list.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => {
        return response.json();
      })
      .then(
        // Resolve Promise
        (jsonlist: CountyItem[]) => {
          console.log(jsonlist);
          setCountyList(jsonlist);
        },
        // Reject Promise
        () => {
          console.warn('Did not receive proper county list');
        }
      );
    console.log(countyList);
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
          options={countyList}
          groupBy={(option) => option.GEN[0]}
          getOptionLabel={(option) => `${option.GEN} (${t(`BEZ.${option.BEZ}`)})`}
          sx={{flexGrow: 1, borderStyle: 'none'}}
          renderInput={(params) => <TextField {...params} label='Search' />}
        />
      </Box>
    </Container>
  );
}

/*
<InputBase
          placeholder={selectedDistrict.name}
          classes={{input: classes.inputInput}}
          inputProps={{'aria-label': 'search'}}
          style={{flexGrow: 1}}
        />
*/
