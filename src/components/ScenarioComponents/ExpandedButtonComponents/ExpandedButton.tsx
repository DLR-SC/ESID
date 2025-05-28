// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Button from '@mui/material/Button';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {Localization} from 'types/localization';

interface GeneralButtonProps {
  /** Texts for the button in both states: clicked and unclicked */
  buttonTexts: {clicked: string; unclicked: string};

  /** boolean to determine if the button is disabled */
  isDisabled: boolean;

  /** Function to handle the button click event */
  handleClick: () => void;

  /** Boolean to determine if the button is in expanded state */
  isExpanded: boolean;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This component renders a general button with clicked/unclicked texts,
 * disabled state, click handler, and localization support.
 */
export default function GeneralButton({
  buttonTexts,
  isDisabled,
  handleClick,
  isExpanded,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: GeneralButtonProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  return (
    <Button
      id='toggle-expanded-compartments-button'
      variant='outlined'
      color='primary'
      sx={{width: '100%'}}
      disabled={isDisabled}
      aria-label={
        localization.overrides && localization.overrides['scenario.more']
          ? customT(localization.overrides['scenario.more'])
          : defaultT('scenario.more')
      }
      onClick={() => handleClick()}
    >
      {isExpanded ? buttonTexts.clicked : buttonTexts.unclicked}
    </Button>
  );
}
