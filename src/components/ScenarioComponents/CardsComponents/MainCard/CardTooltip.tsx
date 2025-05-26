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
import type {SyntheticListenerMap} from '@dnd-kit/core/dist/hooks/utilities';
import type {DraggableAttributes} from '@dnd-kit/core';
import DragIndicator from '@mui/icons-material/DragIndicator';

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

  /** The drag attributes of the card. */
  dragAttributes: DraggableAttributes | undefined;

  /** The drag listeners of the card. */
  dragListeners: SyntheticListenerMap | undefined;

  /** A boolean indicating whether the card is being dragged. */
  isDragging: boolean;

  /** The activator node ref of the card. */
  setActivatorNodeRef: (element: HTMLElement | null) => void;

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
  dragAttributes,
  dragListeners,
  isDragging,
  setActivatorNodeRef,
  localization = {
    formatNumber: (value: number) => value.toString(),
    customLang: 'global',
    overrides: {},
  },
}: CardTooltipProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);

  return hover || isDragging ? (
    <Box
      id={`tooltip-container-${id}`}
      sx={{
        zIndex: 2,
        width: 'full',
        height: '40px',
        boxShadow: hover || isActive ? 'none' : `0px 0px 0px 6px ${hexToRGB(color, 0.4)}`,
        display: hover || isDragging ? 'flex' : 'none',
        alignItems: 'flex-end',
        alignContent: 'flex-start',
        justifyContent: 'space-between',
      }}
    >
      <Box>
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

      <Tooltip title={defaultT('scenario.drag').toString()} arrow={true}>
        <IconButton
          ref={setActivatorNodeRef}
          color={'primary'}
          {...dragListeners}
          {...dragAttributes}
          style={{cursor: isDragging ? 'grabbing' : 'grab'}}
        >
          <DragIndicator />
        </IconButton>
      </Tooltip>
    </Box>
  ) : null;
}
