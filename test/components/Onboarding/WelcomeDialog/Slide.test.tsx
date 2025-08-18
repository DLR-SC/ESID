// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {describe, test, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ThemeProvider} from '@emotion/react';
import Theme from '@/util/Theme';
import Slide from '@/components/OnboardingComponents/WelcomeDialog/Slide';
import {I18nextProvider} from 'react-i18next';
import i18n from 'util/i18nForTests';

const SlideTest = () => (
  <ThemeProvider theme={Theme}>
    <Slide step={1} title='Slide Title' content='Slide Content' imageSrc='image.png' />
  </ThemeProvider>
);

describe('Slide Component', () => {
  test('renders the component correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SlideTest />
      </I18nextProvider>
    );
    expect(screen.getByText('Slide Title')).toBeInTheDocument();
    expect(screen.getByText('Slide Content')).toBeInTheDocument();
    const image = screen.getByAltText('Illustration 2');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'image.png');
  });
});
