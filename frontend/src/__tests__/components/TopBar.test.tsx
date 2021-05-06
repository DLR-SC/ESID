import React from 'react';
import {render, screen} from '@testing-library/react';

import TopBar from '../../components/TopBar';

describe('TopBar', () => {
  test('icon', () => {
    render(<TopBar />);
    screen.getByAltText('ESID Application Icon');
  });
});
