// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0
import {Box, List, ListItem, ListItemText} from '@mui/material';
import TrendArrow from './TrendArrow';
import {ScrollSyncPane} from 'react-scroll-sync';
import {Dictionary} from '../../../types/Cardtypes';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {hexToRGB} from 'util/util';

interface CardRowsProps {
  index: number;
  compartments: string[];
  compartmentValues: Dictionary<number> | null;
  startValues: Dictionary<number> | null;
  isFlipped?: boolean;
  arrow?: boolean;
  compartmentExpanded?: boolean;
  selectedCompartment: string;
  color: string;
  minCompartmentsRows: number;
  maxCompartmentsRows: number;
  localization: {
    numberFormatter: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}

export default function CardRows({
  index,
  compartments,
  isFlipped = true,
  arrow = true,
  compartmentValues,
  startValues,
  compartmentExpanded,
  selectedCompartment,
  color,
  minCompartmentsRows,
  maxCompartmentsRows,
  localization,
}: CardRowsProps) {
  const {t: defaultT} = useTranslation();
  const customLang = localization.customLang;
  const {t: customT} = useTranslation(customLang || undefined);

  function GetFormattedAndTranslatedValues(filteredValues: number | null): string {
    if (filteredValues) return localization.numberFormatter(filteredValues);
    else if ((!filteredValues && index === 0) || (compartmentValues && Object.keys(compartmentValues).length !== 0))
      return '0';
    else
      return localization.overrides && localization.overrides['no-data']
        ? customT(localization.overrides['no-data'])
        : defaultT('no-data');
  }
  const getCompartmentRate = (compartment: string): string => {
    if (!compartmentValues || !(compartment in compartmentValues) || !startValues || !(compartment in startValues)) {
      // Return a Figure Dash (‒) where a rate cannot be calculated.
      return '\u2012';
    }

    const value = compartmentValues[compartment];
    const startValue = startValues[compartment];
    const result = Math.round(100 * (value / startValue) - 100);

    if (!isFinite(result)) {
      // Return a Figure Dash (‒) where a rate cannot be calculated.
      return '\u2012';
    }

    let sign: string;
    if (result > 0) {
      sign = '+';
    } else if (result < 0) {
      sign = '-';
    } else {
      // Return a Plus Minus sign (±) where a rate cannot be calculated.
      sign = '\u00B1';
    }

    return sign + Math.abs(result).toFixed() + '%';
  };

  return (
    <Box
      id={`compartment-row-container`}
      className='hide-scrollbar'
      sx={{
        width: 'full',
        bgcolor: 'white',
        pd: 2,
        overflowX: 'auto',
        visibility: isFlipped ? 'visible' : 'hidden',
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
                return (
                  <ListItem
                    key={comp}
                    sx={{
                      display: compartmentExpanded || id < minCompartmentsRows ? 'flex' : 'none',
                      backgroundColor: comp == selectedCompartment ? hexToRGB(color, 0.1) : 'none',
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}
                  >
                    <ListItemText
                      key={id}
                      primary={GetFormattedAndTranslatedValues(compartmentValues ? compartmentValues[comp] : null)}
                      disableTypography={true}
                      sx={{
                        color: comp != selectedCompartment ? 'GrayText' : 'black',
                        typography: 'listElement',
                        fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
                        textAlign: 'right',
                        flexBasis: '55%',
                        whiteSpace: 'nowrap',
                      }}
                    />
                    <ListItemText
                      primary={getCompartmentRate(comp)}
                      disableTypography={true}
                      sx={{
                        color: comp != selectedCompartment ? 'GrayText' : 'black',
                        typography: 'listElement',
                        fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
                        fontWeight: 'bold',
                        textAlign: 'right',
                        flexBasis: '45%',
                        whiteSpace: 'nowrap',
                      }}
                    />
                    {arrow && (
                      <TrendArrow
                        value={parseFloat(
                          GetFormattedAndTranslatedValues(compartmentValues ? compartmentValues[comp] : null)
                        )}
                        rate={getCompartmentRate(comp)}
                      />
                    )}
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
