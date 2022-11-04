import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {Box, Button, Checkbox, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import {InfectionTags, VaccinationTags_OLD, VaccinationTags, ConfirmedTags} from './temp/CompartmentMappings'
import { useTranslation } from 'react-i18next';
import {filter} from '../types/group';
import {deleteFilter, addFilter} from 'store/DataSelectionSlice';

interface ManageCompartmentProps{
    onclose: () => void; 
}


export default function ManageCompartment(props: ManageCompartmentProps): JSX.Element{
  const filterList = useAppSelector((state) => state.dataSelection.filter);
  const {t} = useTranslation('global');
  const [err, raiseError] = React.useState(false);
  const [errText, setErrText] = React.useState('');
  const [currentName, setCurrentName] = React.useState('');
  const dispatch = useAppDispatch();
  const [select, setSelected] = useState<any>([
    {selection:[], idx:0}
  ]);
  const CompartmentTags:  any[] = [];
  const [checked, setChecked] = React.useState([0]);
  CompartmentTags.push(...Object.entries(InfectionTags), ...Object.entries(VaccinationTags_OLD), ...Object.entries(VaccinationTags), ...Object.entries(ConfirmedTags))


const groupName = (name: string) => {
  setCurrentName(name);
  raiseError(false);
  setErrText('');
};  	

const handleToggle = (value: number) => () => {
  const currentIndex = checked.indexOf(value);
  const newChecked = [...checked];

  if (currentIndex === -1) {
    newChecked.push(value);
  } else {
    newChecked.splice(currentIndex, 1);
  }
   console.log("value", select[value])
  setChecked(newChecked);
};


 const removeAutocomplete = (i:number) => {
  const list = [...select];
  list.splice(i, 1)
  setSelected(list);
};

const addAutocomplete = () => {
  setSelected([...select, [{}]]);
};
 

const createAutoComplete= select.map((item: { selection: any[] | undefined; idx: string | number;  })=>{

  return(
  <Box 
  sx={{
    width: '80%',
    //flexGrow:'1',
    display: 'flex',
    flexDirection: 'row',

  }}
>
  <Autocomplete
  
    multiple
    id="main-compartments"
    options={CompartmentTags}
    getOptionLabel={(option) => `${t(`${option[0]}`)}`}
    defaultValue={item.selection}
    style={{
      width: '80%',
      display: 'flex',
      flexDirection: 'column',
      }}
     onChange={(event, value) => {
      console.log("value", value)
     
      select[item.idx] = [value]
      setSelected(select)
     //setSelected(value)
    }}
 
  //  console.log(value[0])
  
// getOptionLabel={(option) => `${option ? ` (${t(`${option.keys.name}`)})` : ''}`}
//  defaultValue={['Infected']}
  renderInput={ (params) =>(
    <TextField
    {...params} 
    
    //ref={params.InputProps.ref}20
 
    label="Compartments"
    size="small"
    margin="dense"
    color="primary"
    style={{
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    }}
    
  >
    </TextField>

  )
  
  }     
/>

{select.length > 1 && <DeleteIcon onClick={() =>removeAutocomplete(select.idx)}>Remove</DeleteIcon>} 
</Box>
  )
});


const createFilters =() =>{

  const selectedGroups = [] as Array<string[]>;;
 /*  for (var i in select)
  {
    console.log(select[i][0])
    selectedGroups.push(select[i])
  } */
  
  selectedGroups.push(select)
  console.log("selectedGroups", selectedGroups)
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
    }  else {
      const tempFilter: filter = {
        name: currentName,
        toggle: true,
        groups: selectedGroups,
      };
      
    console.log("filterList", filterList, tempFilter)
      dispatch(addFilter(tempFilter));
    }

  };

  const delGroup = (name: string | null) => {
      if (name) {
        dispatch(deleteFilter(name));
      }
    };


return(
            <Box 
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
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
          name='Filtername'
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
        flexDirection: 'column',
        paddingTop: '1rem',
        paddingLeft: '2rem',
      }}
    > 
       <legend>Select Compartments</legend>
       {createAutoComplete}
    	
       <Button
       sx={{alignSelf: 'left'}}
              onClick={addAutocomplete}
              >Add more filters</Button> 
</Box>

           
          <Box
          sx={{
        
            borderLeft: `1px solid`,
            borderColor: 'divider',
            minHeight: '20vh',
            paddingLeft: '2rem',
            paddingRight: '3rem',
            display: 'flex',
            flexDirection: 'row',
          }}
        >

    
             <legend>Erstellte Filter</legend>

          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>    
          {filterList?.map((filterItem, i) => (
            <ListItem
              key={i}
              secondaryAction={
                <IconButton edge='end' aria-label='delete' onClick={() => delGroup(filterItem.name)}>
                  <DeleteIcon />
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton role={undefined} onClick={handleToggle(i)} dense> 
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={checked.indexOf(i) !== -1}
                  tabIndex={-1}
                  disableRipple

                />
              </ListItemIcon>
              {filterItem.name}
               </ListItemButton>
            </ListItem>
          ))}
          </List>
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
          sx={{
            color: 'blue',
          }}
          onClick={() => {
            createFilters();
          }}
        >
           Filter erstellen
        </Button> 
     
      </Box>
      </Box>


    );

}

