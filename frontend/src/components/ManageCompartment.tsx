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
import {Close, ConstructionOutlined, DeleteForever, FilterSharp, GroupAdd, SettingsBackupRestoreTwoTone, Visibility, VisibilityOffOutlined} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';
import {GroupFilter} from '../types/group';
import {GroupSubcategory, useGetGroupCategoriesQuery, useGetGroupSubcategoriesQuery} from '../store/services/groupApi';
import {addFilter, deleteFilter, toggleFilter} from '../store/DataSelectionSlice';
import {Dictionary} from '../util/util';
import ConfirmDialog from './shared/ConfirmDialog';
import {InfectionTags, VaccinationTags_OLD, VaccinationTags, ConfirmedTags} from './temp/CompartmentMappings'
import { math } from '@amcharts/amcharts5';
import { setSelectionRange } from '@testing-library/user-event/dist/utils';

export function ManageCompartment(props: {onClose: () => void}): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();

  const {data: groupCategories} = useGetGroupCategoriesQuery();

  const [selectedFilter, setSelectedFilter] = useState<GroupFilter | null>(null);
  const filterList = useAppSelector((state) => state.dataSelection.filter);
  const CompartmentTags: any[] = [];
  CompartmentTags.push(...Object.entries(InfectionTags), ...Object.entries(VaccinationTags_OLD), ...Object.entries(VaccinationTags), ...Object.entries(ConfirmedTags))
 
   const [select, setSelected] = useState<any>([
    {selection:[], idx:0}
  ]);


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
            <GroupFilterCard // For showing the group filter list on the right side
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
                const groups: Dictionary<Array<string>> = {};
             //   groupCategories?.results?.forEach((group) => (groups[group.key] = []));
             select?.results?.forEach((iter: { idx: string | number; }) => (groups[iter.idx] = []));
             console.log("groups here", groups)
               // setSelectedFilter({id: crypto.getRandomValues.name, name: '', toggle: false, groups: groups});
               setSelectedFilter({id: crypto.randomUUID(), name: '', toggle: false, groups: groups});
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
          <GroupFilterEditor
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
                const groups: Dictionary<Array<string>> = {};
             
               setSelectedFilter({id: crypto.randomUUID(), name: '', toggle: false, groups: groups});
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

interface GroupFilterCardParams {
  item: GroupFilter;
  selected: boolean;
  selectFilterCallback: (name: GroupFilter | null) => void;
  
}

function GroupFilterCard(props: GroupFilterCardParams) {
  const theme = useTheme();
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  console.log("GroupFilterCardParams", props);
 
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
            dispatch(toggleFilter(props.item.id));
          }}
        />
        <ConfirmDialog
          open={confirmDialogOpen}
          title={t('compartment-filters.confirm-deletion-title')}
          text={t('compartment-filters.confirm-deletion-text', {groupName: props.item.name})}
          onAnswer={(answer) => {
            if (answer) {
              dispatch(deleteFilter(props.item.id));
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

function GroupFilterEditor(props: {
  filter: GroupFilter;
  selectFilterCallback: (name: GroupFilter | null) => void;
}): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {data: groupCategories} = useGetGroupCategoriesQuery();
  const {data: groupSubCategories} = useGetGroupSubcategoriesQuery();

  const [name, setName] = useState(props.filter.name);
  const [groups, setGroups] = useState(props.filter.groups);
  
  const [valid, setValid] = useState(name.length > 0 && Object.values(groups).every((group) => group.length > 0));
  const CompartmentTags: any[] = [];
  CompartmentTags.push(...Object.entries(InfectionTags), ...Object.entries(VaccinationTags_OLD), ...Object.entries(VaccinationTags), ...Object.entries(ConfirmedTags))
  const [currentIdx, setCurrentIdx] = useState(1);

  const [select, setSelected] = useState<any>([
    {selection:[], idx:0}
  ]);

  const removeAutocomplete = (i:number) => {
   
    const list = [...select];
    list.splice(i, 1)
    setSelected(list);
  };
  
  const addAutocomplete = () => {
    
    setSelected([...select, {selection: [], idx: currentIdx}]);
    setCurrentIdx(currentIdx + 1)
    
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
     {select.map((item: { selection: any[] | undefined; idx: string | number;})=>{  
        
      return(
            <FormGroup
            row 
            >
        
                  <Autocomplete multiple
                  id="main-compartments"
                  options={CompartmentTags}
                  getOptionLabel={(option) => `${t(`${option[0]}`)}`}
                  defaultValue={item.selection}
                  inputValue={
                    item.selection ? (item.selection as string[]).join(" "): "" }
                    renderInput={
                      (params) => (
                      <TextField
                          {...params}
                        label="Select"
                        size="medium"
                        margin="dense"
                        color="primary"
                        style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        }}
                      />)
                    }
                    onChange={(event, value) =>{
                    
                    select[item.idx] = value
                    setSelected(select)
                    
                   
                    }}

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
         
            {select.length > 1 && <DeleteForever onClick={() =>removeAutocomplete(select.idx)}/>} 

          <GroupAdd onClick={addAutocomplete} color='primary'/>
          </Box>
          </FormGroup>
            ) })} 
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
            const newFilter = {id: props.filter.id, name: name, toggle: true, groups: select};
            dispatch(addFilter(newFilter));
            console.log("new filter", newFilter)
          }}
        >
          {t('compartment-filters.apply')}
        </Button>
      </Box>
    </Box>
  );
}