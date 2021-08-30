import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import {createStyles, alpha, Theme, makeStyles} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import {useAppSelector} from '../store/hooks';
import {Box} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchContainer: {
      width: '90%',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 1),
    },
    searchIcon: {
      position: 'absolute',
      padding: theme.spacing(0, 2),
      pointerEvents: 'none',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      flexGrow: 1,
    },
  })
);

/** The Search bar component help Zoom in on a specific region of the Map */
export default function SearchBar(): JSX.Element {
  const classes = useStyles();
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);

  return (
    <Box className={classes.searchContainer} display='flex' flexDirection='column' justifyContent='center'>
      <Box className={classes.searchIcon} display='flex' justifyContent='center'>
        <SearchIcon />
      </Box>
      <InputBase
        placeholder={selectedDistrict.name}
        classes={{input: classes.inputInput}}
        inputProps={{'aria-label': 'search'}}
      />
    </Box>
  );
}
