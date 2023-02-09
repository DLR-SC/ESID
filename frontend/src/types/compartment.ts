import {Dictionary} from 'util/util';



export interface CompartmentFilter {
    id: string;
    name: string;
    toggle: boolean;
    compartments: Array<{selection: [string, any][]}>;
  }
  