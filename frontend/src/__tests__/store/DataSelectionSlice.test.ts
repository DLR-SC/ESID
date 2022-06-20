import reducer, { selectDistrict, selectDate, selectScenario, selectCompartment, addGroup, group } from '../../store/DataSelectionSlice';

describe('DataSelectionSlice', () => {
  const initialState = {
    district: { ags: '00000', name: 'germany', type: '' },
    date: null,
    scenario: null,
    compartment: null,
    minDate: null,
    maxDate: null,
    groups: null,
  };

  test('Initial State', () => {
    expect(reducer(undefined, { type: null })).toEqual(initialState);
  });

  test('Select District', () => {
    const newDistrict = { ags: '12345', name: 'Test District', type: 'Test Type' };
    expect(reducer(initialState, selectDistrict(newDistrict))).toEqual({
      district: { ags: '12345', name: 'Test District', type: 'Test Type' },
      date: null,
      scenario: null,
      compartment: null,
      minDate: null,
      maxDate: null,
      groups: null,
    });
  });

  test('Select Date', () => {
    const newDate = '2020-09-21';
    expect(reducer(initialState, selectDate(newDate))).toEqual({
      district: { ags: '00000', name: 'germany', type: '' },
      date: '2020-09-21',
      scenario: null,
      compartment: null,
      minDate: null,
      maxDate: null,
      groups: null,
    });
  });

  test('Select Scenario', () => {
    expect(reducer(initialState, selectScenario(1))).toEqual({
      district: { ags: '00000', name: 'germany', type: '' },
      date: null,
      scenario: 1,
      compartment: null,
      minDate: null,
      maxDate: null,
      groups: null,
    });
  });

  test('Select Compartment', () => {
    expect(reducer(initialState, selectCompartment('Test Compartment'))).toEqual({
      district: { ags: '00000', name: 'germany', type: '' },
      date: null,
      scenario: null,
      compartment: 'Test Compartment',
      minDate: null,
      maxDate: null,
      groups: null,
    });
  });

  test('addGroup', () => {
    const newGroup = { name: "Test Group", age: ["10-20", "20-30"], gender: ["Männlich"], toggle: false, testData: 1.2 };
    expect(reducer(initialState, addGroup(newGroup))).toEqual({
      district: { ags: '00000', name: 'germany', type: '' },
      date: null,
      scenario: null,
      compartment: null,
      minDate: null,
      maxDate: null,
      groups: Array<group>().push(newGroup),
    });
  });
});
