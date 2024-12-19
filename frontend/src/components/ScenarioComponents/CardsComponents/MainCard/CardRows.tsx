// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, List, ListItem, ListItemText, useTheme} from '@mui/material';
import TrendArrow from './TrendArrow';
import {ScrollSyncPane} from 'react-scroll-sync';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {Localization} from 'types/localization';
import {hexToRGB} from 'util/util';

interface CardRowsProps {
  /** Dictionary of compartment values */
  compartmentValues: Record<string, number | null> | null;

  /** Dictionary of start values */
  referenceValues: Record<string, number> | null;

  /** Boolean to determine if the card is flipped */
  isFlipped?: boolean;

  /** Boolean to determine if the arrow is displayed */
  arrow?: boolean;

  /** Boolean to determine if the compartment is expanded */
  compartmentExpanded?: boolean;

  /** Selected compartment */
  selectedCompartmentId: string | null;

  /** Color of the card row */
  color: string;

  /** Minimum number of compartment rows */
  minCompartmentsRows: number;

  /** Maximum number of compartment rows */
  maxCompartmentsRows: number;

  /** Localization object for custom language and overrides */
  localization?: Localization;
}

/**
 * This component renders the rows which containing the compartment values, and change rates relative to the simulation start.
 * It also supports localization.
 */
export default function CardRows({
  isFlipped = true,
  arrow = true,
  compartmentValues,
  referenceValues,
  compartmentExpanded,
  selectedCompartmentId,
  color,
  minCompartmentsRows,
  maxCompartmentsRows,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
}: CardRowsProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  const theme = useTheme();
  // Function to get formatted and translated values
  function GetFormattedAndTranslatedValues(filteredValues: number | null): string {
    if (filteredValues) {
      return localization.formatNumber ? localization.formatNumber(filteredValues) : filteredValues.toString();
    }

    const noDataText = localization.overrides?.['no-data']
      ? customT(localization.overrides['no-data'])
      : defaultT('no-data');

    return noDataText;
  }

  // Function to get compartment rate
  const getCompartmentRate = (compartment: string): string => {
    if (
      !compartmentValues ||
      !(compartment in compartmentValues) ||
      !referenceValues ||
      !(compartment in referenceValues)
    ) {
      // Return a Figure Dash (‒) where a rate cannot be calculated.
      return '\u2012';
    }

    const value = compartmentValues[compartment];
    if (value === null) {
      // Return a Figure Dash (‒) where a rate cannot be calculated.
      return '\u2012';
    }

    const startValue = referenceValues[compartment];
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
        bgcolor: theme.palette.background.paper,
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
              {Object.entries(compartmentValues || {}).map(([id, value], index) => {
                return (
                  <ListItem
                    key={id}
                    sx={{
                      display: compartmentExpanded || index < minCompartmentsRows ? 'flex' : 'none',
                      backgroundColor: id === selectedCompartmentId ? hexToRGB(color, 0.1) : 'none',
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}
                  >
                    <ListItemText
                      key={id}
                      primary={GetFormattedAndTranslatedValues(value)}
                      disableTypography={true}
                      sx={{
                        color: id !== selectedCompartmentId ? 'GrayText' : 'black',
                        typography: 'listElement',
                        fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
                        textAlign: 'right',
                        flexBasis: '55%',
                        whiteSpace: 'nowrap',
                      }}
                    />
                    <ListItemText
                      primary={getCompartmentRate(id)}
                      disableTypography={true}
                      sx={{
                        color: id !== selectedCompartmentId ? 'GrayText' : 'black',
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
                        value={parseFloat(GetFormattedAndTranslatedValues(value))}
                        rate={getCompartmentRate(id)}
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
