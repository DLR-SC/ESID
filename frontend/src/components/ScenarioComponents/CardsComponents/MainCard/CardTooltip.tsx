// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, Tooltip, IconButton} from '@mui/material';
import {CheckBox, CheckBoxOutlineBlank} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import React from 'react';
import { Localization } from 'types/localization';
import { hexToRGB } from 'util/util';

interface CardTooltipProps {
  /** A boolean indicating whether the user is hovering over the card. */
  hover: boolean;

  /** The color of the card. */
  color: string;

  /** The title of the card. */
  index: number;

  /** A boolean indicating whether the scenario is active. */
  activeScenario: boolean;

  /** An array of active scenarios. */
  activeScenarios: number[] | null;

  /** The number of the selected scenario. */
  numberSelectedScenario: number | null;

  /** The number of the selected scenario. */
  setSelectedScenario: React.Dispatch<React.SetStateAction<number | null>>;

  /** A function to set the active scenarios. */
  setActiveScenarios: React.Dispatch<React.SetStateAction<number[] | null>>;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This component renders a tooltip which is used to set whether the card is active or not.
 */
export default function CardTooltip({
  index,
  hover,
  color,
  activeScenario,
  activeScenarios,
  numberSelectedScenario,
  setActiveScenarios,
  setSelectedScenario,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
}: CardTooltipProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);

  /**
   * Manages the scenario based on the given index.
   * If the scenario is active and there are no other active scenarios, it clears the active scenarios and selected scenario.
   * Otherwise, it adds or removes the index from the active scenarios list and updates the selected scenario accordingly.
   * @param index - The index of the scenario to manage.
   */
  const manageScenario = (index: number) => {
    const isActive = activeScenarios?.includes(index);
    if (isActive && activeScenarios?.length === 0) {
      setActiveScenarios(null);
      setSelectedScenario(null);
    }
    const newActiveScenarios = isActive
      ? activeScenarios!.filter((id) => id !== index)
      : [...(activeScenarios || []), index];

    newActiveScenarios.sort();
    setActiveScenarios(newActiveScenarios);

    setSelectedScenario(
      newActiveScenarios.length === 1
        ? newActiveScenarios[0]
        : numberSelectedScenario === index
          ? newActiveScenarios[newActiveScenarios.length - 1]
          : numberSelectedScenario
    );
  };

  return hover ? (
    <Box
      id={`tooltip-container-${index}`}
      sx={{
        zIndex: 2,
        width: 'full',
        height: '40px',
        boxShadow: hover || activeScenarios?.includes(index) ? 'none' : `0px 0px 0px 6px ${hexToRGB(color, 0.4)}`,
        display: hover ? 'flex' : 'none',
        alignItems: 'flex-end',
        alignContent: 'flex-start',
      }}
    >
      <Tooltip
        title={
          activeScenarios?.includes(index)
            ? localization.overrides && localization.overrides['scenario.deactivate'.toString()]
              ? customT(localization.overrides['scenario.deactivate'.toString()])
              : defaultT('scenario.deactivate'.toString())
            : localization.overrides && localization.overrides['scenario.activate'.toString()]
              ? customT(localization.overrides['scenario.activate'.toString()])
              : defaultT('scenario.activate'.toString())
        }
        arrow={true}
      >
        <IconButton
          color={'primary'}
          onClick={(event) => {
            event.stopPropagation(); // Used in order to avoid triggering the click event on the card and only allow triggering the event that handles adding the card to the active scenarios.
            manageScenario(index);
          }}
          aria-label={
            activeScenario
              ? localization.overrides && localization.overrides['scenario.deactivate'.toString()]
                ? customT(localization.overrides['scenario.deactivate'.toString()])
                : defaultT('scenario.deactivate'.toString())
              : localization.overrides && localization.overrides['scenario.activate'.toString()]
                ? customT(localization.overrides['scenario.activate'.toString()])
                : defaultT('scenario.activate'.toString())
          }
        >
          {activeScenario ? <CheckBox /> : <CheckBoxOutlineBlank />}
        </IconButton>
      </Tooltip>
    </Box>
  ) : null;
}
