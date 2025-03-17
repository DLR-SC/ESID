// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';
import CardTitle from './CardsComponents/MainCard/CardTitle';
import WebAssetOff from '@mui/icons-material/WebAssetOff';
import {DataContext} from '../../DataContext';
import LibraryAddOutlined from '@mui/icons-material/LibraryAddOutlined';
import Dialog from '@mui/material/Dialog';
import NewScenarioDialog, {NewScenarioData} from './NewScenarioDialog';
import {InterventionTemplates, Models, NodeLists, Scenario} from '../../store/services/APITypes';
import {useGetMultiScenariosQuery} from '../../store/services/scenarioApi';
import {updateScenario} from '../../store/DataSelectionSlice';

export default function ScenarioLibrary(): JSX.Element {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const theme = useTheme();

  const {scenarios, simulationModels, npis, nodeLists} = useContext(DataContext);
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);

  const {data: completeScenarios} = useGetMultiScenariosQuery(scenarios?.map((s) => s.id) ?? [], {skip: !scenarios});

  const scenarioCreated = useCallback(
    (data: NewScenarioData) => {
      const result = Object.values(completeScenarios ?? {}).find((scenario: Scenario) => {
        if (scenario.name === 'casedata') {
          return false;
        }
        if (scenario.linkedInterventions.length === data.npis.length) {
          return data.npis.every((id) =>
            scenario.linkedInterventions.find((intervention) => intervention.interventionId === id)
          );
        }
        return false;
      });

      if (result) {
        dispatch(
          updateScenario({
            id: result.id,
            state: {
              name: data.name,
              description: data.description,
              visibility: 'faceUp',
            },
          })
        );
      }
    },
    [completeScenarios]
  );

  const hiddenScenarios = useMemo(() => {
    return Object.entries(scenariosState)
      .filter(([_, value]) => value.visibility === 'inLibrary')
      .map(([key, scenario]) => ({
        id: key,
        name: scenario.name,
      }));
  }, [scenariosState]);

  const anchorRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const id = open ? 'simple-popper' : undefined;
  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <Box>
      <Button
        ref={anchorRef}
        aria-describedby={id}
        type='button'
        onClick={handleToggle}
        id='scenario-add-button'
        variant='outlined'
        color='success'
        sx={{
          height: '244px',
          width: '200px',
          margin: theme.spacing(3),
          marginTop: theme.spacing(2),
          fontWeight: 'bolder',
          fontSize: '3rem',
          border: `2px ${theme.palette.primary.light} dashed`,
          borderRadius: '3px',
          color: theme.palette.primary.light,
          alignSelf: 'top',

          '&:hover': {
            border: `2px ${theme.palette.primary.light} dashed`,
            background: '#E7E7E7',
          },
        }}
        aria-label={t('scenario-library.add')}
      >
        +
      </Button>
      <Popper id={id} open={open} anchorEl={anchorRef.current} placement='bottom-start' sx={{zIndex: 100}}>
        <Paper>
          <ClickAwayListener onClickAway={handleClose}>
            <Box
              sx={{
                width: '930px',
                margin: theme.spacing(2),
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
                <Typography variant='h1'>{t('scenario-library.title')}</Typography>
                <IconButton color='primary' sx={{marginLeft: 'auto'}} onClick={() => setOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
              <Divider orientation='horizontal' variant='middle' flexItem />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, 204px)',
                  gridGap: '1rem',
                  justifyContent: 'space-between',
                  width: '100%',
                  marginTop: theme.spacing(2),
                  maxHeight: '500px',
                  overflowY: 'auto',
                }}
              >
                <NewScenarioCard
                  models={simulationModels ?? []}
                  npis={npis ?? []}
                  nodeLists={nodeLists ?? []}
                  scenarioCreated={scenarioCreated}
                />
                {hiddenScenarios.length > 0 ? (
                  hiddenScenarios.map((scenario) => <LibraryCard key={scenario.id} {...scenario} />)
                ) : (
                  <Box
                    sx={{
                      margin: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <WebAssetOff color='primary' fontSize='large' />
                    <Typography variant='body1'>{t('scenario-library.no-scenarios')}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </Box>
  );
}

function LibraryCard(props: Readonly<{id: string; name: string}>): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const {t: tBackend, i18n} = useTranslation('backend');

  return (
    <Box
      id={`card-root-${props.id}`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        color: theme.palette.divider,
        width: 'min-content',
      }}
    >
      <Box
        id='card-container'
        sx={{
          position: 'relative',
          zIndex: 0,
          flexGrow: 0,
          flexShrink: 0,
          width: '200px',
          boxSizing: 'border-box',
          marginX: '2px',
          marginY: theme.spacing(2),
          marginBottom: 0,
        }}
      >
        <Box
          id={`card-main-card-${props.id}`}
          sx={{
            position: 'relative',
            zIndex: 0,
            boxSizing: 'border-box',
            height: '244px',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
            border: `2px solid ${theme.palette.secondary.light}`,
            borderRadius: '3px',
            background: theme.palette.background.paper,
            color: theme.palette.secondary.main,
            cursor: 'pointer',

            '&:hover': {
              background: '#EEEEEEEE',
            },
          }}
          onClick={() => dispatch(updateScenario({id: props.id, state: {visibility: 'faceUp'}}))}
        >
          <Box
            id={`card-front-${props.id}`}
            sx={{
              marginTop: '6px',
              marginBottom: '6px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardTitle
              color={theme.palette.secondary.light}
              label={
                i18n.exists(`scenario-names.${props.name}`, {ns: 'backend'})
                  ? tBackend(`scenario-names.${props.name}`)
                  : props.name
              }
            />
            <Box
              sx={{
                fontWeight: 'bolder',
                fontSize: '4rem',
                color: theme.palette.secondary.light,
                textAlign: 'center',
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              aria-label={'+'}
            >
              +
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function NewScenarioCard({
  models,
  npis,
  nodeLists,
  scenarioCreated,
}: {
  models: Models;
  npis: InterventionTemplates;
  nodeLists: NodeLists;
  scenarioCreated: (data: NewScenarioData) => void;
}): JSX.Element {
  const theme = useTheme();
  const {t} = useTranslation();
  const [newScenarioDialogOpen, setNewScenarioDialogOpen] = useState(false);

  return (
    <Box
      id={`new-scenario-card-root`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        color: theme.palette.divider,
        width: 'min-content',
      }}
    >
      <Box
        id='new-scenario-card-container'
        sx={{
          position: 'relative',
          zIndex: 0,
          flexGrow: 0,
          flexShrink: 0,
          width: '200px',
          boxSizing: 'border-box',
          marginX: '2px',
          marginY: theme.spacing(2),
          marginBottom: 0,
        }}
      >
        <Box
          id={`new-scenario-card-main-card`}
          sx={{
            position: 'relative',
            zIndex: 0,
            boxSizing: 'border-box',
            height: '244px',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '3px',
            background: theme.palette.background.paper,
            color: theme.palette.primary.main,
            cursor: 'pointer',

            '&:hover': {
              background: '#EEEEEEEE',
            },
          }}
          onClick={() => setNewScenarioDialogOpen(true)}
        >
          <Box
            id={`new-scenario-card-front`}
            sx={{
              marginTop: '6px',
              marginBottom: '6px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardTitle label={t('scenario-library.new-scenario')} />
            <Box
              sx={{
                fontWeight: 'bolder',
                fontSize: '3rem',
                color: theme.palette.primary.main,
                textAlign: 'center',
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              aria-label={t('new-scenario')}
            >
              <LibraryAddOutlined color='primary' fontSize='large' />
            </Box>
          </Box>
        </Box>
      </Box>
      <Dialog open={newScenarioDialogOpen} maxWidth='sm' fullWidth={true}>
        <NewScenarioDialog
          models={[models[0]?.name ?? 'SECIRVV']}
          npiOptions={npis.map((npi) => {
            return {
              id: npi.id,
              name: npi.name,
            };
          })}
          nodeOptions={[nodeLists[0]?.name ?? 'Districts of Germany']}
          onSubmit={(data) => {
            if (data) {
              scenarioCreated(data);
            }
            setNewScenarioDialogOpen(false);
          }}
        />
      </Dialog>
    </Box>
  );
}
