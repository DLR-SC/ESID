import {renderHook} from '@testing-library/react-hooks';
import {NumberFormatter} from '../../util/hooks';

describe('NumberFormatter', () => {
  test('languages', () => {
    let lang = 'de';
    const {result, rerender} = renderHook(() => NumberFormatter(lang, 5, 2));

    const germanFormat = result.current.formatNumber(2000.1);
    expect(germanFormat).toBe('2.000,1');

    lang = 'en';
    rerender();

    const englishFormat = result.current.formatNumber(2000.1);
    expect(englishFormat).toBe('2,000.1');
  });
});
