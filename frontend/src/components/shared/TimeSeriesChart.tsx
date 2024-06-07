// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {IXYChartSettings, XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {DateAxis, IDateAxisSettings} from '@amcharts/amcharts5/.internal/charts/xy/axes/DateAxis';
import {AxisRenderer} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRenderer';
import {darken, useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import useRoot from './chart/Root';
import {useConst} from '../../util/hooks';
import useXYChart from './chart/Chart';
import {useCallback, useLayoutEffect, useMemo} from 'react';
import {AxisRendererX} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRendererX';
import {Tooltip} from '@amcharts/amcharts5/.internal/core/render/Tooltip';
import useDateAxis from './chart/DateAxis';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import am5locales_de_DE from '@amcharts/amcharts5/locales/de_DE';
import am5locales_en_US from '@amcharts/amcharts5/locales/en_US';
import {useDateSelectorFilter} from './chart/Filter';
import {XYCursor} from '@amcharts/amcharts5/.internal/charts/xy/XYCursor';
import {color} from '@amcharts/amcharts5/.internal/core/util/Color';
import {RoundedRectangle} from '@amcharts/amcharts5/.internal/core/render/RoundedRectangle';
import useDateAxisRange from './chart/AxisRange';
import {setReferenceDayBottom} from '../../store/LayoutSlice';

export default function useTimeSeriesChart(parent: string): Readonly<{
  root: Root | null;
  chart: XYChart | null;
  xAxis: DateAxis<AxisRenderer> | null;
}> {
  const theme = useTheme();
  const {t, i18n} = useTranslation();
  const dispatch = useAppDispatch();

  const root = useRoot(
    parent,
    undefined,
    useConst((root) => {
      root.numberFormatter.set('numberFormat', '#,###.');
    })
  );

  const chartSettings = useConst<IXYChartSettings>({
    panX: false,
    panY: false,
    wheelX: 'panX',
    wheelY: 'zoomX',
    maxTooltipDistance: -1,
  });
  const chart = useXYChart(
    root,
    chartSettings,
    useCallback(
      (chart: XYChart) => {
        if (root) {
          chart.leftAxesContainer.set('layout', root.verticalLayout);
        }
      },
      [root]
    )
  );

  const xAxisSettings = useMemo(() => {
    if (!root || !chart) {
      return null;
    }

    return {
      renderer: AxisRendererX.new(root, {}),
      // Set base interval and aggregated intervals when the chart is zoomed out
      baseInterval: {timeUnit: 'day', count: 1},
      gridIntervals: [
        {timeUnit: 'day', count: 1},
        {timeUnit: 'day', count: 3},
        {timeUnit: 'day', count: 7},
        {timeUnit: 'month', count: 1},
        {timeUnit: 'month', count: 3},
        {timeUnit: 'year', count: 1},
      ],
      // Add tooltip instance so cursor can display value
      tooltip: Tooltip.new(root, {}),
    } as IDateAxisSettings<AxisRendererX>;
  }, [root, chart]);

  const xAxis = useDateAxis(
    root,
    chart,
    xAxisSettings,
    useConst((axis) => {
      axis.get('renderer').ticks.template.setAll({location: 0.5});
    })
  );

  const minDate = useAppSelector((state) => state.dataSelection.minDate);
  const maxDate = useAppSelector((state) => state.dataSelection.maxDate);
  // Effect to change localization of chart if language changes
  useLayoutEffect(
    () => {
      // Skip if root or chart is not initialized
      if (!root || !chart || !xAxis) {
        return;
      }

      // Set localization
      root.locale = i18n.language === 'de' ? am5locales_de_DE : am5locales_en_US;

      // Change date formats for ticks & tooltip (use fallback object to suppress undefined object warnings as this cannot be undefined)
      xAxis.get('dateFormats', {day: ''})['day'] = t('dayFormat');
      xAxis.get('tooltipDateFormats', {day: ''})['day'] = t('dayFormat');
      // Fix first date of the month falling back to wrong format (also with fallback object)
      xAxis.get('periodChangeDateFormats', {day: ''})['day'] = t('dayFormat');
    },
    // Re-run effect if language changes
    [i18n.language, chart, root, xAxis, t]
  );

  // Effect to update min/max date.
  useLayoutEffect(() => {
    if (!xAxis || !minDate || !maxDate) {
      return;
    }

    xAxis.set('min', new Date(minDate).setHours(0));
    xAxis.set('max', new Date(maxDate).setHours(23, 59, 59));
  }, [minDate, maxDate, xAxis]);

  useDateSelectorFilter(chart, xAxis);

  useLayoutEffect(() => {
    if (!chart || !root || !xAxis) {
      return;
    }

    // Add cursor
    chart.set(
      'cursor',
      XYCursor.new(root, {
        // Only allow zooming along x-axis
        behavior: 'zoomX',
        // Snap cursor to xAxis ticks
        xAxis: xAxis,
      })
    );
  }, [chart, root, xAxis]);

  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const selectedDateRangeSettings = useMemo(() => {
    if (!root || !selectedDate) {
      return {};
    }

    return {
      data: {
        value: new Date(selectedDate).setHours(0, 0, 0),
        endValue: new Date(selectedDate).setHours(23, 59, 59),
        above: true,
      },
      grid: {
        stroke: color(theme.palette.primary.main),
        strokeOpacity: 1,
        strokeWidth: 2,
        location: 0.5,
        visible: true,
      },
      axisFill: {
        fill: color(theme.palette.primary.main),
        fillOpacity: 0.3,
        visible: true,
      },
      label: {
        fill: color(theme.palette.primary.contrastText),
        text: new Date(selectedDate).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        }),
        location: 0.5,
        background: RoundedRectangle.new(root, {
          fill: color(theme.palette.primary.main),
        }),
        // Put Label to the topmost layer to make sure it is drawn on top of the axis tick labels
        layer: Number.MAX_VALUE,
      },
    };
  }, [i18n.language, root, selectedDate, theme.palette.primary.contrastText, theme.palette.primary.main]);
  useDateAxisRange(selectedDateRangeSettings, root, chart, xAxis);

  const referenceDay = useAppSelector((state) => state.dataSelection.simulationStart);
  const referenceDateRangeSettings = useMemo(() => {
    if (!referenceDay) {
      return {};
    }

    return {
      data: {
        value: new Date(referenceDay).setHours(12, 0, 0),
        above: true,
      },
      grid: {
        stroke: color(darken(theme.palette.divider, 0.25)),
        strokeOpacity: 1,
        strokeWidth: 2,
        strokeDasharray: [6, 4],
      },
    };
  }, [referenceDay, theme.palette.divider]);
  useDateAxisRange(referenceDateRangeSettings, root, chart, xAxis);

  const setReferenceDayX = useCallback(() => {
    if (!chart || !root || !xAxis || !referenceDay) {
      return;
    }

    const midday = new Date(referenceDay).setHours(12, 0, 0);

    const xAxisPosition = xAxis.width() * xAxis.toGlobalPosition(xAxis.dateToPosition(new Date(midday)));
    const globalPosition = xAxis.toGlobal({x: xAxisPosition, y: 0});
    const docPosition = root.rootPointToDocument(globalPosition).x;
    dispatch(setReferenceDayBottom(docPosition));
  }, [dispatch, chart, root, xAxis, referenceDay]);

  useLayoutEffect(() => {
    if (!root || !chart || !xAxis) {
      return;
    }

    setReferenceDayX();
    const minEvent = xAxis.onPrivate('selectionMin', setReferenceDayX);
    const maxEvent = xAxis.onPrivate('selectionMax', setReferenceDayX);
    const seriesEvent = chart.series.events.on('push', (ev) => {
      ev.newValue.events.on('boundschanged', setReferenceDayX);
    });

    const resizeObserver = new ResizeObserver(setReferenceDayX);
    resizeObserver.observe(root.dom);

    return () => {
      resizeObserver.disconnect();
      minEvent.dispose();
      maxEvent.dispose();
      seriesEvent.dispose();
    };
  }, [root, chart, xAxis, setReferenceDayX]);

  return useMemo(
    () => ({
      root,
      chart,
      xAxis,
    }),
    [root, chart, xAxis]
  );
}
