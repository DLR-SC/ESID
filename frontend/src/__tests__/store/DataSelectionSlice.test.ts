import reducer, {selectDistrict, selectDate, selectScenario, selectCompartment} from '../../store/DataSelectionSlice';

describe('DataSelectionSlice', () => {
  const initialState = {
    district: {ags: '00000', name: 'germany', type: ''},
    date: new Date(2021, 0).getTime(),
    scenario: 'default',
    compartment: 'infected',
    value: 0,
    rate: 0,
  };

  test('Initial State', () => {
    expect(reducer(undefined, {type: null})).toEqual(initialState);
  });

  test('Select District', () => {
    const newDistrict = {ags: '12345', name: 'Test District', type: 'Test Type'};
    expect(reducer(initialState, selectDistrict(newDistrict))).toEqual({
      district: {ags: '12345', name: 'Test District', type: 'Test Type'},
      date: new Date(2021, 0).getTime(),
      scenario: 'default',
      compartment: 'infected',
      value: 0,
      rate: 0,
    });
  });

  test('Select Date', () => {
    const newDate = new Date(2020, 8, 21);
    expect(reducer(initialState, selectDate(newDate))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: new Date(2020, 8, 21).getTime(),
      scenario: 'default',
      compartment: 'infected',
      value: 0,
      rate: 0,
    });

    expect(reducer(initialState, selectDate(2000000000))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: 2000000000,
      scenario: 'default',
      compartment: 'infected',
      value: 0,
      rate: 0,
    });
  });

  test('Select Scenario', () => {
    expect(reducer(initialState, selectScenario('Test Scenario'))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: new Date(2021, 0).getTime(),
      scenario: 'Test Scenario',
      compartment: 'infected',
      value: 0,
      rate: 0,
    });
  });

  test('Select Compartment', () => {
    expect(reducer(initialState, selectCompartment('Test Compartment'))).toEqual({
      district: {ags: '00000', name: 'germany', type: ''},
      date: new Date(2021, 0).getTime(),
      scenario: 'default',
      compartment: 'Test Compartment',
      value: 0,
      rate: 0,
    });
  });
});
