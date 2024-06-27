// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {Box, useTheme} from '@mui/material';
import CardTitle from './CardTitle';
import CardTooltip from './CardTooltip';
import CardRows from './CardRows';
import {Localization} from 'types/localization';
import {Dictionary, hexToRGB} from 'util/util';

interface MainCardProps {
  /** A unique identifier for the card. */
  index: number;

  /** The title of the card. */
  label: string;

  /** The color of the card. */
  color: string;

  /** A dictionary of compartment values associated with the card. */
  compartmentValues: Dictionary<number> | null;

  /** A dictionary of start values used for calculating the rate. This determines whether the values have increased, decreased, or remained the same. */
  startValues: Dictionary<number> | null;

  /** An array of compartment names. */
  compartments: string[];

  /** A boolean indicating whether the compartments are expanded. */
  compartmentsExpanded: boolean;

  /** The compartment that is currently selected. */
  selectedCompartment: string;

  /** A boolean indicating whether the user is hovering over the card. */
  hover: boolean;

  /** A function to set the hover state of the card. */
  setHover: React.Dispatch<React.SetStateAction<boolean>>;

  /** A boolean indicating whether the scenario is selected. */
  selectedScenario: boolean;

  /** A function to set the selected scenario. */
  setSelectedScenario: React.Dispatch<React.SetStateAction<number | null>>;

  /** The number of the selected scenario. */
  numberSelectedScenario: number | null;

  /** A boolean indicating whether the scenario is active. */
  activeScenario: boolean;

  /** A function to set the active scenarios. */
  setActiveScenarios: React.Dispatch<React.SetStateAction<number[] | null>>;

  /** An array of active scenarios. */
  activeScenarios: number[] | null;

  /** The minimum number of compartment rows. */
  minCompartmentsRows: number;

  /** The maximum number of compartment rows. */
  maxCompartmentsRows: number;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;

  /** Boolean to determine if the arrow is displayed */
  arrow?: boolean;
}

/**
 * This component renders a card for either the case data or the scenario cards. Each card contains a title,
 * a list of compartment values, and change rates relative to the simulation start. Additionally, a tooltip is used to set whether the card is active or not.
 * Furthermore, the card is clickable, and if clicked, it will become the selected scenario.
 */
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
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
  arrow = true,
}: MainCardProps) {
  const theme = useTheme();
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
          maxHeight: compartmentsExpanded
            ? maxCompartmentsRows > 5
              ? `${(340 / 6) * maxCompartmentsRows}px`
              : `${(480 / 6) * maxCompartmentsRows}px`
            : 'auto',
          paddingBottom: '9px',
          boxSizing: 'border-box',
          width: '200px',
          bgcolor: theme.palette.background.paper,
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
            height: '65px',
            alignItems: 'self-end',
            justifyContent: 'left',
            width: 'full',
            transform: activeScenarios?.includes(index) ? 'none' : 'rotateY(180deg)',
          }}
        >
          <CardTitle label={label} color={color} />
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
          arrow={arrow}
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
