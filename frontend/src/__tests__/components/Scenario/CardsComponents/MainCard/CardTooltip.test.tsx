// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import CardTooltip from 'components/ScenarioComponents/CardsComponents/MainCard/CardTooltip';
import Theme from 'util/Theme';
import {ThemeProvider} from '@mui/material';
import {describe, test, expect} from 'vitest';

interface CardTooltipTestInterface {
  hovertest: boolean;
  index: number;
  activeScenario: boolean;
  scenarios: number[];
}
const CardTooltipTest = ({hovertest, scenarios, index, activeScenario}: CardTooltipTestInterface) => {
  const color = '#00000';
  const [activeScenarios, setActiveScenarios] = useState<number[] | null>(scenarios);
  const [numberSelectedScenario, setSelectedScenario] = useState<number | null>(index);
  const compartmentsExpanded = false;

  return (
    <ThemeProvider theme={Theme}>
      <CardTooltip
        index={index}
        hover={hovertest}
        color={color}
        activeScenario={activeScenario}
        activeScenarios={activeScenarios}
        numberSelectedScenario={numberSelectedScenario}
        compartmentsExpanded={compartmentsExpanded}
        setActiveScenarios={setActiveScenarios}
        setSelectedScenario={setSelectedScenario}
      />
    </ThemeProvider>
  );
};

describe('CardTooltip', () => {
  test('renders the tooltip when hover is true', () => {
    render(<CardTooltipTest hovertest={true} scenarios={[1, 2]} index={1} activeScenario={true} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'scenario.deactivate');
  });
  test('does not render the tooltip when hover is false', () => {
    render(<CardTooltipTest hovertest={false} scenarios={[1, 2]} index={1} activeScenario={true} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  test('renders the tooltip label scenario.activate correctly when hover is true and the sceanrio is not active', () => {
    render(<CardTooltipTest hovertest={true} scenarios={[2]} index={1} activeScenario={false} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'scenario.activate');
  });
});
