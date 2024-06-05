import Button from '@mui/material/Button';
import {useTranslation} from 'react-i18next';
import React from 'react';

interface GeneralButtonProps {
  buttonTexts: {expanded: string; collapsed: string};
  isDisabled: () => boolean;
  handleClick: () => void;
  isExpanded: boolean;
  localization: {
    numberFormatter?: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}

export default function GeneralButton({
  buttonTexts,
  isDisabled,
  handleClick,
  isExpanded,
  localization,
}: GeneralButtonProps) {
  const {t: defaultT} = useTranslation();
  const customLang = localization.customLang;
  const {t: customT} = useTranslation(customLang || undefined);
  return (
    <Button
      id='toggle-expanded-compartments-button'
      variant='outlined'
      color='primary'
      sx={{width: '100%'}}
      disabled={isDisabled()}
      aria-label={
        localization.overrides && localization.overrides['scenario.more']
          ? customT(localization.overrides['scenario.more'])
          : defaultT('scenario.more')
      }
      onClick={() => handleClick()}
    >
      {isExpanded ? buttonTexts.expanded : buttonTexts.collapsed}
    </Button>
  );
}
