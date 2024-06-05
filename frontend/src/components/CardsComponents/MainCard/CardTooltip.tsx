// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, Tooltip, IconButton} from '@mui/material';
import {CheckBox, CheckBoxOutlineBlank} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {hexToRGB} from 'util/util';

interface CardTooltipProps {
  hover: boolean;
  color: string;
  index: number;
  activeScenario: boolean;
  activeScenarios: number[] | null;
  numberSelectedScenario: number | null;
  setSelectedScenario: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveScenarios: React.Dispatch<React.SetStateAction<number[] | null>>;
  localization: {
    numberFormatter: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}

export default function CardTooltip({
  index,
  hover,
  color,
  activeScenario,
  activeScenarios,
  numberSelectedScenario,
  setActiveScenarios,
  setSelectedScenario,
  localization,
}: CardTooltipProps) {
  const {t: defaultT} = useTranslation();
  const customLang = localization.customLang;
  const {t: customT} = useTranslation(customLang || undefined);

  const manageScenario = (index: number) => {
    const isActive = activeScenarios?.includes(index);
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
        height: '50px',
        borderRadius: '0 0 4px 4px',
        boxShadow: hover || activeScenarios?.includes(index) ? 'none' : `0px 0px 0px 6px ${hexToRGB(color, 0.4)}`,
        display: hover ? 'flex' : 'none',
        alignItems: 'flex-end',
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
            event.stopPropagation();
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
