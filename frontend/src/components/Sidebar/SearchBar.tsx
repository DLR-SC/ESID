import {createStyles, makeStyles} from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';
import {useAppSelector} from '../../store/hooks';
import {Box, Container, InputBase} from '@mui/material';

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

/** The Search bar component help Zoom in on a specific region of the Map */
export default function SearchBar(): JSX.Element {
  const classes = useStyles();
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);

  return (
    <Container>
      <Box
        className={classes.searchContainer}
        sx={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', alignContent: 'center'}}
      >
        <SearchIcon style={{paddingLeft: '10px', paddingRight: '5px'}} />
        <InputBase
          placeholder={selectedDistrict.name}
          classes={{input: classes.inputInput}}
          inputProps={{'aria-label': 'search'}}
          style={{flexGrow: 1}}
        />
      </Box>
    </Container>
  );
}
