// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, darken, useTheme} from '@mui/material';
import {useContext, useEffect, useMemo, useState} from 'react';
import {NumberFormatter} from 'util/hooks';
import {useTranslation} from 'react-i18next';
import {
  selectCompartment,
  selectScenario,
  setActiveScenario,
  setGroupFilters,
  toggleCompartmentExpansion,
} from 'store/DataSelectionSlice';
import {DataContext} from 'DataContext';
import {ScrollSync} from 'react-scroll-sync';
import {useBoundingclientrectRef} from 'rooks';
import {setReferenceDayTop} from 'store/LayoutSlice';
import React from 'react';
import CardContainer from './CardsComponents/CardContainer';
import CompartmentsRows from './CompartmentsComponents/CompartmentsRows';
import FilterDialogContainer from './FilterComponents/FilterDialogContainer';
import GeneralButton from './ExpandedButtonComponents/ExpandedButton';
import ReferenceDatePicker from './ReferenceDatePickerComponents.tsx/ReferenceDatePicker';
import {useAppDispatch, useAppSelector} from 'store/hooks';

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
  const {t} = useTranslation('backend');
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
  const activeScenarios = useAppSelector((state) => state.dataSelection.activeScenarios);
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const storeStartDay = useAppSelector((state) => state.dataSelection.simulationStart);

  const [startDay, setStartDay] = useState<string | null>(storeStartDay ?? '2024-07-08');
  const [resizeRef, resizeBoundingRect] = useBoundingclientrectRef();

  const scenarios = useMemo(
    () =>
      scenarioData?.map((scenario) => ({
        id: scenario.id,
        name: t(`scenario-names.${scenario.name}`),
        color: '#FFF',
      })) ?? [],
    [scenarioData, t]
  );

  const compartmentNames = useMemo(() => {
    return compartments?.map((compartment) => t(`infection-states.${compartment.name}`)) ?? [];
  }, [compartments, t]);

  const compartmentValues = useMemo(() => {
    const result: Record<string, number> = {};
    referenceDateValues?.forEach(
      (referenceDate) => (result[t(`infection-states.${referenceDate.compartment}`)] = referenceDate.values['50'])
    );
    return result;
  }, [referenceDateValues, t]);

  const translatedCategories = useMemo(() => {
    return groupCategories?.map((category) => ({id: category, name: t(`group-filters.${category}`)})) ?? [];
  }, [groupCategories, t]);

  const translatedGroups = useMemo(
    () =>
      groups?.map((group) => ({id: group.id, name: t(`group-filters.${group.name}`), category: group.category})) ?? [],
    [groups, t]
  );

  const cardValues = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    Object.entries(scenarioCardData ?? {}).forEach(([id, infectionData]) => {
      const values: Record<string, number> = {};
      infectionData.forEach((entry) => {
        values[entry.compartment!] = entry.values['50']!;
      });
      result[id] = values;
    });
    return result;
  }, [scenarioCardData]);

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
                startDay={startDay}
                setStartDay={setStartDay}
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
                    if (compartmentNames.indexOf(selectedCompartment ?? '') >= minCompartmentsRows) {
                      dispatch(selectCompartment(compartmentNames[0]));
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
              activeScenarios={activeScenarios ?? []}
              setActiveScenario={(newActiveScenarios) => dispatch(setActiveScenario(newActiveScenarios))}
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
          {groupCategories && groups && (
            <FilterDialogContainer
              groupFilters={groupFilters}
              categories={translatedCategories}
              groups={translatedGroups}
              setGroupFilters={(newGroupFilters) => dispatch(setGroupFilters(newGroupFilters))}
              localization={localization}
            />
          )}
        </Box>
      </div>
    </ScrollSync>
  );
}
