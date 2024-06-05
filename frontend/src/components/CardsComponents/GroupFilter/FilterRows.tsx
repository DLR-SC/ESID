import {Box, List, ListItem, ListItemText} from '@mui/material';
import {ScrollSyncPane} from 'react-scroll-sync';
import {useTranslation} from 'react-i18next';
import {Dictionary} from '../../../types/Cardtypes';
import React from 'react';

interface FilterRowsProps {
  compartments: string[];
  filteredValues: Dictionary<number> | null;
  isFlipped?: boolean;
  arrow?: boolean;
  compartmentExpanded?: boolean;
  selectedCompartment: string;
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

export default function FilterRows({
  compartments,
  filteredValues,
  isFlipped = true,
  compartmentExpanded = true,
  selectedCompartment,
  minCompartmentsRows,
  maxCompartmentsRows,
  localization,
}: FilterRowsProps) {
  const {t: defaultT} = useTranslation();
  const customLang = localization.customLang;
  const {t: customT} = useTranslation(customLang || undefined);

  function GetFormattedAndTranslatedValues(filteredValues: number | null): string {
    if (filteredValues) return localization.numberFormatter(filteredValues);
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
