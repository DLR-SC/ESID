import {Provider} from 'react-redux';
import Store from '../../../store';
import React from 'react';
import {screen, render} from '@testing-library/react';
import HeatLegendEdit from '../../../components/Sidebar/HeatLegendEdit';

describe('HeatLegendEdit', () => {
  // We mock fetch to return two entries for searchable districts.
  /*global.fetch = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      json: () => {
        return Promise.resolve([
          {
            name: "Preset 1",
            isNormalized: true,
            steps: [
              {color: "rgb(161,217,155)", value: 0},
              {color: "rgb(236,57,62)", value: 1},
              {color: "rgb(0,0,0)", value: 2}
            ]
          },
          {
            name: "Preset 2",
            isNormalized: false,
            steps: [
              {color: "rgba(11,234,234,0.91)", value: 0},
              {color: "rgba(57,141,236,0.98)", value: 250},
              {color: "rgb(234,13,19)", value: 500}
            ]
          },
          {
            name: "Default",
            isNormalized: true,
            steps: [
              {color: "rgba(85,234,11,0.91)", value: 0},
              {color: "rgba(236,194,57,0.98)", value: 1},
              {color: "rgb(234,13,19)", value: 2}
            ]
          },
        ]);
      },
    });
  });*/

  test('Presets loaded correctly', async () => {
    render(
      <Provider store={Store}>
        <HeatLegendEdit />
      </Provider>
    );
    screen.getByRole('');
  });
});
