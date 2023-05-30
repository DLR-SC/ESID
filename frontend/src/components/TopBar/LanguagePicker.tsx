import {useTranslation} from 'react-i18next';
import React from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import DE from 'country-flag-icons/string/3x2/DE';
import GB from 'country-flag-icons/string/3x2/GB';

/**
 * This component is a simple toggle box to switch between German and English translations.
 */
export default function LanguagePicker(): JSX.Element {
  const {t, i18n} = useTranslation();

  const handleLanguage = (_: unknown, newLanguage: string) => void i18n.changeLanguage(newLanguage);

  return <ToggleButtonGroup
    value={i18n.language}
    exclusive
    onChange={handleLanguage}
    aria-label={t('language')}
    sx={{height: '36px'}}
  >
    <ToggleButton value='de' aria-label='Deutsch'>
      <div style={{width: '24px', height: '16px', lineHeight: 'normal'}} dangerouslySetInnerHTML={{__html: DE}} />
    </ToggleButton>
    <ToggleButton value='en' aria-label='English'>
      <div style={{width: '24px', height: '16px', lineHeight: 'normal'}} dangerouslySetInnerHTML={{__html: GB}} />
    </ToggleButton>
  </ToggleButtonGroup>;
}