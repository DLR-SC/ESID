// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {List} from '@mui/material';
import {ScrollSyncPane} from 'react-scroll-sync';
import {Dispatch, SetStateAction} from 'react';
import CompartmentsRow from './CompartmentsRow';
import React from 'react';
import {Localization} from 'types/localization';
import {Dictionary} from 'util/util';
import {useTranslation} from 'react-i18next';

interface CompartmentsRowsProps {
  /** Boolean to determine if the compartments are expanded */
  compartmentsExpanded: boolean;

  /** Array of compartment names */
  compartments: string[];

  /** Currently selected compartment */
  selectedCompartment: string;

  /** Function to set the selected compartment */
  setSelectedCompartment: Dispatch<SetStateAction<string>>;

  /** Minimum number of compartment rows */
  minCompartmentsRows: number;

  /** Maximum number of compartment rows */
  maxCompartmentsRows: number;

  /** Values for each compartment */
  compartmentValues: Dictionary<number> | null;

  /** An object containing localization information (translation & number formattation). */
  localization?: Localization;
}

/**
 * This component renders a list of compartments with synchronized scrolling,
 * expand/collapse functionality, and localization support.
 */
export default function CompartmentsRows({
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
    if (compartmentValues && filteredValues)
      return localization.formatNumber ? localization.formatNumber(filteredValues) : filteredValues.toString();
    const noDataText = localization.overrides?.['no-data']
      ? customT(localization.overrides['no-data'])
      : defaultT('no-data');

    return noDataText;
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
            {compartments.map((comp: string, id: number) => {
              const selected = comp === selectedCompartment;
              return (
                <CompartmentsRow
                  key={id}
                  id={id}
                  selected={selected}
                  compartment={comp}
                  value={GetFormattedAndTranslatedValues(compartmentValues ? compartmentValues[comp] : null)}
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
