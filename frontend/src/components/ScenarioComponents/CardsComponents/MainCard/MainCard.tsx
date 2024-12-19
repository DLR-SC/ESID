// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {Dispatch} from 'react';
import {Box, useTheme} from '@mui/material';
import CardTitle from './CardTitle';
import CardTooltip from './CardTooltip';
import CardRows from './CardRows';
import {Localization} from 'types/localization';
import {hexToRGB} from 'util/util';

interface MainCardProps {
  /** A unique identifier for the card. */
  id: string;

  /** The title of the card. */
  label: string;

  /** The color of the card. */
  color: string;

  /** A dictionary of compartment values associated with the card. */
  compartmentValues: Record<string, number | null> | null;

  /** A dictionary of start values used for calculating the rate. This determines whether the values have increased, decreased, or remained the same. */
  referenceValues: Record<string, number> | null;

  /** A boolean indicating whether the compartments are expanded. */
  compartmentsExpanded: boolean;

  /** The compartment that is currently selected. */
  selectedCompartmentId: string | null;

  /** A boolean indicating whether the user is hovering over the card. */
  hover: boolean;

  /** A function to set the hover state of the card. */
  setHover: Dispatch<boolean>;

  /** A boolean indicating whether the scenario is selected. */
  isSelected: boolean;

  /** A function to set the selected scenario. */
  setSelected: Dispatch<{id: string; state: boolean}>;

  /** A boolean indicating whether the scenario is active. */
  isActive: boolean;

  /** A function to set the active scenario. */
  setActive: Dispatch<{id: string; state: boolean}>;

  hide: Dispatch<string>;

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
  id,
  label,
  hover,
  compartmentValues,
  referenceValues,
  setHover,
  compartmentsExpanded,
  selectedCompartmentId,
  color,
  isSelected,
  isActive,
  minCompartmentsRows,
  setSelected,
  setActive,
  hide,
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
      id={`main-card-external-container-${id}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: ((hover || isSelected) && isActive) || hover ? hexToRGB(color, 0.4) : null,
        zIndex: 3,
        boxShadow: ((hover || isSelected) && isActive) || hover ? `0 0 0 6px ${hexToRGB(color, 0.4)}` : null,
        borderRadius: ((hover || isSelected) && isActive) || hover ? 1 : null,
        borderColor: color,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (isActive) {
          setSelected({id, state: true});
        }
      }}
    >
      <Box
        id={`main-card-title&compartments-container-${id}`}
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
          transform: isActive ? 'none' : 'rotateY(180deg)',
        }}
      >
        <Box
          id={`main-card-title-container-${id}`}
          sx={{
            display: 'flex',
            height: '65px',
            alignItems: 'self-end',
            justifyContent: 'left',
            width: 'full',
            transform: isActive ? 'none' : 'rotateY(180deg)',
          }}
        >
          <CardTitle label={label} color={color} />
        </Box>
        <CardRows
          compartmentValues={compartmentValues}
          referenceValues={referenceValues}
          isFlipped={isActive}
          compartmentExpanded={compartmentsExpanded}
          selectedCompartmentId={selectedCompartmentId}
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
        id={id}
        isActive={isActive}
        setActive={setActive}
        hide={hide}
        setSelected={setSelected}
        localization={localization}
      />
    </Box>
  );
}

export default MainCard;
