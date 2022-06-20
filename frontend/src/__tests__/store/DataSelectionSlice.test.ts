import reducer, {
  selectDistrict,
  selectDate,
  selectScenario,
  selectCompartment,
  toggleScenario,
} from '../../store/DataSelectionSlice';

describe('DataSelectionSlice', () => {
  const initialState = {
    district: {ags: '00000', name: 'germany', type: ''},
    date: null,
    scenario: null,
    compartment: null,
    activeScenarios: [],
    minDate: null,
    maxDate: null,
  };

  test('Initial State', () => {
    expect(reducer(undefined, {type: null})).toEqual(initialState);
  });

  test('Select District', () => {
    const newDistrict = {ags: '12345', name: 'Test District', type: 'Test Type'};
    expect(reducer(initialState, selectDistrict(newDistrict))).toEqual({
      district: {ags: '12345', name: 'Test District', type: 'Test Type'},
      date: null,
      scenario: null,
      compartment: null,
      activeScenarios: [],
      minDate: null,
      maxDate: null,
    });
  });

  test('Select Date', () => {
    const newDate = '2020-09-21';
    expect(reducer(initialState, selectDate(newDate))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: '2020-09-21',
      scenario: null,
      compartment: null,
      activeScenarios: [],
      minDate: null,
      maxDate: null,
    });
  });

  test('Select Scenario', () => {
    expect(reducer(initialState, selectScenario(1))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: 1,
      compartment: null,
      activeScenarios: [],
      minDate: null,
      maxDate: null,
    });
  });

  test('Select Compartment', () => {
    expect(reducer(initialState, selectCompartment('Test Compartment'))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: null,
      compartment: 'Test Compartment',
      activeScenarios: [],
      minDate: null,
      maxDate: null,
    });
  });

  test('Toggle Scenario', () => {
    expect(reducer(initialState, toggleScenario(2))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: null,
      compartment: null,
      activeScenarios: [2],
      minDate: null,
      maxDate: null,
    });
    const state = {
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: null,
      compartment: null,
      activeScenarios: [1, 2, 4],
      minDate: null,
      maxDate: null,
    };

    expect(reducer(state, toggleScenario(2))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: null,
      compartment: null,
      activeScenarios: [1, 4],
      minDate: null,
      maxDate: null,
    });
  });
});
