// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

type QueryParameterValue = string | number | boolean | Array<QueryParameterValue>;

export function generateParameters(
  parameters: Iterable<[string, QueryParameterValue]> | Record<string, QueryParameterValue>
): string {
  let kvPairs: [string, QueryParameterValue][];
  if (Symbol.iterator in parameters) {
    kvPairs = [...parameters];
  } else {
    kvPairs = Object.entries(parameters);
  }

  return kvPairs.map(([key, value]) => `${key}=${typeof value === 'object' ? value.join(',') : value}`).join('&');
}

console.log(
  generateParameters(
    new Map<string, QueryParameterValue>([
      ['number', 1],
      ['bool', false],
      ['array', [2, true, 'bye']],
      ['string', 'hi'],
    ])
  )
);
console.log(
  generateParameters([
    ['number', 1],
    ['bool', false],
    ['array', [2, true, 'bye']],
    ['string', 'hi'],
  ])
);

console.log(
  generateParameters({
    number: 1,
    bool: false,
    array: [2, true, 'bye'],
    string: 'hi',
  })
);
