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
    expect(reducer(initialState, selectDistrict(newDistrict))).toEqual(
      Object.assign(initialState, {district: newDistrict})
    );
  });

  test('Select Date', () => {
    const newDate = '2020-09-21';
    expect(reducer(initialState, selectDate(newDate))).toEqual(Object.assign(initialState, {date: newDate}));
  });

  test('Select Scenario', () => {
    const scenario = 1;
    expect(reducer(initialState, selectScenario(scenario))).toEqual(Object.assign(initialState, {scenario: scenario}));
  });

  test('Select Compartment', () => {
    const compartment = 'Test Compartment';
    expect(reducer(initialState, selectCompartment(compartment))).toEqual(
      Object.assign(initialState, {compartment: compartment})
    );
  });

  test('Toggle Scenario', () => {
    const scenario = 2;
    expect(reducer(initialState, toggleScenario(scenario))).toEqual(
      Object.assign(initialState, {activeScenarios: [2]})
    );

    const state = Object.assign(initialState, {
      activeScenarios: [1, 2, 4],
    });

    expect(reducer(state, toggleScenario(2))).toEqual(Object.assign(initialState, {activeScenarios: [1, 4]}));
  });

  test('addFilter', () => {
    const newFilter = {
      name: 'Test Group',
      groups: {age: ['age_1', 'age_2'], gender: ['male', 'female']},
      toggle: false,
    };
    expect(reducer(initialState, addFilter(newFilter))).toEqual(Object.assign(initialState, {filter: [newFilter]}));
  });
});
