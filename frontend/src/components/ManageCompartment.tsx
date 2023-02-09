import React, {useEffect, useState} from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTranslation} from 'react-i18next';
import {Close, ConstructionOutlined, DataObjectSharp, DeleteForever, FilterSharp, GroupAdd, SettingsBackupRestoreTwoTone, Visibility, VisibilityOffOutlined} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';
import {GroupFilter} from '../types/group';
import {CompartmentFilter} from '../types/compartment';
import {setCompartmentFilter,
  deleteCompartmentFilter,
  toggleCompartmentFilter,} from '../store/DataSelectionSlice';
import {Dictionary} from '../util/util';
import ConfirmDialog from './shared/ConfirmDialog';
import {InfectionTags, VaccinationTags_OLD, VaccinationTags, ConfirmedTags} from './temp/CompartmentMappings'
import { filter } from '@amcharts/amcharts4/.internal/core/utils/Iterator';


export function ManageCompartment(props: {onClose: () => void}): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();

  const [selectedFilter, setSelectedFilter] = useState<CompartmentFilter | null>(null);
  console.log("selectedFilter", selectedFilter)
  const filterList = useAppSelector((state) => state.dataSelection.compartmentFilter);
  const CompartmentTags: any[] = [];
  CompartmentTags.push(...Object.entries(InfectionTags), ...Object.entries(VaccinationTags_OLD), ...Object.entries(VaccinationTags), ...Object.entries(ConfirmedTags))


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: '1',
        padding: theme.spacing(4),
        alignItems: 'center',
      }}
    >
      <Box
        id='compartment-filter-dialog-title-bar'
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr repeat(1, auto) 1fr',
          gridColumnGap: '5px',
          alignItems: 'center',
          justifyItems: 'center',
          width: '100%',
          marginBottom: theme.spacing(2),
        }}
      >
        <div />
        <Typography variant='h1'>{t('compartment-filters.title')}</Typography>
        <IconButton color='primary' sx={{marginLeft: 'auto'}} onClick={props.onClose}>
          <Close />
        </IconButton>
      </Box>
      <Divider orientation='horizontal' variant='middle' flexItem />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: '1',
          width: '100%',
        }}
      >
        <Box
          sx={{
            minWidth: '300px',
            marginRight: theme.spacing(3),
            marginTop: theme.spacing(2),
            padding: theme.spacing(2),
          }}
        >
          
      {Object.values(filterList)?.map((item) => (  
            <CompartmentFilterCard // For showing the group filter list on the right side
              key={item.id}
              item={item}
              selected={selectedFilter?.id === item.id}
              selectFilterCallback={(filter) => setSelectedFilter(filter)}
            />
          )
          )}

            
           <Card   // Area under the group filter listing. Only needed if reset button is needed over there
            variant='outlined'
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: theme.spacing(1),
              borderColor: theme.palette.primary.main,
            }}
          >
            <CardActionArea
              aria-label={t('compartment-filters.add-group')}
              onClick={() => {
                const compartments: Array<{selection: [string,any][]}> = [{selection: []}];
             //   groupCategories?.results?.forEach((group) => (groups[group.key] = []));
             //select?.results?.forEach((iter: { idx: string | number; }) => (groups[iter.idx] = []));
  
               // setSelectedFilter({id: crypto.getRandomValues.name, name: '', toggle: false, groups: groups});
               setSelectedFilter({id: crypto.randomUUID(), name: '', toggle: false, compartments: compartments });
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant='button' sx={{color: theme.palette.primary.main}}>
                  {t('compartment-filters.add-group')}
                </Typography>
                <GroupAdd color='primary' />
              </CardContent>
            </CardActionArea> 
          </Card>  
        </Box>
        <Divider orientation='vertical' flexItem />
        
         {selectedFilter ? (  // if the filter is selected, it will show the GroupFilterEditor.
          <CompartmentFilterEditor
            key={selectedFilter.id}
            filter={selectedFilter}
            selectFilterCallback={(filter) => setSelectedFilter(filter)}
          />
         
        ) : ( // if filter is not selected it will show a button to add a filter.
          <Box
            sx={{
              display: 'flex',
              flexGrow: '1',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant='body1'>{t('compartment-filters.nothing-selected')}</Typography>
            <Button
              variant='outlined'
              aria-label={t('compartment-filters.add-group')}
              sx={{marginTop: theme.spacing(2)}}
              onClick={() => {
                const compartments: Array<{selection: [string,any][]}> = [{selection: []}];
             
               setSelectedFilter({id: crypto.randomUUID(), name: '', toggle: false, compartments: compartments});
              }}
            >
              <GroupAdd color='primary' />
            </Button>
          </Box>
        )} 
      </Box>
    </Box>
  );
}

interface CompartmentFilterCardParams {
  item: CompartmentFilter;
  selected: boolean;
  selectFilterCallback: (name: CompartmentFilter | null) => void;
  
}

function CompartmentFilterCard(props: CompartmentFilterCardParams) {
  const theme = useTheme();
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
 
  return (
    <Card
      variant='outlined'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing(1),
      }}
    >
      <CardActionArea
        onClick={() => {
          props.selectFilterCallback(props.item) ;
         
         // props.selectFilterCallback(props.selected ? null : props.item);
        }}
      >
        <CardContent sx={{backgroundColor: props.selected ? theme.palette.info.main : theme.palette.background.paper}}>
          <Typography
            variant='body1'
            sx={{color: props.selected ? theme.palette.info.contrastText : theme.palette.text.primary}}
          >
            {props.item.name}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Divider orientation='vertical' variant='middle' flexItem />
      <CardActions>
        <Checkbox
          checkedIcon={<Visibility />}
          icon={<VisibilityOffOutlined color='disabled' />}
          checked={props.item.toggle}
          onClick={() => {
            dispatch(toggleCompartmentFilter(props.item.id));
          }}
        />
        <ConfirmDialog
          open={confirmDialogOpen}
          title={t('compartment-filters.confirm-deletion-title')}
          text={t('compartment-filters.confirm-deletion-text', {groupName: props.item.name})}
          onAnswer={(answer) => {
            if (answer) {
              dispatch(deleteCompartmentFilter(props.item.id));
              props.selectFilterCallback(null);
            }
            setConfirmDialogOpen(false);
          }}
        />
        <IconButton onClick={() => setConfirmDialogOpen(true)}>
          <DeleteForever />
        </IconButton>
      </CardActions>
    </Card>
  );
}

function CompartmentFilterEditor(props: {
  filter: CompartmentFilter;
  selectFilterCallback: (name: CompartmentFilter | null) => void;
}): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [name, setName] = useState(props.filter.name);
  const [compartments, setCompartments] = useState(props.filter.compartments);
  
  const [valid, setValid] = useState(name.length > 0 && Object.values(compartments).every((compartments) => compartments.selection.length > 0));
  const CompartmentTags: any[] = [];
  CompartmentTags.push(...Object.entries(InfectionTags), ...Object.entries(VaccinationTags_OLD), ...Object.entries(VaccinationTags), ...Object.entries(ConfirmedTags))
  const [currentIdx, setCurrentIdx] = useState(1);
  /* console.log("`${props.filter.groups[0]}`", `${t(`${props.filter.groups[0]}`)}`) //, t(`${props.filter.groups[0]}`) ) //(item.selection as string[]).join(" ")(option) => `${t(`${option[0]}`)
  //const objLength = obj => Object `${t(`${option[0]}`)}`
  const [select, setSelected] = useState<any>(
   // props.filter!== undefined? 
     [
    {selection:[ t(`  ${props.filter.groups}   `)], idx:props.filter.}
     ] 
     //:{selection: ["  "], idx: 0}

  );  
 

  const removeAutocomplete = (i:number) => {
    const list = [...select];
    list.splice(i, 1)
    setSelected(list);
  };
  
  const addAutocomplete = () => {
    setSelected([...select, {selection: [], idx: currentIdx}]);
    setCurrentIdx(currentIdx + 1)
  };
*/


function toggleCompartment() {
  setCompartments({
    ...compartments});
}

const removeAutocomplete = (i:number) => {
  const list = [...compartments];
  list.splice(i, 1)
  setCompartments(list);
};

  useEffect(() => {
    setValid(name.length > 0);
  }, [name]);

  
  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: '1',
        flexDirection: 'column',
        margin: theme.spacing(3),
      }}
    >
      <TextField
        label={t('compartment-filters.name')}
        variant='outlined'
        defaultValue={name}
        autoFocus={true}
        error={name.length === 0}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setName(e.target.value)}
      />
      <Box
        sx={{
          display: 'flex',
          flexGrow: '1',
          flexDirection: 'row',
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        }}
      >
 
          <Box
           // key={item.idx}
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
{/* 
        {select.map((item: { selection: any[] | undefined; idx: string | number;})=>{  
        
      return( */}
      {compartments.map((rowCompartments, idx) => {
        console.log("Loop autocomplete",idx, rowCompartments);
        
        return(
            <FormGroup
            row 
            >
        
                  <Autocomplete multiple
                  id="main-compartments"
                  options={CompartmentTags}
                  isOptionEqualToValue={(option:[string, any], value: [string, any])=> option[0]===value[0]}
                  getOptionLabel={(option) => `${t(`${option[0]}`)}`}
                  defaultValue={compartments[idx].selection}
                  onChange={(_e, value) => {
                    setCompartments((old) => {
                      return old.map((oldValue, index) => {
                        if (index === idx) return {selection: value}
                        else return oldValue
                      })
                    })
                  }
                  }
                  /*
                  inputValue={
                    rowCompartments.selection ? rowCompartments.selection.map((value) => value[0]).join(' ') : ''}
                  */

                    renderInput={
                      (params) => (
                      <TextField
                          {...params}
                        label="Select"
                        size="medium"
                        margin="dense"
                        color="primary"
                        style={{
                       // width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        width: 'fit-content'
                        }}
                      />)
                    }
                    
                      fullWidth
                  />
        <Box
        sx={{
          display: 'flex',
          flexGrow: '1',
          flexDirection: 'row',
          alignItems:"center",
          margin:2
        }}
      >           
      <GroupAdd
        onClick={() => {
          setCompartments((old) => {
            old.push({selection: []});
            return old;
          })
        }}
        color='primary'/>
        
        {idx > 0 && <DeleteForever onClick={() =>removeAutocomplete(idx)}/>}
         
            {/* {select.length > 1 && <DeleteForever onClick={() =>removeAutocomplete(select.idx)}/>} 

          <GroupAdd onClick={addAutocomplete} color='primary'/> */}
          </Box>
          </FormGroup>

        )
      })} 
          </Box>

          </Box>
  

      <Box
        sx={{
          display: 'flex',
          flexGrow: '1',
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant='outlined'
          color='error'
          sx={{marginRight: theme.spacing(2)}}
          onClick={() => 
             props.selectFilterCallback(null)
            
         }
        >
          {t('compartment-filters.close')}
        </Button>
        <Button
          variant='outlined'
          color='primary'
          disabled={!valid}
          onClick={() => {
            const newFilter = {id: props.filter.id, name: name, toggle: true, compartments: compartments}; 
            dispatch(setCompartmentFilter(newFilter));
            console.log("new filter", newFilter)
          }}
        >
          {t('compartment-filters.apply')}
        </Button>
      </Box>
    </Box>
  );
}