import {Theme} from '@mui/material/styles';
import {createStyles, makeStyles} from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';
import {useAppSelector} from '../../store/hooks';
import {alpha, Box, InputBase} from '@mui/material';

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
    <Box display='flex' flexDirection='row' justifyContent='center' alignItems='center'>
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
    </Box>
  );
}
