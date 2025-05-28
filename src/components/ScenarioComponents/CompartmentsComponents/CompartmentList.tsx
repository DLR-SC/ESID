// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import List from '@mui/material/List';
import {ScrollSyncPane} from 'react-scroll-sync';
import React, {Dispatch} from 'react';
import CompartmentRow from './CompartmentRow';

import {Localization} from 'types/localization';
import {useTranslation} from 'react-i18next';

interface CompartmentsRowsProps {
  /** Boolean to determine if the compartments are expanded */
  compartmentsExpanded: boolean;

  /** Array of compartment names */
  compartments: Array<{id: string; name: string}>;

  /** Currently selected compartment */
  selectedCompartment: string;

  /** Function to set the selected compartment */
  setSelectedCompartment: Dispatch<string>;

  /** Minimum number of compartment rows */
  minCompartmentsRows: number;

  /** Maximum number of compartment rows */
  maxCompartmentsRows: number;

  /** Values for each compartment */
  compartmentValues: Record<string, number> | null;

  /** An object containing localization information (translation & number formattation). */
  localization?: Localization;
}

/**
 * This component renders a list of compartments with synchronized scrolling,
 * expand/collapse functionality, and localization support.
 */
export default function CompartmentList({
  compartmentsExpanded,
  compartments,
  selectedCompartment,
  minCompartmentsRows,
  maxCompartmentsRows,
  setSelectedCompartment,
  compartmentValues,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: CompartmentsRowsProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);

  function GetFormattedAndTranslatedValues(filteredValues: number | null): string {
    if ((compartmentValues && filteredValues) || (compartmentValues && !filteredValues))
      return filteredValues
        ? localization.formatNumber
          ? localization.formatNumber(filteredValues)
          : filteredValues.toString()
        : '0';
    return localization.overrides?.['no-data'] ? customT(localization.overrides['no-data']) : defaultT('no-data');
  }
  return (
    <div style={{position: 'relative'}}>
      <ScrollSyncPane>
        <div
          style={{
            overflow: 'auto',
            height: compartmentsExpanded ? (248 / 6) * maxCompartmentsRows : 'auto',
          }}
        >
          <List
            id='compartments-list'
            dense
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
            className='hide-scrollbar'
          >
            {compartments.map(({id, name}, index) => {
              const selected = id === selectedCompartment;
              return (
                <CompartmentRow
                  key={id}
                  index={index}
                  selected={selected}
                  compartment={{id, name}}
                  value={GetFormattedAndTranslatedValues(compartmentValues ? compartmentValues[id] : null)}
                  compartmentsExpanded={compartmentsExpanded}
                  setSelectedCompartment={setSelectedCompartment}
                  minCompartmentsRows={minCompartmentsRows}
                  localization={localization}
                />
              );
            })}
          </List>
        </div>
      </ScrollSyncPane>
    </div>
  );
}
