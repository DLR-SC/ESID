// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {http, HttpResponse} from 'msw';

export default [
  http.get('*/api/v1/simulations/', () => {
    return HttpResponse.json({
      results: [
        {
          id: 1,
          name: 'Test Scenario',
          description: 'Test',
          startDay: '2024-01-01',
          numberOfDays: 30,
          scenario: 'http://localhost:8000/api/v1/scenarios/1/',
          percentiles: [5, 15, 25, 50, 75, 85, 95],
        },
      ],
    });
  }),
  http.get('*/api/v1/scenarios/1/', () => {
    return HttpResponse.json({
      results: {
        name: 'test',
        description: 'Test Scenario',
        simulationModel: 'testmodel',
        numberOfGroups: 7,
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
  http.get('/assets/lk_germany_reduced.geojson', () => {
    return HttpResponse.json({
      features: [
        {
          type: 'Feature',
          properties: {
            RS: '09771',
            GEN: 'Aichach-Friedberg',
            BEZ: 'LK',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [10.0, 50.0],
                [11.0, 50.0],
                [11.0, 51.0],
                [10.0, 51.0],
                [10.0, 50.0],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            RS: '12345',
            GEN: 'Test District',
            BEZ: 'Test Type',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [12.0, 52.0],
                [13.0, 52.0],
                [13.0, 53.0],
                [12.0, 53.0],
                [12.0, 52.0],
              ],
            ],
          },
        },
      ],
    });
  }),
  http.get('*/api/v1/rki/00000/', () => {
    return HttpResponse.json({
      count: 1470,
      next: 'http://hpcagainstcorona.sc.bs.dlr.de:8000/api/v1/rki/00000/?limit=100&offset=100',
      previous: null,
      results: [
        {
          name: '00000',
          day: '2021-04-01',
          compartments: {
            ICU: 7544.857142857809,
            Dead: 156795.99999999697,
            Carrier: 52067.7571428504,
            Exposed: 101406.62857143072,
            Infected: 168094.29660715,
            Recovered: 5280718.971428579,
            Susceptible: 160551069.35357141,
            Hospitalized: 15692.13553571458,
          },
        },
        {
          name: '00000',
          day: '2021-04-02',
          compartments: {
            ICU: 7714.285714286607,
            Dead: 157107.71428571496,
            Carrier: 51337.04285714539,
            Exposed: 103249.0428571395,
            Infected: 166189.1675285677,
            Recovered: 5312479.899999999,
            Susceptible: 160519367.40999994,
            Hospitalized: 15945.436757141902,
          },
        },
        {
          name: '00000',
          day: '2021-04-03',
          compartments: {
            ICU: 7930.857142856603,
            Dead: 157423.14285714203,
            Carrier: 51261.157142856624,
            Exposed: 106423.34285714672,
            Infected: 164094.96752857446,
            Recovered: 5342113.514285708,
            Susceptible: 160487980.86714286,
            Hospitalized: 16162.151042857242,
          },
        },
        {
          name: '00000',
          day: '2021-04-04',
          compartments: {
            ICU: 8148.857142856805,
            Dead: 157749.71428571548,
            Carrier: 51630.6571428576,
            Exposed: 109818.47142856922,
            Infected: 162393.1123714261,
            Recovered: 5371056.657142856,
            Susceptible: 160456237.09714285,
            Hospitalized: 16355.433342857074,
          },
        },
        {
          name: '00000',
          day: '2021-04-05',
          compartments: {
            ICU: 8362.285714286003,
            Dead: 158082.28571428862,
            Carrier: 52664.57142856877,
            Exposed: 113461.10000000132,
            Infected: 161169.5783571417,
            Recovered: 5399324.814285714,
            Susceptible: 160423849.1278571,
            Hospitalized: 16476.23664285755,
          },
        },
        {
          name: '00000',
          day: '2021-04-06',
          compartments: {
            ICU: 8552.285714284408,
            Dead: 158415.9999999995,
            Carrier: 54239.42857143352,
            Exposed: 117375.74285714087,
            Infected: 161690.77971428438,
            Recovered: 5426469.928571427,
            Susceptible: 160390125.1229999,
            Hospitalized: 16520.711571428492,
          },
        },
        {
          name: '00000',
          day: '2021-04-07',
          compartments: {
            ICU: 8728.857142857009,
            Dead: 158750.57142857276,
            Carrier: 55384.49999999517,
            Exposed: 121601.44285714524,
            Infected: 163949.66373571547,
            Recovered: 5453513.657142862,
            Susceptible: 160354926.29742852,
            Hospitalized: 16535.010264286728,
          },
        },
        {
          name: '00000',
          day: '2021-04-08',
          compartments: {
            ICU: 8878.857142855804,
            Dead: 159085.99999999817,
            Carrier: 57499.98571428868,
            Exposed: 124315.85714286129,
            Infected: 166509.81105713488,
            Recovered: 5481310.299999999,
            Susceptible: 160319304.17585713,
            Hospitalized: 16485.013085713865,
          },
        },
        {
          name: '00000',
          day: '2021-04-09',
          compartments: {
            ICU: 9021.142857142608,
            Dead: 159427.7142857186,
            Carrier: 59761.78571428676,
            Exposed: 125970.94285714577,
            Infected: 171028.8283928595,
            Recovered: 5509727.542857129,
            Susceptible: 160282056.87185714,
            Hospitalized: 16395.17117857133,
          },
        },
        {
          name: '00000',
          day: '2021-04-10',
          compartments: {
            ICU: 9116.857142855602,
            Dead: 159776.28571428475,
            Carrier: 61451.28571428486,
            Exposed: 126800.9571428575,
            Infected: 177047.54667857205,
            Recovered: 5539581.642857144,
            Susceptible: 160243294.2361428,
            Hospitalized: 16321.18860714271,
          },
        },
        {
          name: '00000',
          day: '2021-04-11',
          compartments: {
            ICU: 9184.571428571602,
            Dead: 160143.42857143076,
            Carrier: 62311.871428577084,
            Exposed: 127704.51428570943,
            Infected: 183369.32055000018,
            Recovered: 5570634.44285714,
            Susceptible: 160203770.56014282,
            Hospitalized: 16271.290735714018,
          },
        },
        {
          name: '00000',
          day: '2021-04-12',
          compartments: {
            ICU: 9243.71428571581,
            Dead: 160522.8571428556,
            Carrier: 63431.999999998545,
            Exposed: 128420.1857142863,
            Infected: 189044.42254286224,
            Recovered: 5602114.657142864,
            Susceptible: 160164342.75499997,
            Hospitalized: 16269.408171428533,
          },
        },
        {
          name: '00000',
          day: '2021-04-13',
          compartments: {
            ICU: 9308.000000001206,
            Dead: 160909.42857142855,
            Carrier: 64058.8999999981,
            Exposed: 129532.2428571452,
            Infected: 193832.27605000173,
            Recovered: 5634843.257142854,
            Susceptible: 160124551.4699999,
            Hospitalized: 16354.425378572192,
          },
        },
        {
          name: '00000',
          day: '2021-04-14',
          compartments: {
            ICU: 9379.714285713007,
            Dead: 161309.42857142715,
            Carrier: 64628.75714285903,
            Exposed: 130531.58571428382,
            Infected: 197472.17099285405,
            Recovered: 5668918.428571431,
            Susceptible: 160084681.55571425,
            Hospitalized: 16468.35900714228,
          },
        },
        {
          name: '00000',
          day: '2021-04-15',
          compartments: {
            ICU: 332.7782420852289,
            Dead: 2986.714285714101,
            Carrier: 22402.74285714291,
            Exposed: 45451.11428571386,
            Infected: 73505.4394464306,
            Recovered: 1971724.4285714272,
            Susceptible: 47131432.6027103,
            Hospitalized: 3628.846267857133,
          },
        },
      ],
    });
  }),
  http.get('*/api/v1/groupcategories/', () => {
    return HttpResponse.json({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          key: 'age',
          name: 'age',
          description: 'Age groups',
        },
        {
          key: 'gender',
          name: 'gender',
          description: 'Gender',
        },
      ],
    });
  }),
  http.get('*/api/v1/simulations/', () => {
    return HttpResponse.json({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: 'summer_2021_sim1',
          description: 'Summer 2021 Simulation 1',
          startDay: '2021-06-06',
          numberOfDays: 90,
          scenario: 'http://hpcagainstcorona.sc.bs.dlr.de:8000/api/v1/scenarios/1/',
          percentiles: [25, 50, 75],
        },
        {
          id: 2,
          name: 'summer_2021_sim2',
          description: 'Summer 2021 Simulation 2',
          startDay: '2021-06-06',
          numberOfDays: 90,
          scenario: 'http://hpcagainstcorona.sc.bs.dlr.de:8000/api/v1/scenarios/1/',
          percentiles: [25, 50, 75],
        },
      ],
    });
  }),
  http.get('*/api/v1/simulationmodels/', () => {
    return HttpResponse.json({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          key: 'secihurd',
          name: 'secihurd',
        },
      ],
    });
  }),
  http.get('*/api/v1/simulationmodels/secihurd/', () => {
    return HttpResponse.json({
      results: {
        key: 'secihurd',
        name: 'secihurd',
        description: '',
        parameters: [
          'AsymptoticCasesPerInfectious',
          'DeathsPerHospitalized',
          'HomeToHospitalizedTime',
          'HospitalizedCasesPerInfectious',
          'HospitalizedToHomeTime',
          'HospitalizedToICUTime',
          'ICUCasesPerHospitalized',
          'ICUToDeathTime',
          'ICUToHomeTime',
          'IncubationTime',
          'InfectionProbabilityFromContact',
          'InfectiousTimeMild',
          'MaxRiskOfInfectionFromSympomatic',
          'ReducExpInf',
          'ReducImmuneExp',
          'ReducImmuneExpInf',
          'ReducImmuneInfHosp',
          'ReducInfHosp',
          'ReducTime',
          'ReducVaccExp',
          'RelativeCarrierInfectability',
          'RiskOfInfectionFromSympomatic',
          'Seasonality',
          'SerialInterval',
          'VaccinationGap',
        ],
        compartments: [
          'Carrier',
          'CarrierT',
          'CarrierTV1',
          'CarrierTV2',
          'CarrierV1',
          'CarrierV2',
          'Dead',
          'Exposed',
          'ExposedV1',
          'ExposedV2',
          'Hospitalized',
          'HospitalizedV1',
          'HospitalizedV2',
          'ICU',
          'ICUV1',
          'ICUV2',
          'Infected',
          'InfectedT',
          'InfectedTV1',
          'InfectedTV2',
          'InfectedV1',
          'InfectedV2',
          'Recovered',
          'Susceptible',
          'SusceptibleV1',
        ],
      },
    });
  }),
];
