import reducer, {selectDistrict, selectDate, selectScenario, selectCompartment} from '../../store/DataSelectionSlice';

describe('DataSelectionSlice', () => {
  const initialState = {
    district: {ags: '00000', name: 'germany', type: ''},
    date: '2021-01-01',
    scenario: 0,
    compartment: '',
  };

  test('Initial State', () => {
    expect(reducer(undefined, {type: null})).toEqual(initialState);
  });

  test('Select District', () => {
    const newDistrict = {ags: '12345', name: 'Test District', type: 'Test Type'};
    expect(reducer(initialState, selectDistrict(newDistrict))).toEqual({
      district: {ags: '12345', name: 'Test District', type: 'Test Type'},
      date: '2021-01-01',
      scenario: 0,
      compartment: '',
    });
  });

  test('Select Date', () => {
    const newDate = '2020-09-21';
    expect(reducer(initialState, selectDate(newDate))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: '2020-09-21',
      scenario: 0,
      compartment: '',
    });
  });

  test('Select Scenario', () => {
    expect(reducer(initialState, selectScenario(1))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: '2021-01-01',
      scenario: 1,
      compartment: '',
    });
  });

  test('Select Compartment', () => {
    expect(reducer(initialState, selectCompartment('Test Compartment'))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: '2021-01-01',
      scenario: 0,
      compartment: 'Test Compartment',
    });
  });
});
