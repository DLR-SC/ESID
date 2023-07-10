/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Close from '@mui/icons-material/Close';
import DeleteForever from '@mui/icons-material/DeleteForever';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import { useTheme } from '@mui/material/styles';

import { CompartmentFilter } from '../types/compartment';
// import { useGetGroupCategoriesQuery} from '../store/services/groupApi';

import { setCompartmentFilter, deletecompartmentFilter, togglecompartmentFilter } from '../store/DataSelectionFilter';
import { Dictionary } from '../util/util';
import ConfirmDialog from './shared/ConfirmDialog';
import AddBoxIcon from '@mui/icons-material/AddBox';

import Autocomplete from '@mui/material/Autocomplete';


const namesauto = [
  { title: "Oliver Hansen" },
  { title: "Van Henry" },
  { title: "April Tucker" },
  { title: "Ralph Hubbard" },
  { title: "Omar Alexander" },
  { title: "Carlos Abbott" },
  { title: "Miriam Wagner" },
  { title: "Bradley Wilkerson" },
  { title: "Virginia Andrews" },
  { title: "Kelly Snyder" },

]


export function ManageCompartments(props: {
  onCloseRequest: () => void;
  unsavedChangesCallback: (unsavedChanges: boolean) => void;
}): JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const compartmentFilterList = useAppSelector((state) => state.DataSelectionFilter.compartmentFilters);

  const [selectedCompartmentFilter, setSelectedCompartmentFilter] = useState<CompartmentFilter | null>(null);

  const [nextSelectedCompartmentFilter, setNextSelectedCompartFilter] = useState<CompartmentFilter | null>(null);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    if (nextSelectedCompartmentFilter && nextSelectedCompartmentFilter.id !== selectedCompartmentFilter?.id) {

      if (selectedCompartmentFilter && unsavedChanges) {
        setConfirmDialogOpen(true);
      } else {
        setSelectedCompartmentFilter(nextSelectedCompartmentFilter);
      }
    } else if (!nextSelectedCompartmentFilter && !unsavedChanges) {
      setSelectedCompartmentFilter(null);
    }
    props.unsavedChangesCallback(unsavedChanges);
  }, [unsavedChanges, nextSelectedCompartmentFilter, selectedCompartmentFilter, props]);

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
        <Typography variant='h1'>{t('group-filters.title-manage-compartments')}</Typography>
        <IconButton color='primary' sx={{ marginLeft: 'auto' }} onClick={props.onCloseRequest}>
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
          {Object.values(compartmentFilterList || {})?.map((item) => (
            <GroupFilterCard
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              key={item.id}
              item={item}
              selected={selectedCompartmentFilter?.id === item.id}
              selectFilterCallback={(compartmentFilter) => setNextSelectedCompartFilter(compartmentFilter)}
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
                const compartments: Dictionary<Array<string>> = {};
                setNextSelectedCompartFilter({ id: crypto.randomUUID(), name: '', filter: [], isVisible: false, compartments: compartments });
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
              aria-label={t('add-button-filters.add-group-compartments')}
              onClick={() => {
                const compartments: Dictionary<Array<string>> = {};
                setNextSelectedCompartFilter({ id: crypto.randomUUID(), name: '', filter: [], isVisible: false, compartments: compartments });
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
                  marginLeft: 'auto',
                  marginRight: 'auto',

                }}>
                  {t('group-filters.add-group')}
                </Typography>

              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
        <Divider orientation='vertical' flexItem />


        {selectedCompartmentFilter ? (
          <>
            <GroupFilterEditor
              key={selectedCompartmentFilter.id}
              compartmentFilter={selectedCompartmentFilter}
              selectGroupFilterCallback={(compartmentFilter) => setNextSelectedCompartFilter(compartmentFilter)}
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
              sx={{ marginTop: theme.spacing(2) }}
              onClick={() => {
                const compartments: Dictionary<Array<string>> = {};
                setNextSelectedCompartFilter({ id: crypto.randomUUID(), name: '', filter: [], isVisible: false, compartments: compartments });
              }}
            >
              <AddBoxIcon />

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
            setSelectedCompartmentFilter(nextSelectedCompartmentFilter);
          } else {
            setNextSelectedCompartFilter(null);
          }
          setConfirmDialogOpen(false);
        }}
      />
    </Box>
  );
}

interface GroupFilterCardProps {
  item: CompartmentFilter;

  selected: boolean;

  selectFilterCallback: (compartmentFilter: CompartmentFilter | null) => void;
}

function GroupFilterCard(props: GroupFilterCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
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
        <CardContent sx={{ backgroundColor: props.selected ? theme.palette.info.main : theme.palette.background.paper }}>
          <Typography
            variant='body1'
            sx={{ color: props.selected ? theme.palette.info.contrastText : theme.palette.text.primary }}
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
            dispatch(togglecompartmentFilter(props.item.id));
          }}
        />
        <ConfirmDialog
          open={confirmDialogOpen}
          title={t('group-filters.confirm-deletion-title')}
          text={t('group-filters.confirm-deletion-text', { groupName: props.item.name })}
          onAnswer={(answer) => {
            if (answer) {
              dispatch(deletecompartmentFilter(props.item.id));
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
  compartmentFilter: CompartmentFilter;

  selectGroupFilterCallback: (compartmentFilter: CompartmentFilter | null) => void;

  unsavedChangesCallback: (unsavedChanges: boolean) => void;
}


function GroupFilterEditor(props: GroupFilterEditorProps): JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();


  const [name, setName] = useState(props.compartmentFilter.name);
  const [groupfilterdata, setgroupfilterdata] = React.useState<string[]>(props.compartmentFilter.filter);
  const [valid, setValid] = useState(name.length > 0 && Object.values(groupfilterdata).every((group) => group.length > 0));
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [counter, setCounter] = useState(0);

  const handleClick = () => {
    setCounter(counter + 1);

  };

  const removerow = () => {
    setCounter(counter - 1);

  };

  useEffect(() => {
    setValid(name.length > 0 && Object.values(groupfilterdata).every((group) => group.length > 0));

  }, [name, groupfilterdata, props]);

  useEffect(() => {
    props.unsavedChangesCallback(unsavedChanges);
  }, [props, unsavedChanges]);



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
          setUnsavedChanges(false);
          setName(e.target.value);
        }}
      />



      <Autocomplete

        multiple
        id="tags-outlined"
        sx={{
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        }}

        options={namesauto.map((option) => option.title)}
        value={groupfilterdata}

        freeSolo
        onChange={(event, valuef) => {

          console.log('hsliii this extrafilter', event, valuef, groupfilterdata)
          setgroupfilterdata(valuef)

          setUnsavedChanges(true);
        }}


        renderInput={(params) => (
          <TextField
            {...params}

            label="Name"
            placeholder="NAme"
          />
        )}
      />



      {Array.from(Array(counter)).map((c, i) => {
        return (

          <Box key={i} sx={{
            display: 'flex',
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),

          }}>
            {c}
            <Autocomplete
              multiple
              id="tags-filled"

              sx={{ mt: 20, display: 'flex', width: 700 }}
              options={namesauto.map((option) => option.title)}
              key={i}
              freeSolo
              value={groupfilterdata}
              onChange={(event, value) => {

                console.log('hsliii this extrafilter', event, value)
                setgroupfilterdata(value)

                setUnsavedChanges(true);
              }}

              renderInput={(params) => (
                <TextField
                  {...params}

                  label="freeSolo"
                  placeholder="Favorites"
                />
              )}
            />

            <IconButton color='primary' sx={{ marginLeft: 'auto' }} onClick={removerow}>
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
            marginRight: 'auto',

          }}
        >

          <AddBoxIcon />

        </Button>

        <Button
          variant='outlined'
          color='error'
          sx={{ marginRight: theme.spacing(2) }}
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
            const compartments: Dictionary<Array<string>> = {};
            const newFilter = { id: props.compartmentFilter.id, name: name, filter: groupfilterdata, isVisible: true, compartments: compartments };

            { { newFilter } }
            dispatch(setCompartmentFilter(newFilter));
            props.selectGroupFilterCallback(newFilter);
          }}
        >
          {t('group-filters.apply')}
        </Button>
      </Box>
    </Box>

  );
}

