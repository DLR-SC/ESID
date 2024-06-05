import {Box} from '@mui/material';
import Divider from '@mui/material/Divider';
import FilterRows from './FilterRows';
import CardTitle from '../MainCard/CardTitle';
import {Dictionary} from '../../../types/Cardtypes';
import React from 'react';

interface FilterCardProps {
  title: string;
  color: string;
  compartments: string[];
  filteredValues: Dictionary<number> | null;
  groupFilterIndex: number;
  totalCardNumber: number;
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

export default function FilterCard({
  title,
  color,
  compartments,
  filteredValues,
  groupFilterIndex,
  totalCardNumber,
  compartmentExpanded,
  selectedCompartment,
  maxCompartmentsRows,
  minCompartmentsRows,
  localization,
}: FilterCardProps) {
  return (
    <Box
      id={`external-cardfilter-container-${groupFilterIndex}`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Box
        id={`cardfilter-title&cardContent-container-${groupFilterIndex}`}
        className='hide-scrollbar'
        sx={{
          maxHeight: `${(335 / 6) * maxCompartmentsRows}px`,
          minWidth: '130px',
          bgcolor: 'white',
          zIndex: 0,
          display: 'flex',
          flexDirection: 'column',
          borderColor: groupFilterIndex == 0 ? null : 'divider',
          borderRadius: groupFilterIndex == totalCardNumber - 1 ? '0 0.2em 0.2em 0' : '0',
        }}
      >
        <Box
          id={`cardfilter-title-container-${groupFilterIndex}`}
          sx={{
            display: 'flex',
            height: '67px',
            alignItems: 'self-end',
            width: 'full',
            paddingRight: 2,
            paddingLeft: 1,
          }}
        >
          <CardTitle label={title} color={color} />
        </Box>
        <FilterRows
          compartments={compartments}
          filteredValues={filteredValues}
          arrow={false}
          compartmentExpanded={compartmentExpanded}
          selectedCompartment={selectedCompartment}
          maxCompartmentsRows={maxCompartmentsRows}
          minCompartmentsRows={minCompartmentsRows}
          localization={localization}
        />
      </Box>
      {groupFilterIndex != totalCardNumber - 1 ? <Divider orientation='vertical' flexItem /> : null}
    </Box>
  );
}
