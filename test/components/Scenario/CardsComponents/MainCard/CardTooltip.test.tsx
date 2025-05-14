// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {render, screen} from '@testing-library/react';
import CardTooltip from '@/components/ScenarioComponents/CardsComponents/MainCard/CardTooltip';
import Theme from '@/util/Theme';
import {ThemeProvider} from '@mui/material';
import {describe, test, expect} from 'vitest';
import {I18nextProvider} from 'react-i18next';
import i18n from 'util/i18nForTests';

interface CardTooltipTestInterface {
  hovertest: boolean;
  id: string;
  activeScenario: boolean;
}

const CardTooltipTest = ({hovertest, id, activeScenario}: CardTooltipTestInterface) => {
  const color = '#00000';

  return (
    <ThemeProvider theme={Theme}>
      <I18nextProvider i18n={i18n}>
        <CardTooltip
          id={id}
          hover={hovertest}
          color={color}
          isActive={activeScenario}
          setActive={() => {}}
          setSelected={() => {}}
          hide={() => {}}
        />
      </I18nextProvider>
    </ThemeProvider>
  );
};

describe('CardTooltip', () => {
  test('renders the tooltip when hover is true', () => {
    render(<CardTooltipTest hovertest={true} id='1' activeScenario={true} />);
    expect(screen.getByLabelText('scenario.deactivate')).toBeInTheDocument();
  });
  test('does not render the tooltip when hover is false', () => {
    render(<CardTooltipTest hovertest={false} id='1' activeScenario={true} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  test('renders the tooltip label scenario.activate correctly when hover is true and the scenario is not active', () => {
    render(<CardTooltipTest hovertest={true} id='1' activeScenario={false} />);
    expect(screen.getByLabelText('scenario.activate')).toBeInTheDocument();
  });
});
