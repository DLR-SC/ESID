import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import {
  selectScenario,
  setMinMaxDates,
  toggleScenario,
} from 'store/DataSelectionSlice';
import {ScenarioCard} from './ScenarioCard';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import {ScrollSync} from 'react-scroll-sync';
import {
  useGetSimulationModelQuery,
  useGetSimulationModelsQuery,
  useGetSimulationsQuery,
} from '../../store/services/scenarioApi';
import {setCompartments, setScenarios} from 'store/ScenarioSlice';
import {dateToISOString, Dictionary} from 'util/util';
import ManageGroupDialog from '../ManageGroupDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import {CaseDataCard} from './CaseDataCard';
import CompartmentList from './CompartmentList';

/**
 * React Component to render the Scenario Cards Section
 * @returns {JSX.Element} JSX Element to render the scenario card container and the scenario cards within.
 * @see ScenarioCard
 */
export default function Scenario(): JSX.Element {
  // State for the groups management dialog
  const [open, setOpen] = React.useState(false);

  const {t} = useTranslation();
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const [simulationModelKey, setSimulationModelKey] = useState<string>('unset');
  const [compartmentValues] = useState<Dictionary<number> | null>(null);

  const scenarioList = useAppSelector((state) => state.scenarioList);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);

  const [groupEditorUnsavedChanges, setGroupEditorUnsavedChanges] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const {data: scenarioListData} = useGetSimulationsQuery();
  const {data: simulationModelsData} = useGetSimulationModelsQuery();
  const {data: simulationModelData} = useGetSimulationModelQuery(simulationModelKey, {
    skip: simulationModelKey === 'unset',
  });

  useEffect(() => {
    if (simulationModelsData && simulationModelsData.results.length > 0) {
      const {key} = simulationModelsData.results[0];
      setSimulationModelKey(key);
    }
  }, [simulationModelsData]);

  useEffect(() => {
    if (simulationModelData) {
      const {compartments} = simulationModelData.results;
      dispatch(setCompartments(compartments));
    }
  }, [simulationModelData, dispatch]);

  useEffect(() => {
    if (scenarioListData) {
      const scenarios = scenarioListData.results.map((scenario) => ({id: scenario.id, label: scenario.description}));
      dispatch(setScenarios(scenarios));

      //activate all scenarios initially
      if (!activeScenarios) {
        scenarios.forEach((scenario) => {
          dispatch(toggleScenario(scenario.id));
        });
      }

      if (scenarios.length > 0) {
        // It seems, that the simulation data is only available from the second day forward.
        const startDay = new Date(scenarioListData.results[0].startDay);
        startDay.setUTCDate(startDay.getUTCDate() + 1);

        const endDay = new Date(startDay);
        endDay.setDate(endDay.getDate() + scenarioListData.results[0].numberOfDays - 1);

        dispatch(setMinMaxDates({minDate: dateToISOString(startDay), maxDate: dateToISOString(endDay)}));
      }
    }
  }, [activeScenarios, scenarioListData, dispatch]);

  //effect to switch active scenario
  useEffect(() => {
    if (activeScenarios) {
      if (activeScenarios.length == 0) {
        dispatch(selectScenario(null));
      } else if (selectedScenario === null || !activeScenarios.includes(selectedScenario)) {
        dispatch(selectScenario(activeScenarios[0]));
      }
    }
  }, [activeScenarios, selectedScenario, dispatch]);

  return (
    <ScrollSync enabled={compartmentsExpanded ?? false}>
      <Box
        id='scenario-view-root'
        sx={{
          display: 'flex',
          cursor: 'default',
          background: theme.palette.background.default,
          maxWidth: '100%',
        }}
      >
        <CompartmentList />
        <Box
          id='scenario-view-scenario-card-list'
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: '100%',
            display: 'flex',
            overflowX: 'auto',
            marginLeft: theme.spacing(3),
            minWidth: '400px',
          }}
        >
          <CaseDataCard
            selected={selectedScenario === 0}
            active={!!activeScenarios && activeScenarios.includes(0)}
            startValues={compartmentValues}
            onClick={() => dispatch(selectScenario(0))}
            onToggle={() => dispatch(toggleScenario(0))}
          />
          {Object.entries(scenarioList.scenarios).map(([, scenario], i) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              selected={selectedScenario === scenario.id}
              active={!!activeScenarios && activeScenarios.includes(scenario.id)}
              color={theme.custom.scenarios[i][0]}
              startValues={compartmentValues}
              onClick={() => {
                // set active scenario to this one and send dispatches
                dispatch(selectScenario(scenario.id));
              }}
              onToggle={() => {
                dispatch(toggleScenario(scenario.id));
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            borderLeft: `1px solid`,
            borderColor: 'divider',
            minHeight: '20vh',
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Button
            variant='outlined'
            color='success'
            sx={{
              height: '244px',
              width: '200px',
              margin: theme.spacing(3),
              marginTop: theme.spacing(2),
              fontWeight: 'bolder',
              fontSize: '3rem',
              border: `2px ${theme.palette.divider} dashed`,
              borderRadius: '3px',
              color: theme.palette.divider,
              alignSelf: 'top',

              '&:hover': {
                border: `2px ${theme.palette.divider} dashed`,
                background: '#E7E7E7',
              },
            }}
            aria-label={t('scenario.add')}
          >
            +
          </Button>

          <Button
            disabled // disable filters for pilot study as there is no filterable data yet
            variant='outlined'
            color='primary'
            sx={{
              width: '200px',
              margin: theme.spacing(2),
              alignSelf: 'center',
            }}
            onClick={() => {
              setOpen(true);
            }}
            aria-label={t('group-filters.title')}
          >
            {t('scenario.manage-groups')}
          </Button>
        </Box>
        <Dialog
          maxWidth='lg'
          fullWidth={true}
          open={open}
          onClose={() => {
            if (groupEditorUnsavedChanges) {
              setCloseDialogOpen(true);
            } else {
              setOpen(false);
            }
          }}
        >
          <ManageGroupDialog
            onCloseRequest={() => {
              if (groupEditorUnsavedChanges) {
                setCloseDialogOpen(true);
              } else {
                setOpen(false);
              }
            }}
            unsavedChangesCallback={(unsavedChanges) => setGroupEditorUnsavedChanges(unsavedChanges)}
          />
          <ConfirmDialog
            open={closeDialogOpen}
            title={t('group-filters.confirm-discard-title')}
            text={t('group-filters.confirm-discard-text')}
            abortButtonText={t('group-filters.close')}
            confirmButtonText={t('group-filters.discard')}
            onAnswer={(answer) => {
              if (answer) {
                setOpen(false);
              }
              setCloseDialogOpen(false);
            }}
          />
        </Dialog>
      </Box>
    </ScrollSync>
  );
}
