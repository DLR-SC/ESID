// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {http, HttpResponse} from 'msw';

export default [
  http.get('*/api/v1/scenarios/1/', () => {
    return HttpResponse.json({
      results: {
        name: 'test',
        description: 'Test Scenario',
        simulationModel: 'testmodel',
        numberOfGroups: 10,
        numberOfNodes: 10,
        parameters: [
          {
            parameter: 'Test Parameter 1',
            groups: [
              {min: 0.0, max: 1},
              {min: 0.5, max: 1},
              {min: 0.5, max: 2},
              {min: 0.5, max: 2},
              {min: 0.5, max: 2},
              {min: 0.5, max: 1},
              {min: 0.5, max: 1},
            ],
          },
          {
            parameter: 'Test Parameter 2',
            groups: [
              {min: 0.3, max: 0.7},
              {min: 0.3, max: 0.7},
              {min: 0.3, max: 0.7},
              {min: 0.3, max: 0.7},
              {min: 0.3, max: 0.7},
              {min: 0.3, max: 0.7},
              {min: 0.3, max: 0.7},
            ],
          },
        ],
        nodes: ['00000', '01001', '01002', '01003', '01004', '01051', '01053', '01054', '01055', '01056'],
      },
    });
  }),
  http.get('/assets/lk_germany_reduced_list.json', () => {
    return HttpResponse.json([
      {
        RS: '09771',
        GEN: 'Aichach-Friedberg',
        BEZ: 'LK',
      },
      {
        RS: '12345',
        GEN: 'Test District',
        BEZ: 'Test Type',
      },
    ]);
  }),
];
