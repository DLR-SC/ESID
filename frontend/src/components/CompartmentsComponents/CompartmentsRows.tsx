// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {List} from '@mui/material';
import {ScrollSyncPane} from 'react-scroll-sync';
import {Dispatch, SetStateAction} from 'react';
import {Dictionary} from '../../types/Cardtypes';
import CompartmentsRow from './CompartmentsRow';
import React from 'react';

interface CompartmentsRowsProps {
  compartmentsExpanded: boolean;
  compartments: string[];
  selectedCompartment: string;
  setSelectedCompartment: Dispatch<SetStateAction<string>>;
  minCompartmentsRows: number;
  maxCompartmentsRows: number;
  compartmentValues: Dictionary<number> | null;
  localization: {
    numberFormatter: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}

export default function CompartmentsRows({
  compartmentsExpanded,
  compartments,
  selectedCompartment,
  minCompartmentsRows,
  maxCompartmentsRows,
  setSelectedCompartment,
  compartmentValues,
  localization,
}: CompartmentsRowsProps) {
  function GetFormattedAndTranslatedValues(filteredValues: number | null): string {
    if (filteredValues) return localization.numberFormatter(filteredValues);
    else return '0';
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
