// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {render, screen} from '@testing-library/react';
import {describe, test, expect} from 'vitest';
import React, {useState} from 'react';
import {ThemeProvider} from '@mui/system';
import Theme from 'util/Theme';
import TopBarPopover from 'components/OnboardingComponents/TopBarPopover';
import {Provider} from 'react-redux';
import {Store} from '../../../store';

type TopBarPopoverTestProps = {
  allToursCompletedProp?: boolean;
};

const TopBarPopoverTest: React.FC<TopBarPopoverTestProps> = ({allToursCompletedProp = false}) => {
  const [anchorEl] = useState<HTMLElement | null>(document.createElement('div'));
  const [open, setOpen] = useState(true);

  const onClose = () => setOpen(false);
  const allToursCompleted = allToursCompletedProp;
  const completedTours = allToursCompleted ? 5 : 2;
  const totalTours = 5;

  return (
    <ThemeProvider theme={Theme}>
      <Provider store={Store}>
        <TopBarPopover
          anchorEl={anchorEl}
          open={open}
          onClose={onClose}
          allToursCompleted={allToursCompleted}
          completedTours={completedTours}
          totalTours={totalTours}
        />
      </Provider>
    </ThemeProvider>
  );
};
describe('TopBarPopover', () => {
  test('renders the popover with the correct content', () => {
    render(<TopBarPopoverTest />);

    expect(screen.getByTestId('popover-testid')).toBeInTheDocument();
    expect(screen.getByText('getStarted')).toBeInTheDocument();
    expect(screen.getByText('getStartedContent')).toBeInTheDocument();

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '40'); // two out of five tours completed is 40%
    expect(screen.getByText('40% completed')).toBeInTheDocument();
  });

  test('displays the correct content when all tours are completed', () => {
    render(<TopBarPopoverTest allToursCompletedProp={true} />);

    expect(screen.getByText('completedTours')).toBeInTheDocument();
    expect(screen.getByText('completedToursContent')).toBeInTheDocument();
  });
});
