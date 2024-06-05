// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {Box} from '@mui/material';
import CardTitle from './CardTitle';
import CardTooltip from './CardTooltip';
import CardRows from './CardRows';
import {hexToRGB} from 'util/util';
import {Dictionary} from 'types/Cardtypes';

interface MainCardProps {
  index: number;
  label: string;
  hover: boolean;
  compartmentValues: Dictionary<number> | null;
  startValues: Dictionary<number> | null;
  setHover: React.Dispatch<React.SetStateAction<boolean>>;
  compartments: string[];
  compartmentsExpanded: boolean;
  selectedCompartment: string;
  color: string;
  selectedScenario: boolean;
  activeScenario: boolean;
  setSelectedScenario: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveScenarios: React.Dispatch<React.SetStateAction<number[] | null>>;
  numberSelectedScenario: number | null;
  activeScenarios: number[] | null;
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

function MainCard({
  index,
  label,
  hover,
  compartmentValues,
  startValues,
  setHover,
  compartments,
  compartmentsExpanded,
  selectedCompartment,
  color,
  selectedScenario,
  activeScenario,
  numberSelectedScenario,
  minCompartmentsRows,
  setSelectedScenario,
  setActiveScenarios,
  activeScenarios,
  maxCompartmentsRows,
  localization,
}: MainCardProps) {
  return (
    <Box
      id={`main-card-external-container-${index}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor:
          ((hover || selectedScenario) && activeScenarios?.includes(index)) || hover ? hexToRGB(color, 0.4) : null,
        zIndex: 3,
        boxShadow:
          ((hover || selectedScenario) && activeScenarios?.includes(index)) || hover
            ? `0 0 0 6px ${hexToRGB(color, 0.4)}`
            : null,
        borderRadius: ((hover || selectedScenario) && activeScenarios?.includes(index)) || hover ? 1 : null,
        borderColor: color,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (activeScenario) {
          setSelectedScenario(index);
        }
      }}
    >
      <Box
        id={`main-card-title&compartments-container-${index}`}
        className='hide-scrollbar'
        sx={{
          maxHeight: `${(335 / 6) * maxCompartmentsRows}px`,
          overflow: 'auto',
          paddingBottom: '9px',
          boxSizing: 'border-box',
          minWidth: '200px',
          maxWidth: '210px',
          bgcolor: 'white',
          zIndex: 0,
          display: 'flex',
          flexDirection: 'column',
          border: 2,
          borderRadius: 1,
          borderColor: color,
          transition: 'transform 0.5s',
          transformStyle: 'preserve-3d',
          transform: activeScenario ? 'none' : 'rotateY(180deg)',
        }}
      >
        <Box
          id={`main-card-title-container-${index}`}
          sx={{
            display: 'flex',
            height: '75px',
            alignItems: 'self-end',
            width: 'full',
          }}
        >
          <CardTitle label={label} isFlipped={activeScenarios?.includes(index)} color={color} />
        </Box>
        <CardRows
          index={index}
          compartments={compartments}
          compartmentValues={compartmentValues}
          startValues={startValues}
          isFlipped={activeScenario}
          compartmentExpanded={compartmentsExpanded}
          selectedCompartment={selectedCompartment}
          color={color}
          minCompartmentsRows={minCompartmentsRows}
          maxCompartmentsRows={maxCompartmentsRows}
          localization={localization}
        />
      </Box>
      <CardTooltip
        hover={hover}
        color={color}
        index={index}
        activeScenario={activeScenarios?.includes(index) || false}
        activeScenarios={activeScenarios}
        numberSelectedScenario={numberSelectedScenario}
        setActiveScenarios={setActiveScenarios}
        setSelectedScenario={setSelectedScenario}
        localization={localization}
      />
    </Box>
  );
}

export default MainCard;
