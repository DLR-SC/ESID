// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import LineChart from 'components/LineChartComponents/LineChart';
import React, {useCallback, useMemo} from 'react';
import {render, screen} from '@testing-library/react';
import {describe, test, expect, vi} from 'vitest';
import {ResizeObserverMock} from '__tests__/mocks/resize';
import {I18nextProvider} from 'react-i18next';
import i18n from '../../util/i18nForTests';

const LineChartTest = () => {
  const localization = useMemo(() => {
    return {
      customLang: 'backend',
      overrides: {
        'compartment.Infected': 'infection-states.Infected',
      },
    };
  }, []);
  const simulationDataChartName = useCallback(() => 'scenario-names', []);
  const caseData = useMemo(() => {
    return [
      {
        day: '2021-04-01',
        value: 3723.5826785713944,
      },
      {
        day: '2021-04-02',
        value: 3688.2426285714214,
      },
    ];
  }, []);
  return (
    <div data-testid='chartdiv'>
      <LineChart
        selectedDate={'2020-02-20'}
        setSelectedDate={() => {}}
        setReferenceDayBottom={() => {}}
        simulationDataChartName={simulationDataChartName}
        minDate={'2020-02-20'}
        maxDate={'2020-02-20'}
        selectedScenario={0}
        referenceDay={'2020-02-20'}
        selectedCompartment={'Infected'}
        localization={localization}
        caseData={caseData}
      />
    </div>
  );
};
describe('LineChart', () => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  test('renders LineChart', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LineChartTest />
      </I18nextProvider>
    );

    expect(screen.getByTestId('chartdiv')).toBeInTheDocument();
  });
});
