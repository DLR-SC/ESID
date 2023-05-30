import React, {useCallback, useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Close from '@mui/icons-material/Close';
import DeleteForever from '@mui/icons-material/DeleteForever';




import Visibility from '@mui/icons-material/Visibility';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import {useTheme} from '@mui/material/styles';
import {GroupFilter} from '../types/group';
import { GroupSubcategory, useGetGroupCategoriesQuery, useGetGroupSubcategoriesQuery } from '../store/services/groupApi';
import { setGroupFilter, deleteGroupFilter, toggleGroupFilter} from '../store/DataSelectionSlice';
import {Dictionary} from '../util/util';
import ConfirmDialog from './shared/ConfirmDialog';
import AddBoxIcon from '@mui/icons-material/AddBox';

import Autocomplete from '@mui/material/Autocomplete';


const namesauto = [
{title:"Oliver Hansen" },
{title:"Van Henry" },
{title:"April Tucker" },
{title:"Ralph Hubbard" },
{title:"Omar Alexander" },
{title:"Carlos Abbott" },
{title:"Miriam Wagner" },
{title:"Bradley Wilkerson" },
{title:"Virginia Andrews" },
{title:"Kelly Snyder" },

]


/**
 * This dialog provides an editor to create, edit, toggle and delete group filters. It uses a classic master detail view
 * with the available filters on the left and the filter configuration on the right.
 *
 * @param props Contains an onCloseRequest function, which is called, when the close button is called. So please handle
 * it and allow the dialog to close. Additionally, an unsavedChangesCallback gives info, if the dialog currently contains
 * changes that weren't saved.
 */
 export function ManageCompartments(props: {
 	onCloseRequest: () => void;
 	unsavedChangesCallback: (unsavedChanges: boolean) => void;
 }): JSX.Element {
 	const {t} = useTranslation();
 	const theme = useTheme();

 	const {data: groupCategories} = useGetGroupCategoriesQuery();

 	const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);

 	// The currently selected filter.
 	const [selectedGroupFilter, setSelectedGroupFilter] = useState<GroupFilter | null>(null);

 	// A filter the user might open. It will first be checked, if unsaved changes are present.
 	const [nextSelectedGroupFilter, setNextSelectedGroupFilter] = useState<GroupFilter | null>(null);

 	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
 	const [unsavedChanges, setUnsavedChanges] = useState(false);

 	// This effect ensures that the user doesn't discard unsaved changes without confirming it first.
 	useEffect(() => {
 		if (nextSelectedGroupFilter && nextSelectedGroupFilter.id !== selectedGroupFilter?.id) {
 			// A new group filter has been selected.

 			if (selectedGroupFilter && unsavedChanges) {
 				// There are unsaved changes. Ask for confirmation first!
 				setConfirmDialogOpen(true);
 			} else {
 				// Everything is saved. Change the selected filter.
 				setSelectedGroupFilter(nextSelectedGroupFilter);
 			}
 		} else if (!nextSelectedGroupFilter && !unsavedChanges) {
 			// This case is handled, when the user presses the 'abort' button.
 			setSelectedGroupFilter(null);
 		}
 		props.unsavedChangesCallback(unsavedChanges);
 	}, [unsavedChanges, nextSelectedGroupFilter, selectedGroupFilter, props]);

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
 		id='group-filter-dialog-title-bar'
 		sx={{
 			display: 'grid',
 			gridTemplateColumns: '1fr auto 1fr',
 			gridColumnGap: '5px',
 			alignItems: 'center',
 			justifyItems: 'center',
 			width: '100%',
 			marginBottom: theme.spacing(2),
 		}}
 		>
 		<div />
 		<Typography variant='h1'>{t('Comparments')}</Typography>
 		<IconButton color='primary' sx={{marginLeft: 'auto'}} onClick={props.onCloseRequest}>
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
 		{Object.values(groupFilterList || {})?.map((item) => (
 			<GroupFilterCard
 			key={item.id}
 			item={item}
 			selected={selectedGroupFilter?.id === item.id}
 			selectFilterCallback={(groupFilter) => setNextSelectedGroupFilter(groupFilter)}
 			/>
 			))}
 		<Card
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
 		aria-label={t('add-button-filters.add-group')}
 		onClick={() => {
 			const groups: Dictionary<Array<string>> = {};
 			groupCategories?.results?.forEach((group) => (groups[group.key] = []));
 			setNextSelectedGroupFilter({id: crypto.randomUUID(), name: '', isVisible: false, groups: groups});
 		}}
 		>
 		
 		</CardActionArea>


 		</Card>
 		<Card
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
 		aria-label={t('add-button-filters.add-group')}
 		onClick={() => {
 			const groups: Dictionary<Array<string>> = {};
 			groupCategories?.results?.forEach((group) => (groups[group.key] = []));
 			setNextSelectedGroupFilter({id: crypto.randomUUID(), name: '', isVisible: false, groups: groups});
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
 		<Typography variant='button' sx={{
 			color: theme.palette.primary.main,
 			marginLeft:'auto',
 			marginRight:'auto',

 		}}>
 		{t('group-filters.add-group')}
 		</Typography>

 		</CardContent>
 		</CardActionArea>
 		</Card>
 		</Box>
 		<Divider orientation='vertical' flexItem />


 		{selectedGroupFilter ? (
 			<>
 			<GroupFilterEditor
 			key={selectedGroupFilter.id}
 			groupFilter={selectedGroupFilter}
 			selectGroupFilterCallback={(groupFilter) => setNextSelectedGroupFilter(groupFilter)}
 			unsavedChangesCallback={(edited) => setUnsavedChanges(edited)}
 			/>




 			</>
 			) : (
 			<Box
 			sx={{
 				display: 'flex',
 				flexGrow: '1',
 				flexDirection: 'column',
 				justifyContent: 'center',
 				alignItems: 'center',
 			}}
 			>
 			<Typography variant='body1'>{t('group-filters.nothing-selected')}</Typography>
 			<Button
 			variant='outlined'
 			aria-label={t('group-filters.add-group')}
 			sx={{marginTop: theme.spacing(2)}}
 			onClick={() => {
 				const groups: Dictionary<Array<string>> = {};
 				groupCategories?.results?.forEach((group) => (groups[group.key] = []));
 				setNextSelectedGroupFilter({id: crypto.randomUUID(), name: '', isVisible: false, groups: groups});
 			}}
 			>
 			<AddBoxIcon/>

 			</Button>
 			</Box>
 			)}
 			</Box>
 			<ConfirmDialog
 			open={confirmDialogOpen}
 			title={t('group-filters.confirm-discard-title')}
 			text={t('group-filters.confirm-discard-text')}
 			abortButtonText={t('group-filters.close')}
 			confirmButtonText={t('group-filters.discard')}
 			onAnswer={(answer) => {
 				if (answer) {
 					setSelectedGroupFilter(nextSelectedGroupFilter);
 				} else {
 					setNextSelectedGroupFilter(null);
 				}
 				setConfirmDialogOpen(false);
 			}}
 			/>
 			</Box>
 			);
}

interface GroupFilterCardProps {
	/** The GroupFilter item to be displayed. */
	item: GroupFilter;

	/** Whether the filter is selected or not. If it is selected, the detail view is displaying this filter's config. */
	selected: boolean;

  /**
   * Callback function that is called when the filter is selected or unselected.
   *
   * @param groupFilter - Either this filter, if it was selected or null, if it was unselected.
   */
   selectFilterCallback: (groupFilter: GroupFilter | null) => void;
 }

/**
 * GroupFilterCard component displays a card that represents a single filter for the group filter list. The card shows
 * the filter name, a toggle switch to turn on or off the filter, and a delete button to remove the filter.
 */
 function GroupFilterCard(props: GroupFilterCardProps) {
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
 			props.selectFilterCallback(props.selected ? null : props.item);
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
 		checked={props.item.isVisible}
 		onClick={() => {
 			dispatch(toggleGroupFilter(props.item.id));
 		}}
 		/>
 		<ConfirmDialog
 		open={confirmDialogOpen}
 		title={t('group-filters.confirm-deletion-title')}
 		text={t('group-filters.confirm-deletion-text', {groupName: props.item.name})}
 		onAnswer={(answer) => {
 			if (answer) {
 				dispatch(deleteGroupFilter(props.item.id));
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

 interface GroupFilterEditorProps {
 	/** The GroupFilter item to be edited. */
 	groupFilter: GroupFilter;

  /**
   * Callback function that is called, when a new filter is created, so it will be selected immediately or when the user
   * wants to close the editor.
   *
   * @param groupFilter - Either the current filter or null when the user wants to close the current filter's editor.
   */
   selectGroupFilterCallback: (groupFilter: GroupFilter | null) => void;

  /**
   * A callback that notifies the parent, if there are currently unsaved changes for this group filter.
   *
   * @param unsavedChanges - If the group filter has been modified without saving.
   */
   unsavedChangesCallback: (unsavedChanges: boolean) => void;
 }


/**
 * This is the detail view of the GroupFilter dialog. It allows to edit and create groups. It has a text field for the
 * name at the top and columns of checkboxes for groups in the center. It requires that at least one checkbox of each
 * group is selected before the apply button becomes available. It is also possible to discard changes by clicking the
 * abort button before applying the changes.
 *
 * @param props
 */
 function GroupFilterEditor(props: GroupFilterEditorProps): JSX.Element {
 	const {t} = useTranslation();
 	const theme = useTheme();
 	const dispatch = useAppDispatch();

 	const {data: groupCategories} = useGetGroupCategoriesQuery();
 	const {data: groupSubCategories} = useGetGroupSubcategoriesQuery();

 	const [name, setName] = useState(props.groupFilter.name);
 	const [groups, setGroups] = useState(props.groupFilter.groups);
   // const [groupfilterdata, setgroupfilterdata] = React.useState<string[]>([]);
   // const fixedOptions = [namesauto[1]];
   // const [value, setValue] = useState([...fixedOptions, namesauto[1]]);
   // // Every group must have at least one element selected to be valid.
   const [valid, setValid] = useState(name.length > 0 && Object.values(groups).every((group) => group.length > 0));
   const [unsavedChanges, setUnsavedChanges] = useState(false);

   const [counter, setCounter] = useState(0);

   const handleClick = () => {
     setCounter(counter + 1);
     console.log(counter);
   };

   const removerow = () => {
     setCounter(counter - 1);
     console.log(counter);
   };





   // Checks if the group filer is in a valid state.
   useEffect(() => {
     setValid(name.length > 0 && Object.values(groups).every((group) => group.length > 0));
   }, [name, groups, props]);

   // Updates the parent about the current save state of the group filter.
   useEffect(() => {
     props.unsavedChangesCallback(unsavedChanges);
   }, [props, unsavedChanges]);
   console.log('haloo im here ',name)
   const toggleGroup = useCallback(
     (subGroup: GroupSubcategory) => {
       // We need to make a copy before we modify the entry.
       let category = [...groups[subGroup.category]];

       if (category.includes(subGroup.key)) {
         category = category.filter((key) => key !== subGroup.key);
       } else {
         category.push(subGroup.key);
       }

       setGroups({
         ...groups,
         [subGroup.category]: category,
       });
       setUnsavedChanges(true);


     },
     [groups, setGroups]
     );

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
     label={t('group-filters.name')}
     variant='outlined'
     defaultValue={name}
     autoFocus={true}
     error={name.length === 0}
     onFocus={(e) => e.target.select()}
     onChange={(e) => {
       setUnsavedChanges(true);
       setName(e.target.value);
     }}
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
     {groupCategories?.results?.map((group) => (
       <Box
       key={group.key}
       sx={{
         display: 'flex',
         flexDirection: 'column',
       }}
       >
       <Typography
       color={groups[group.key].length > 0 ? theme.palette.text.primary : theme.palette.error.main}
       variant='h2'
       >
       {group.description}
       </Typography>
       <FormGroup>
       {groupSubCategories?.results
         ?.filter((subCategory) => subCategory.category === group.key)
         .map((subGroup) => (
           <FormControlLabel
           key={subGroup.key}
           label={subGroup.description}
           control={
             <Checkbox
             checked={groups[group.key].includes(subGroup.key)}
             onClick={() => toggleGroup(subGroup)}
             />
           }
           />
           ))}

         </FormGroup>
         </Box>
         ))}
     </Box>

     <Autocomplete
     multiple
     id="tags-outlined"
     sx={{
       marginTop: theme.spacing(2),
       marginBottom: theme.spacing(2),
     }}
      
     options={namesauto.map((option) => option.title)}
     defaultValue={[namesauto[1].title]}
     freeSolo

     renderInput={(params) => (
       <TextField
       {...params}
  
       label="Name"
       placeholder="NAme"
       />
       )}
     />


  
     {Array.from(Array(counter)).map((c) => {
       return (
         /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */

         <Box key={c} sx={{
           display: 'flex',
           marginTop: theme.spacing(2),
           marginBottom: theme.spacing(2),

         }}>
         <Autocomplete
         multiple
         id="tags-filled"
    
         sx={{ mt: 20, display: 'flex', width:700}}
         options={namesauto.map((option) => option.title)}
         defaultValue={[namesauto[1].title]}
         freeSolo
      
         
         renderInput={(params) => (
           <TextField
           {...params}
           
           label="freeSolo"
           placeholder="Favorites"
           />
           )}
         />

         <IconButton color='primary' sx={{marginLeft: 'auto'}} onClick={removerow}>
         <Close />
         </IconButton>
         </Box>

         )
     })}

     <Box
     sx={{
       display: 'flex',
       flexGrow: '1',
       flexDirection: 'row',
       justifyContent: 'flex-end',
     }}
     >

     <Button
     onClick={handleClick}
     variant='outlined'
     color='primary'
     sx={{
       display: 'flex',
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'space-between',
       marginRight:'auto',

     }}
     >

     <AddBoxIcon/>

     </Button>

     <Button
     variant='outlined'
     color='error'
     sx={{marginRight: theme.spacing(2)}}
     onClick={() => {
       setUnsavedChanges(false);
       props.selectGroupFilterCallback(null);
     }}
     >
     {t('group-filters.close')}
     </Button>
     <Button
     variant='outlined'
     color='primary'
     disabled={!valid || !unsavedChanges}
     onClick={() => {
       setUnsavedChanges(false);
       const newFilter = {id: props.groupFilter.id, name: name, isVisible: true, groups: groups};
       dispatch(setGroupFilter(newFilter));
       props.selectGroupFilterCallback(newFilter);
     }}
     >
     {t('group-filters.apply')}
     </Button>
     </Box>
     </Box>

     );
}




// export default function MultipleSelect() {
  //   const theme = useTheme();
  //   const [personName, setPersonName] = React.useState<string[]>([]);

  //   const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    //     const {
      //       target: { value },
      //     } = event;
      //     setPersonName(
      //       // On autofill we get a stringified value.
      //       typeof value === "string" ? value.split(",") : value
      //     );
      //   };

      //   return (
      //     <Container maxWidth="md" sx={{ mt: 20 }}>
      //       <FormControl sx={{ m: 1, width: 600 }}>
      //         <InputLabel id="demo-multiple-name-label">Name</InputLabel>
      //         <Select
      //           labelId="demo-multiple-name-label"
      //           id="demo-multiple-name"
      //           multiple
      //           value={personName}
      //           onChange={handleChange}
      //           input={<OutlinedInput label="Name" />}

      //         >
      //           {names.map((name) => (
        //             <MenuItem
        //               key={name}
        //               value={name}
        //               style={getStyles(name, personName, theme)}
        //             >
        //              {name} 
        //             </MenuItem>
        //           ))}
        //         </Select>
        //       </FormControl>
        //     </Container>
        //   );
// }