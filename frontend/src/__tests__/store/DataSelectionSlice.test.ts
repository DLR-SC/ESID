import reducer, {
  addFilter,
  selectCompartment,
  selectDate,
  selectDistrict,
  selectScenario,
  toggleScenario,
} from '../../store/DataSelectionSlice';

describe('DataSelectionSlice', () => {
  const initialState = {
    district: {ags: '00000', name: 'germany', type: ''},
    date: null,
    scenario: null,
    compartment: null,
    activeScenarios: null,
    minDate: null,
    maxDate: null,
    filter: null,
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
      activeScenarios: null,
      minDate: null,
      maxDate: null,
      filter: null,
    });
  });

  test('Select Date', () => {
    const newDate = '2020-09-21';
    expect(reducer(initialState, selectDate(newDate))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: '2020-09-21',
      scenario: null,
      compartment: null,
      activeScenarios: null,
      minDate: null,
      maxDate: null,
      filter: null,
    });
  });

  test('Select Scenario', () => {
    expect(reducer(initialState, selectScenario(1))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: 1,
      compartment: null,
      activeScenarios: null,
      minDate: null,
      maxDate: null,
      filter: null,
    });
  });

  test('Select Compartment', () => {
    expect(reducer(initialState, selectCompartment('Test Compartment'))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: null,
      compartment: 'Test Compartment',
      activeScenarios: null,
      minDate: null,
      maxDate: null,
      filter: null,
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
      filter: null,
    });

    const state = {
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: null,
      compartment: null,
      activeScenarios: [1, 2, 4],
      minDate: null,
      maxDate: null,
      filter: null,
    };

    expect(reducer(state, toggleScenario(2))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: null,
      compartment: null,
      activeScenarios: [1, 4],
      minDate: null,
      maxDate: null,
      filter: null,
    });
  });

  test('addFilter', () => {
    const newFilter = {
      name: 'Test Group',
      groups: {age: ['age_1', 'age_2'], gender: ['male', 'female']},
      toggle: false,
    };
    expect(reducer(initialState, addFilter(newFilter))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: null,
      scenario: null,
      compartment: null,
      activeScenarios: null,
      minDate: null,
      maxDate: null,
      filter: [newFilter],
    });
  });
});
