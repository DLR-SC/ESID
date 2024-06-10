// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, List, ListItem, ListItemText} from '@mui/material';
import {ScrollSyncPane} from 'react-scroll-sync';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {Dictionary} from 'types/Cardtypes';
import {Localization} from 'types/localization';

interface FilterRowsProps {
  /* Array of compartments */
  compartments: string[];

  /* Dictionary of filtered values */
  filteredValues: Dictionary<number> | null;

  /* Boolean to determine if the rows are flipped */
  isFlipped?: boolean;

  /* Boolean to determine if the compartment is expanded */
  compartmentExpanded?: boolean;

  /* Selected compartment */
  selectedCompartment: string;

  /* Minimum number of compartment rows */
  minCompartmentsRows: number;

  /* Maximum number of compartment rows */
  maxCompartmentsRows: number;

  /*An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This component renders rows of filter values.
 * It also supports localization.
 */
export default function FilterRows({
  compartments,
  filteredValues,
  isFlipped = true,
  compartmentExpanded = true,
  selectedCompartment,
  minCompartmentsRows,
  maxCompartmentsRows,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: FilterRowsProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);

  // Function to get formatted and translated values
  function GetFormattedAndTranslatedValues(filteredValues: number | null): string {
    if (filteredValues)
      return localization.formatNumber ? localization.formatNumber(filteredValues) : filteredValues.toString();
    else
      return localization.overrides && localization.overrides['no-data']
        ? customT(localization.overrides['no-data'])
        : defaultT('no-data');
  }
  return (
    <Box
      id={`compartment-row-container`}
      className='hide-scrollbar'
      sx={{
        width: '130px',
        bgcolor: 'white',
        overflow: 'auto',
        pd: 2,
        visibility: isFlipped ? 'visible' : 'hidden',
        borderRadius: 1,
      }}
    >
      <div style={{position: 'relative'}}>
        <ScrollSyncPane>
          <div
            style={{
              overflow: 'auto',
              height: compartmentExpanded ? (248 / 6) * maxCompartmentsRows : 'auto',
            }}
            className='hide-scrollbar'
          >
            <List dense className='hide-scrollbar' sx={{paddingTop: 2, paddingBottom: 2}}>
              {compartments.map((comp: string, id: number) => {
                const compartmentId = `compartment-${id}`;
                return (
                  <ListItem
                    key={comp}
                    sx={{
                      display: compartmentExpanded || id < minCompartmentsRows ? 'flex' : 'none',
                      alignContent: 'end',
                      justifyContent: 'flex-end',
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}
                  >
                    <ListItemText
                      id={compartmentId}
                      primary={GetFormattedAndTranslatedValues(filteredValues ? filteredValues[comp] : null)}
                      disableTypography={true}
                      sx={{
                        color: comp != selectedCompartment ? 'GrayText' : 'black',
                        typography: 'listElement',
                        fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
                        textAlign: 'right',
                        flexBasis: '55%',
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </div>
        </ScrollSyncPane>
      </div>
    </Box>
  );
}
