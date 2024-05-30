import {useCallback, useContext, useEffect, useState} from 'react';
import LineChart from './LineChartComponents/LineChart';
import {SelectedScenarioPercentileData} from 'store/services/scenarioApi';
import LoadingContainer from './shared/LoadingContainer';
import {useTheme} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {DataContext} from '../DataContext';
import React from 'react';
import {useAppDispatch} from 'store/hooks';
import {Dictionary} from 'util/util';
import {Scenario} from 'store/ScenarioSlice';
import {SimulationDataByNode} from 'types/scenario';
import {CaseDataByNode} from 'types/caseData';
import {GroupResponse} from 'types/group';
import {setSelectedDateStore} from 'store/LineChartSlice';
import {setReferenceDayBottom} from 'store/LayoutSlice';

export default function LineChartContainer() {
  const theme = useTheme();
  const {t: tBackend} = useTranslation('backend');

  const [groupFilterList, setGroupFilterList] = useState({
    '3ce4e1be-1a8c-42a4-841d-8e93e2ab0d87': {
      id: '3ce4e1be-1a8c-42a4-841d-8e93e2ab0d87',
      name: 'aaaaa',
      isVisible: true,
      groups: {
        age: ['age_0', 'age_1', 'age_2'],
        gender: ['male', 'nonbinary', 'female'],
      },
    },
    'f9b26583-78df-440f-b35d-bf22b5c3a439': {
      id: 'f9b26583-78df-440f-b35d-bf22b5c3a439',
      name: 'lllllllllllllll',
      isVisible: true,
      groups: {
        age: ['age_0', 'age_1', 'age_3', 'age_2', 'age_4'],
        gender: ['female', 'male', 'nonbinary'],
      },
    },
  });

  const [scenarioList, setScenarioList] = useState({
    scenarios: {
      '1': {
        id: 1,
        label: 'Summer 2021 Simulation 1',
      },
      '2': {
        id: 2,
        label: 'Summer 2021 Simulation 2',
      },
    },
    compartments: [
      'Infected',
      'Hospitalized',
      'ICU',
      'Dead',
      'Exposed',
      'Recovered',
      'Carrier',
      'Susceptible',
      'CarrierT',
      'CarrierTV1',
      'CarrierTV2',
      'CarrierV1',
      'CarrierV2',
      'ExposedV1',
      'ExposedV2',
      'HospitalizedV1',
      'HospitalizedV2',
      'ICUV1',
      'ICUV2',
      'InfectedT',
      'InfectedTV1',
      'InfectedTV2',
      'InfectedV1',
      'InfectedV2',
      'SusceptibleV1',
    ],
  });

  const [activeScenarios, setActiveScenarios] = useState([0, 1, 2]);

  const [selectedDate, setSelectedDate] = useState<string>('2021-09-01');
  const [referenceDayb, setReferenceDayb] = useState<number>(0);

  const simulationDataChartName = useCallback(
    (scenario: Scenario) => tBackend(`scenario-names.${scenario.label}`),
    [tBackend]
  );

  const {caseData, simulationData, percentileData, groupFilterData, isChartDataFetching} = useContext(DataContext);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setSelectedDateStore(selectedDate));
  }, [selectedDate, dispatch]);

  useEffect(() => {
    dispatch(setReferenceDayBottom(referenceDayb));
  }, [referenceDayb, dispatch]);

  return (
    <LoadingContainer
      sx={{width: '100%', height: '100%'}}
      show={isChartDataFetching as boolean}
      overlayColor={theme.palette.background.paper}
    >
      <LineChart
        chartId={'lineChart1'}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setReferenceDayBottom={setReferenceDayb}
        simulationDataChartName={simulationDataChartName}
        simulationData={simulationData as SimulationDataByNode[]}
        caseData={caseData as CaseDataByNode}
        percentileData={percentileData as SelectedScenarioPercentileData[]}
        groupFilterData={groupFilterData as Dictionary<GroupResponse>}
        minDate={'2021-04-01'}
        maxDate={'2021-10-27'}
        selectedScenario={1}
        activeScenarios={activeScenarios}
        referenceDay={'2021-07-01'}
        selectedCompartment={'Infected'}
        groupFilterList={groupFilterList}
        scenarioList={scenarioList}
        localization={{}}
      />
    </LoadingContainer>
  );
}
