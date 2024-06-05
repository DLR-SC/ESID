// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import DataCard from './DataCard';
import {useTranslation} from 'react-i18next';
import {Scenario, cardValue, filterValue} from '../../types/Cardtypes';
import {Dispatch, SetStateAction} from 'react';
import React from 'react';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box/Box';
import {Dictionary} from 'util/util';
import {GroupFilter} from 'types/Filtertypes';

interface CardContainerProps {
  compartmentsExpanded: boolean;
  cardValues: Dictionary<cardValue> | undefined;
  filterValues?: Dictionary<filterValue[]> | null;
  selectedCompartment: string;
  scenarios: Scenario[];
  compartments: string[];
  activeScenarios: number[] | null;
  setActiveScenarios: React.Dispatch<React.SetStateAction<number[] | null>>;
  selectedScenario: number;
  setSelectedScenario: Dispatch<SetStateAction<number>>;
  minCompartmentsRows: number;
  maxCompartmentsRows: number;
  localization: {
    numberFormatter: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
  groupFilters: Dictionary<GroupFilter> | undefined;
}

export default function CardContainer({
  compartmentsExpanded,
  filterValues,
  selectedCompartment,
  compartments,
  scenarios,
  activeScenarios,
  cardValues,
  minCompartmentsRows,
  maxCompartmentsRows,
  setActiveScenarios,
  localization,
  selectedScenario,
  setSelectedScenario,
  groupFilters,
}: CardContainerProps) {
  const theme = useTheme();
  const {t: defaultT} = useTranslation();
  const customLang = localization.customLang;
  const {t: customT} = useTranslation(customLang || undefined);

  const dataCards = scenarios.map((scenario) => {
    const cardValue = cardValues ? cardValues[scenario.id.toString()] : null;
    if (!cardValue) {
      return null;
    }
    return (
      <DataCard
        key={scenario.id}
        index={scenario.id}
        color={scenario.id == 0 ? '#000000' : theme.custom.scenarios[scenario.id % theme.custom.scenarios.length][0]}
        label={
          localization.overrides && localization.overrides[`scenario-names.${scenario.label}`]
            ? customT(localization.overrides[`scenario-names.${scenario.label}`])
            : defaultT(`scenario-names.${scenario.label}`)
        }
        compartmentsExpanded={compartmentsExpanded}
        compartments={compartments}
        compartmentValues={cardValue.compartmentValues}
        startValues={cardValue.startValues}
        selectedCompartment={selectedCompartment}
        filterValues={filterValues}
        selectedScenario={selectedScenario == scenario.id}
        activeScenarios={activeScenarios}
        setSelectedScenario={setSelectedScenario as Dispatch<SetStateAction<number | null>>}
        numberSelectedScenario={selectedScenario ?? null}
        setActiveScenarios={setActiveScenarios}
        minCompartmentsRows={minCompartmentsRows}
        maxCompartmentsRows={compartments.length < maxCompartmentsRows ? compartments.length : maxCompartmentsRows}
        localization={localization}
        groupFilters={groupFilters}
      />
    );
  });

  return (
    <Box
      id='card-container'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        minHeight: compartmentsExpanded
          ? `${(410 / 6) * maxCompartmentsRows}px`
          : `${(335 / 4) * minCompartmentsRows}px`,
        overflowX: 'auto',
        minWidth: 400,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 2,
      }}
    >
      {dataCards}
    </Box>
  );
}
