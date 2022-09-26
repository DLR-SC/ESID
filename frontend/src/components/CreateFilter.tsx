import React from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  useGetGroupCategoriesQuery,
  useGetGroupSubcategoriesQuery,
  groupSubcategory,
  groupCategory,
} from 'store/services/groupApi';
import {deleteFilter, addFilter} from 'store/DataSelectionSlice';
import {Box, Button, FormControlLabel, FormGroup, TextField, ListItem, IconButton} from '@mui/material';
import {Dictionary} from 'util/util';
import DeleteIcon from '@mui/icons-material/Delete';
import {filter} from '../types/group';

interface CreateFilterProps {
  onclose: () => void;
}

export default function CreateFilter(props: CreateFilterProps): JSX.Element {
  const filterList = useAppSelector((state) => state.dataSelection.filter);
  const [err, raiseError] = React.useState(false);
  const [errText, setErrText] = React.useState('');

  const dispatch = useAppDispatch();
  const [currentName, setCurrentName] = React.useState('');

  const {data: groupSubcategories} = useGetGroupSubcategoriesQuery();
  const {data: groupCategories} = useGetGroupCategoriesQuery();

  const createSubcategories = (subcategory: groupSubcategory): JSX.Element => {
    return (
      <FormControlLabel
        key={subcategory.key}
        control={<input type={'checkbox'} id={subcategory.key} onClick={() => null} />}
        label={subcategory.description}
      />
    );
  };

  const createCategories = (category: groupCategory, subcategories: Array<groupSubcategory>): JSX.Element => {
    return (
      <Box
        key={category.key}
        sx={{
          flexGrow: '1',
        }}
      >
        <legend>{category.description}</legend>
        <FormGroup key={category.key}>
          {subcategories?.map((subcategory) =>
            subcategory.category == category.key ? createSubcategories(subcategory) : null
          )}
        </FormGroup>
      </Box>
    );
  };

  const groupName = (name: string) => {
    setCurrentName(name);
    raiseError(false);
    setErrText('');
  };

  const createGroup = () => {
    const selectedGroups = {} as Dictionary<string[]>;
    if (groupCategories && groupSubcategories) {
      if (groupCategories.results && groupSubcategories.results) {
        groupCategories.results.forEach((category) => {
          selectedGroups[category.key] = [] as string[];

          groupSubcategories.results?.forEach((subCategory) => {
            if (category.key == subCategory.category) {
              //cast HTMLElement to HTMLInputElement to read checked attribute
              if ((document.getElementById(subCategory.key) as HTMLInputElement).checked) {
                selectedGroups[category.key].push(subCategory.key);
              }
            }
          });
        });
      }
    }

    const filterNames = Array<string>();
    if (filterList) {
      for (let i = 0; i < filterList.length; i++) {
        filterNames.push(filterList[i].name);
      }
    }
    if (filterNames.includes(currentName)) {
      raiseError(true);
      setErrText('Gruppenname existiert bereits.');
    } else if (currentName == '') {
      raiseError(true);
      setErrText('Gruppe braucht einen Namen');
    } else {
      const tempFilter: filter = {
        name: currentName,
        toggle: true,
        groups: selectedGroups,
      };
      dispatch(addFilter(tempFilter));
    }
  };

  const delGroup = (name: string | null) => {
    if (name) {
      dispatch(deleteFilter(name));
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '1rem',
        }}
      >
        <TextField
          onChange={(event) => {
            groupName(event.target.value);
          }}
          id='TextFieldGroupName'
          size='small'
          label='Filtername'
          variant='outlined'
          name='testtt'
          error={err}
          helperText={errText}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignSelf: 'center',
        }}
      >
        <Box
          sx={{
            width: '80%',
            display: 'flex',
            flexDirection: 'row',
            paddingTop: '1rem',
            paddingLeft: '1rem',
          }}
        >
          {groupCategories?.results?.map((groupCategory) =>
            createCategories(groupCategory, groupSubcategories?.results as Array<groupSubcategory>)
          )}
        </Box>

        <Box
          sx={{
            borderLeft: `1px solid`,
            borderColor: 'divider',
            minHeight: '20vh',
            paddingLeft: '3rem',
            paddingRight: '3rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <legend>Erstellte Filter</legend>

          {filterList?.map((filterItem, i) => (
            <ListItem
              key={i}
              secondaryAction={
                <IconButton edge='end' aria-label='delete' onClick={() => delGroup(filterItem.name)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              {filterItem.name}
            </ListItem>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button
          sx={{
            color: 'red',
          }}
          onClick={() => {
            props.onclose();
          }}
        >
          Schließen
        </Button>

        <Button
          onClick={() => {
            createGroup();
          }}
        >
          Filter erstellen
        </Button>
      </Box>
    </Box>
  );
}
