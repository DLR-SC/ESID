// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useAppDispatch} from '../../../store/hooks';
import {useCallback, useLayoutEffect} from 'react';
import {ISpritePointerEvent} from '@amcharts/amcharts5';
import {XYChart} from '@amcharts/amcharts5/.internal/charts/xy/XYChart';
import {selectDate} from '../../../store/DataSelectionSlice';
import {dateToISOString} from '../../../util/util';
import {DateAxis} from '@amcharts/amcharts5/.internal/charts/xy/axes/DateAxis';
import {AxisRenderer} from '@amcharts/amcharts5/.internal/charts/xy/axes/AxisRenderer';

export function useDateSelectorFilter(chart: XYChart | null, xAxis: DateAxis<AxisRenderer> | null) {
  const dispatch = useAppDispatch();

  const setDateCallback = useCallback(
    (ev: ISpritePointerEvent & {type: 'click'; target: XYChart}) => {
      // Get date from axis position from cursor position
      const date = xAxis?.positionToDate(
        xAxis.toAxisPosition(ev.target.get('cursor')?.getPrivate('positionX') as number)
      );

      if (date) {
        // Remove time information to only have a date
        date.setHours(0, 0, 0, 0);
        // Set date in store
        dispatch(selectDate(dateToISOString(date)));
      }
    },
    [dispatch, xAxis]
  );

  useLayoutEffect(() => {
    if (!chart) {
      return;
    }

    const event = chart.events.on('click', setDateCallback);

    return () => {
      event.dispose();
    };
  }, [chart, setDateCallback]);
}
