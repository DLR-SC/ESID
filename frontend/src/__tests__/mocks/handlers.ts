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
  http.get('*/api/v1/groups/', () => {
    return HttpResponse.json({
      count: 7,
      results: [
        {
          key: 'age_0',
          name: 'age_0',
          description: 'Ages between 0-4 years',
          category: 'age',
        },
        {
          key: 'age_1',
          name: 'age_1',
          description: 'Ages between 5-14 years',
          category: 'age',
        },
        {
          key: 'age_2',
          name: 'age_2',
          description: 'Ages between 15-34 years',
          category: 'age',
        },
        {
          key: 'age_3',
          name: 'age_3',
          description: 'Ages between 35-59 years',
          category: 'age',
        },
        {
          key: 'age_4',
          name: 'age_4',
          description: 'Ages between 60-79 years',
          category: 'age',
        },
        {
          key: 'age_5',
          name: 'age_5',
          description: 'Ages above 80',
          category: 'age',
        },
        {
          key: 'total',
          name: 'total',
          description: 'All ages',
          category: 'age',
        },
      ],
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
