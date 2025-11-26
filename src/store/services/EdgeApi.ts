// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useEffect, useMemo} from 'react';

import day1URL from '../../../assets/data/edges_day_1.csv?url';
import day2URL from '../../../assets/data/edges_day_2.csv?url';

export interface Edge {
  start: string;
  end: string;
  value: number;
}

const DAY1: Map<string, Array<Edge>> = new Map();
const DAY2: Map<string, Array<Edge>> = new Map();

export default function useGetEdges(date: string, district: string, amount: number = 5): Array<Edge> {
  useEffect(() => {
    // Function to process CSV data and populate the specified map
    const processEdgeData = (data: string, targetMap: Map<string, Array<Edge>>) => {
      data.split('\n').forEach((line, i) => {
        if (i !== 0) {
          const values = line.split(',');
          if (values.length !== 6) return;
          const dataEntry: EdgeDataEntry = {
            day: parseInt(values[0]),
            start_node: values[1].padStart(5, '0'),
            end_node: values[2].padStart(5, '0'),
            percentile: parseInt(values[3]),
            mild_infected: parseInt(values[4]),
            total: parseInt(values[5]),
          };
          if (dataEntry.percentile === 50) {
            targetMap.set(dataEntry.start_node, [
              ...(targetMap.get(dataEntry.start_node) || []),
              {start: dataEntry.start_node, end: dataEntry.end_node, value: dataEntry.mild_infected},
            ]);
          }
        }
      });

      for (const edges of targetMap.values()) {
        edges.sort((a, b) => a.value - b.value);
      }
    };

    // Process day1 data
    void fetch(day1URL)
      .then((response) => response.text())
      .then((data) => {
        processEdgeData(data, DAY1);
      });

    // Process day2 data
    void fetch(day2URL)
      .then((response) => response.text())
      .then((data) => {
        processEdgeData(data, DAY2);
      });
  }, []);

  return useMemo(() => {
    return (parseInt(date.slice(-1)) % 2 === 0 ? DAY1 : DAY2).get(district)?.slice(0, amount) ?? [];
  }, [date, district, amount]);
}

interface EdgeDataEntry {
  day: number;
  start_node: string;
  end_node: string;
  percentile: number;
  mild_infected: number;
  total: number;
}
