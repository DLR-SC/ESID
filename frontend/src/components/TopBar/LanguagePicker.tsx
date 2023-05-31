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

  return (
    <ToggleButtonGroup
      id='language-picker-toggle-group'
      value={i18n.language}
      exclusive
      onChange={handleLanguage}
      aria-label={t('topBar.language')}
      sx={{height: '36px'}}
    >
      <ToggleButton id='language-picker-german-option' value='de' aria-label='Deutsch'>
        <Flag svgString={DE} />
      </ToggleButton>
      <ToggleButton id='language-picker-english-option' value='en' aria-label='English'>
        <Flag svgString={GB} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

/**
 * Creates a flag icon from a svg string with a 3x2 ratio.
 */
function Flag(props: {svgString: string}): JSX.Element {
  return (
    <div
      style={{width: '24px', height: '16px', lineHeight: 'normal'}}
      dangerouslySetInnerHTML={{__html: props.svgString}}
    />
  );
}
