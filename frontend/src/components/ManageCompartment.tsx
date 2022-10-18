import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTheme} from '@mui/material/styles';
import {selectCompartment, selectScenario, setMinMaxDates, toggleScenario} from 'store/DataSelectionSlice';
import ScenarioCard from './ScenarioCard';
import {Box, Button, Checkbox, Dialog, Divider, FormControlLabel, FormGroup, Grid, List, ListItemButton, ListItemText, Typography} from '@mui/material';
import {
  useGetSimulationModelQuery,
  useGetSimulationModelsQuery,
  useGetSimulationsQuery,
} from '../store/services/scenarioApi';
import {setCompartments, setScenarios} from 'store/ScenarioSlice';
import {dateToISOString, Dictionary} from 'util/util';
import {useGetRkiSingleSimulationEntryQuery} from '../store/services/rkiApi';
import {NumberFormatter} from '../util/hooks';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import ControlPointIcon from '@mui/icons-material/ControlPoint';  
import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {InfectionTags, VaccinationTags_OLD, VaccinationTags, ConfirmedTags} from './temp/CompartmentMappings'
import { useTranslation } from 'react-i18next';
interface ManageCompartmentProps{
    onclose: () => void; 
}


export default function ManageCompartment(props: ManageCompartmentProps): JSX.Element{
  const compartmentList = ['Infected', 'Hospitalized', 'ICU', 'Dead', 'Exposed', 'Recovered', 'Carrier', 'Susceptible'];
  const {t} = useTranslation('global');
  const CompartmentTags = []
  CompartmentTags.push(...Object.entries(InfectionTags), ...Object.entries(VaccinationTags_OLD), ...Object.entries(VaccinationTags), ...Object.entries(ConfirmedTags))
/*   CompartmentTags.forEach((entry) => {
    console.log(entry)
})
  */

 const createFilters =(): JSX.Element =>{
   console.log("clicked")
return(
<Autocomplete
                multiple
               // id="main-compartments"
                options={compartmentList}
              //  getOptionLabel={(option) => `${t(`${option[0]}`)}`}
               // getOptionLabel={(option) => `${option ? ` (${t(`${option.keys.name}`)})` : ''}`}
              //  defaultValue={['Infected']}
                renderInput={ (params) =>(
                  <TextField
                  {...params} 
                  //ref={params.InputProps.ref}
                  label="Compartments"
                  size="small"
                  margin="dense"
                  color="primary"
                  style={{
                    display: 'flex',
                  }}
                >
                  </TextField>

                )
                }
                
      />
)
}
 

return(

            <Box 
            sx={{
                width: '70%',
                display: 'flex',
                flexDirection: 'row',
                alignSelf: 'center',
                //minWidth:"200px",
                //minHeight:"200px"
              }}
            >
{/*               <Stack direction="row" alignItems="right" gap={1}>
              <CloseIcon           
               onClick={() => {
            props.onclose();
          }}/>
               </Stack> */}

           <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '1rem',
          paddingLeft: '1rem',
          paddingRight:'1rem'
        }}
      >
       {/*  <Stack spacing={1} sx={{ width: 300 }}>
        </Stack> */}
            <Autocomplete
                multiple
                id="main-compartments"
                options={CompartmentTags}
                getOptionLabel={(option) => `${t(`${option[0]}`)}`}
               // getOptionLabel={(option) => `${option ? ` (${t(`${option.keys.name}`)})` : ''}`}
              //  defaultValue={['Infected']}
                renderInput={ (params) =>(
                  <TextField
                  {...params} 
                  //ref={params.InputProps.ref}
                  label="Compartments"
                  size="small"
                  margin="dense"
                  color="primary"
                  style={{
                    display: 'flex',
                  }}
                >
                  </TextField>

                )
                }
                
      />
            <Grid container justifyContent="center">
          <ControlPointIcon onClick={createFilters}/>
          </Grid>
              


            {/* <Autocomplete
                multiple
                id="main-compartments"
                options={compartmentList}
                //getOptionLabel={(option) => option.}
              //  defaultValue={['Infected']}
                renderInput={ (params) =>(
                  <TextField
                  {...params} 
                  //ref={params.InputProps.ref}
                  label="Compartments"
                  size="small"
                  margin="dense"
                  color="primary"
                  style={{
                    display: 'flex',
                  }}
                 
                >
                  </TextField>

                )
                }
                
      />

          <Grid container justifyContent="center">
          <ControlPointIcon/>
          </Grid>
              

<Autocomplete
                multiple
                id="main-compartments"
                options={compartmentList}
                //getOptionLabel={(option) => option.}
              //  defaultValue={['Infected']}
                renderInput={ (params) =>(
                  <TextField
                  {...params} 
                  //ref={params.InputProps.ref}
                  label="Compartments"
                  size="small"
                  margin="dense"
                  color="primary"
                  style={{
                    display: 'flex',
                  }}
                >
                  </TextField>

                )
                }    
      /> */}

<Button
          sx={{
            color: 'blue',
          }}
          onClick={() => {
            props.onclose();
          }}
        >
          Add
        </Button> 
      
      </Box>


        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            paddingTop: '1rem',
            paddingLeft: '1rem',
            borderColor: 'divider',
           alignSelf: 'center'
          }}
        >

<Divider orientation="vertical" variant="middle"  flexItem/>
 <Box
      sx={{
        width: '20%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        //paddingTop: '1rem',
        paddingLeft: '1rem',
      }}
    >


<FormGroup>
<Box sx={{ display: 'flex',
            flexDirection: 'row'}} >
        <FormControlLabel control={<Checkbox defaultChecked />} label="Label" /> <DeleteForeverIcon      onClick={() => { props.onclose(); }}/>  </Box>  
        <Stack direction="row" >         <FormControlLabel  control={<Checkbox />} label="label" /><DeleteForeverIcon/>  </Stack>  
   
</FormGroup>
 

        </Box>

       
   
         
   </Box>

      
 
       {/*   
      <Stack direction="row"  gap={1} spacing={2} sx={{ width: 300 }}>
              
             
        
        </Stack> */}

               </Box>
          

    )

}