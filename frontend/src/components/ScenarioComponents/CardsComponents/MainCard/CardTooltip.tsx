// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Box, Tooltip, IconButton} from '@mui/material';
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import {useTranslation} from 'react-i18next';
import React, {Dispatch} from 'react';
import {Localization} from 'types/localization';
import {hexToRGB} from 'util/util';
import Close from '@mui/icons-material/Close';

interface CardTooltipProps {
  /** A boolean indicating whether the user is hovering over the card. */
  hover: boolean;

  /** The color of the card. */
  color: string;

  /** The title of the card. */
  id: string;

  /** The number of the selected scenario. */
  setSelected: Dispatch<{id: string; state: boolean}>;

  /** A boolean indicating whether the scenario is active. */
  isActive: boolean;

  /** A function to set the active scenarios. */
  setActive: Dispatch<{id: string; state: boolean}>;

  hide: Dispatch<string>;

  /** An object containing localization information (translation & number formatting).*/
  localization?: Localization;
}

/**
 * This component renders a tooltip which is used to set whether the card is active or not.
 */
export default function CardTooltip({
  id,
  hover,
  color,
  setSelected,
  isActive,
  setActive,
  hide,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
}: CardTooltipProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);

  return hover ? (
    <Box
      id={`tooltip-container-${id}`}
      sx={{
        zIndex: 2,
        width: 'full',
        height: '40px',
        boxShadow: hover || isActive ? 'none' : `0px 0px 0px 6px ${hexToRGB(color, 0.4)}`,
        display: hover ? 'flex' : 'none',
        alignItems: 'flex-end',
        alignContent: 'flex-start',
      }}
    >
      <Tooltip
        title={
          isActive
            ? localization.overrides?.['scenario.deactivate']
              ? customT(localization.overrides['scenario.deactivate'])
              : defaultT('scenario.deactivate')
            : localization.overrides?.['scenario.activate']
              ? customT(localization.overrides['scenario.activate'])
              : defaultT('scenario.activate')
        }
        arrow={true}
      >
        <IconButton
          color={'primary'}
          onClick={(event) => {
            event.stopPropagation(); // Used in order to avoid triggering the click event on the card and only allow triggering the event that handles adding the card to the active scenarios.
            if (isActive) {
              setActive({id, state: false});
              setSelected({id, state: false});
            } else {
              setActive({id, state: true});
              setSelected({id, state: true});
            }
          }}
          aria-label={
            isActive
              ? localization.overrides?.['scenario.deactivate']
                ? customT(localization.overrides['scenario.deactivate'])
                : defaultT('scenario.deactivate')
              : localization.overrides?.['scenario.activate']
                ? customT(localization.overrides['scenario.activate'])
                : defaultT('scenario.activate')
          }
        >
          {isActive ? <CheckBox /> : <CheckBoxOutlineBlank />}
        </IconButton>
      </Tooltip>
      <Tooltip title={defaultT('scenario.hide').toString()} arrow={true}>
        <IconButton
          color={'primary'}
          onClick={() => {
            hide(id);
          }}
          aria-label={defaultT('scenario.hide')}
        >
          <Close />
        </IconButton>
      </Tooltip>
    </Box>
  ) : null;
}
