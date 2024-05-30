// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect, useMemo, useState} from 'react';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {DateAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/DateAxis';
import {AxisRendererX} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererX';
import {Tooltip} from '@amcharts/amcharts5/.internal/core/render/Tooltip';
import {AxisRendererY} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererY';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {CategoryAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/CategoryAxis';
import {ColumnSeries} from '@amcharts/amcharts5/xy';
import {DataProcessor} from '@amcharts/amcharts5/.internal/core/util/DataProcessor';
import {dateToISOString, Dictionary} from '../util/util';
import {useGetSimulationsQuery} from '../store/services/scenarioApi';
import {color} from '@amcharts/amcharts5/.internal/core/util/Color';
import {AxisRenderer} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRenderer';

const data: Dictionary<Array<number[]>> = {
  home: [
    [0.4413, 0.4504, 1.2383, 0.8033, 0.0494, 0.0017],
    [0.0485, 0.7616, 0.6532, 1.1614, 0.0256, 0.0013],
    [0.18, 0.1795, 0.8806, 0.6413, 0.0429, 0.0032],
    [0.0495, 0.2639, 0.5189, 0.8277, 0.0679, 0.0014],
    [0.0087, 0.0394, 0.1417, 0.3834, 0.7064, 0.0447],
    [0.0292, 0.0648, 0.1248, 0.4179, 0.3497, 0.1544],
  ],
  school: [
    [2.9964, 0.2501, 0.9132, 0.2509, 0.0, 0.0],
    [0.221, 1.9155, 0.2574, 0.2863, 0.007, 0.0],
    [0.0324, 0.3598, 1.2613, 0.1854, 0.0041, 0.0],
    [0.1043, 0.4794, 1.1886, 0.1836, 0.0052, 0.0022],
    [0.0, 0.115, 0.0, 0.0, 0.0168, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  ],
  work: [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0127, 1.757, 1.605, 0.0133, 0.0],
    [0.0, 0.002, 1.0311, 2.3166, 0.0098, 0.0],
    [0.0, 0.0002, 0.0194, 0.0325, 0.0003, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  ],
  other: [
    [0.517, 0.3997, 0.7957, 0.9958, 0.3239, 0.0428],
    [0.0632, 0.9121, 0.3254, 0.4731, 0.2355, 0.0148],
    [0.0336, 0.1604, 1.7529, 0.8622, 0.144, 0.0077],
    [0.0204, 0.1444, 0.5738, 1.2127, 0.3433, 0.0178],
    [0.0371, 0.0393, 0.4171, 0.9666, 0.7495, 0.0257],
    [0.0791, 0.08, 0.348, 0.5588, 0.2769, 0.018],
  ],
};

function average(numbers: Array<number>) {
  const sum = numbers.reduce((a, c) => a + c, 0);
  return sum / numbers.length;
}

export default function ContactMatrix(
  props: Readonly<{
    root: Root | null;
    chart: XYChart | null;
    xAxis: DateAxis<AxisRenderer> | null;
  }>
): JSX.Element {
  const dispatch = useAppDispatch();

  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);

  const {data: scenarioListData} = useGetSimulationsQuery();

  useEffect(
    () => {
      if (!props.chart || !props.root) {
        return;
      }

      // Create y-axis
      props.chart.yAxes.push(
        CategoryAxis.new(props.root, {
          renderer: AxisRendererY.new(props.root, {}),
          // Add tooltip instance so cursor can display value
          tooltip: Tooltip.new(props.root, {}),
          categoryField: 'category',
        })
      );
    },
    // This effect should only run once. dispatch should not change during runtime
    [dispatch, props.chart, props.root]
  );

  const [series, setSeries] = useState<ColumnSeries | null>(null);

  useEffect(() => {
    if (props.root && props.chart) {
      const yAxis = props.chart.yAxes.getIndex(1)!;
      yAxis.data.setAll(Object.keys(data).map((key) => ({category: key})));

      const series = props.chart.series.push(
        ColumnSeries.new(props.root, {
          xAxis: props.chart.xAxes.getIndex(0)!,
          yAxis: props.chart.yAxes.getIndex(1)!,
          openValueXField: 'fromDate',
          valueXField: 'toDate',
          categoryYField: 'category',
          valueField: 'averageContacts',
        })
      );

      series.columns.template.setAll({
        templateField: 'columnSettings',
        strokeOpacity: 0,
        tooltipText: '{category}: {averageContacts}',
      });

      series.data.processor = DataProcessor.new(props.root, {
        dateFields: ['fromDate', 'toDate'],
        dateFormat: 'yyyy-MM-dd',
      });

      series.set('heatRules', [
        {
          target: series.columns.template,
          minValue: 0,
          maxValue: 0.75,
          min: color('#FFFFFF'),
          max: color('#FF0000'),
          dataField: 'value',
          key: 'fill',
        },
      ]);

      setSeries(series);
    }
  }, [props.chart, props.root]);

  // Effect to update min/max date.
  useEffect(() => {
    // Skip if root or chart is not initialized
    if (!props.root || !props.chart || !minDate || !maxDate) {
      return;
    }

    const xAxis: DateAxis<AxisRendererX> = props.chart.xAxes.getIndex(0) as DateAxis<AxisRendererX>;
    xAxis.set('min', new Date(minDate).setHours(0));
    xAxis.set('max', new Date(maxDate).setHours(23, 59, 59));
  }, [minDate, maxDate, props.root, props.chart]);

  const categoryData = useMemo(() => {
    if (!scenarioListData?.results[0]) {
      return [];
    }

    const startDay = new Date(scenarioListData.results[0].startDay);
    startDay.setUTCDate(startDay.getUTCDate() + 1);

    const endDay = new Date(startDay);
    endDay.setDate(endDay.getDate() + scenarioListData.results[0].numberOfDays - 1);

    const minDate = dateToISOString(startDay);
    const maxDate = dateToISOString(endDay);

    const keys = Object.keys(data as object);
    const result = [];

    for (const key of keys) {
      result.push({
        category: key,
        fromDate: minDate,
        toDate: maxDate,
        averageContacts: average(data[key].map((value) => average(value))),
      });
    }

    return result;
  }, [scenarioListData]);

  useEffect(() => {
    if (series) {
      series.data.setAll(categoryData);
    }
  }, [categoryData, props.chart, series]);

  return <></>;
}
