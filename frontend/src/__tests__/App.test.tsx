import React from 'react';
import {render} from '@testing-library/react';

import App from '../App';

describe('App', () => {
  test('App', () => {
    render(<App />);
    const app = document.getElementById('app');
    expect(app).not.toBeNull();
  });
});
