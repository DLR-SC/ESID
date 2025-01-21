// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import {darken, useTheme} from '@mui/material/';
import React, {useContext, useEffect, useMemo} from 'react';
import {NumberFormatter} from 'util/hooks';
import {useTranslation} from 'react-i18next';
import {
  selectCompartment,
  selectScenario,
  setGroupFilters,
  setStartDate,
  toggleCompartmentExpansion,
  updateScenario,
} from 'store/DataSelectionSlice';
import {DataContext} from 'DataContext';
import {ScrollSync} from 'react-scroll-sync';
import {useBoundingclientrectRef} from 'rooks';
import {setReferenceDayTop} from 'store/LayoutSlice';

import CardContainer from './CardsComponents/CardContainer';
import CompartmentsRows from './CompartmentsComponents/CompartmentsRows';
import FilterDialogContainer from './FilterComponents/FilterDialogContainer';
import GeneralButton from './ExpandedButtonComponents/ExpandedButton';
import ReferenceDatePicker from './ReferenceDatePickerComponents.tsx/ReferenceDatePicker';
import {useAppDispatch, useAppSelector} from 'store/hooks';
import ScenarioLibrary from './ScenarioLibrary';
import {dateToISOString} from '../../util/util';

interface ScenarioContainerProps {
  /** The minimum number of compartment rows.*/
  minCompartmentsRows?: number;

  /** The maximum number of compartment rows.*/
  maxCompartmentsRows?: number;
}

/**
 * Renders the ScenarioContainer component.
 */
export default function ScenarioContainer({minCompartmentsRows = 4, maxCompartmentsRows = 6}: ScenarioContainerProps) {
  const {t: tBackend, i18n: i18nBackend} = useTranslation('backend');
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {i18n} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  const theme = useTheme();

  const {
    scenarios: scenarioData,
    scenarioCardData,
    compartments,
    referenceDateValues,
    groups,
    groupCategories,
  } = useContext(DataContext);

  const groupFilters = useAppSelector((state) => state.dataSelection.groupFilters);
  const compartmentsExpanded = useAppSelector((state) => state.dataSelection.compartmentsExpanded);
  const selectedCompartment = useAppSelector((state) => state.dataSelection.compartment);
  const scenariosState = useAppSelector((state) => state.dataSelection.scenarios);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);

  const [resizeRef, resizeBoundingRect] = useBoundingclientrectRef();

  const scenarios = useMemo(() => {
    if (!scenarioData) {
      return [];
    }
    return (
      Object.entries(scenariosState)
        .filter(([_, scenario]) => scenario.visibility === 'faceUp' || scenario.visibility === 'faceDown')
        .map(([id, scenario]) => {
          return {
            id: id,
            name: scenario.name,
            color: scenario.colors[0],
            active: scenario.visibility == 'faceUp',
          };
        }) ?? []
    );
  }, [scenarioData, scenariosState]);

  const compartmentNames = useMemo(() => {
    return (
      compartments?.map((compartment) => {
        const name = i18nBackend.exists(`infection-states.${compartment.name}`, {ns: 'backend'})
          ? tBackend(`infection-states.${compartment.name}`)
          : compartment.name;

        return {id: compartment.id, name};
      }) ?? []
    );
  }, [compartments, i18nBackend, tBackend]);

  const compartmentValues = useMemo(() => {
    const result: Record<string, number> = {};
    referenceDateValues?.forEach((referenceDate) => {
      const key = i18nBackend.exists(`infection-states.${referenceDate.compartment}`, {ns: 'backend'})
        ? tBackend(`infection-states.${referenceDate.compartment}`)
        : referenceDate.compartment!;

      result[key] = referenceDate.value;
    });
    return result;
  }, [i18nBackend, referenceDateValues, tBackend]);

  const translatedCategories = useMemo(() => {
    return (
      groupCategories?.map((category) => ({id: category, name: tBackend(`group-filters.categories.${category}`)})) ?? []
    );
  }, [groupCategories, tBackend]);

  const translatedGroups = useMemo(
    () =>
      groups?.map((group) => ({
        id: group.id,
        name: tBackend(`group-filters.groups.${group.name}`),
        category: group.category,
      })) ?? [],
    [groups, tBackend]
  );

  const cardValues = useMemo(() => {
    const result: Record<string, Record<string, number | null>> = {};
    Object.keys(scenariosState).forEach((id) => {
      result[id] = {};
      compartmentNames.forEach((c) => (result[id][c.id] = null));
    });

    Object.entries(scenarioCardData ?? {}).forEach(([id, infectionData]) => {
      infectionData.forEach((entry) => {
        if (entry.compartment) {
          result[id][entry.compartment] = entry.value;
        }
      });
    });
    return result;
  }, [compartmentNames, scenarioCardData, scenariosState]);

  const filterValues = useMemo(() => {
    return {}; // TODO
  }, []);

  const localization = useMemo(() => {
    return {
      formatNumber: formatNumber,
      customLang: 'backend',
    };
  }, [formatNumber]);

  /*
   * This useEffect hook is utilized to enable the connection between the dashed border line of the box
   * which contains the reference day and the compartments and the line in the line chart.
   */
  useEffect(() => {
    const x = resizeBoundingRect?.x ?? 0;
    const w = resizeBoundingRect?.width ?? 0;
    dispatch(setReferenceDayTop(x + w));
  }, [dispatch, resizeBoundingRect]);

  return (
    <ScrollSync>
      <div style={{height: '100%'}} id='scenario-container'>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            height: '100%',
            overflowY: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexGrow: 1,
              borderRight: `1px solid`,
              borderColor: 'divider',
              overflowX: 'hidden',
              height: '100%',
              justifyContent: 'left',
            }}
            className='hide-scrollbar'
          >
            <Box
              ref={resizeRef}
              className='datepicker-paddingTop'
              id='scenario-datepicker-box'
              sx={{
                borderRight: `2px dashed ${darken(theme.palette.divider, 0.25)}`,
                flexDirection: 'column',
                justifyContent: 'center',
                borderTop: '2px solid transparent',
                width: '274px',
                boxSizing: 'border-box',
                gap: 1,
                height: '100%',
              }}
            >
              <ReferenceDatePicker
                startDay={referenceDay}
                setStartDay={(day) => dispatch(setStartDate(day ?? dateToISOString(new Date())))}
                minDate={useAppSelector((state) => state.dataSelection.minDate)}
                maxDate={useAppSelector((state) => state.dataSelection.maxDate)}
                localization={localization}
              />
              <Box
                sx={{
                  height: compartmentsExpanded ? (240 / 6) * maxCompartmentsRows : 'auto',
                  paddingBottom: 2,
                  width: '272px',
                }}
              >
                <CompartmentsRows
                  compartmentsExpanded={compartmentsExpanded ?? false}
                  compartments={compartmentNames}
                  selectedCompartment={selectedCompartment ?? ''}
                  setSelectedCompartment={(newCompartment) => dispatch(selectCompartment(newCompartment))}
                  minCompartmentsRows={minCompartmentsRows}
                  maxCompartmentsRows={maxCompartmentsRows}
                  compartmentValues={compartmentValues}
                  localization={localization}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  padding: 1,
                  paddingRight: 3,
                  paddingLeft: 3,
                }}
              >
                <GeneralButton
                  buttonTexts={{clicked: t('less'), unclicked: t('more')}}
                  isDisabled={compartmentNames.length <= minCompartmentsRows}
                  handleClick={() => {
                    if (compartmentNames.map((c) => c.id).indexOf(selectedCompartment ?? '') >= minCompartmentsRows) {
                      dispatch(selectCompartment(compartmentNames[0].id));
                    }
                    dispatch(toggleCompartmentExpansion());
                  }}
                  isExpanded={compartmentsExpanded ?? false}
                />
              </Box>
            </Box>
            <CardContainer
              compartmentsExpanded={compartmentsExpanded ?? false}
              cardValues={cardValues}
              referenceValues={compartmentValues}
              filterValues={filterValues}
              selectedCompartmentId={selectedCompartment}
              scenarios={scenarios}
              setActiveScenario={(newActiveScenarios) =>
                dispatch(
                  updateScenario({
                    id: newActiveScenarios.id,
                    state: {visibility: newActiveScenarios.state ? 'faceUp' : 'faceDown'},
                  })
                )
              }
              hide={(scenarioId) =>
                dispatch(
                  updateScenario({
                    id: scenarioId,
                    state: {visibility: 'inLibrary'},
                  })
                )
              }
              minCompartmentsRows={minCompartmentsRows}
              maxCompartmentsRows={maxCompartmentsRows}
              localization={localization}
              selectedScenario={selectedScenario}
              setSelectedScenario={(selection) => {
                if (selection.state) {
                  dispatch(selectScenario(selection.id));
                } else if (selectedScenario === selection.id) {
                  dispatch(selectScenario(null));
                }
              }}
              groupFilters={groupFilters}
            />
          </Box>
          <Box
            id='scenario-footer-container'
            sx={{
              minHeight: '20vh',
              paddingLeft: 4,
              paddingRight: 4,
              paddingTop: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ScenarioLibrary />
            <FilterDialogContainer
              groupFilters={groupFilters}
              categories={translatedCategories}
              groups={translatedGroups}
              setGroupFilters={(newGroupFilters) => dispatch(setGroupFilters(newGroupFilters))}
              localization={localization}
            />
          </Box>
        </Box>
      </div>
    </ScrollSync>
  );
}
