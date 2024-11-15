// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

// Common -----------------------------------------------------------------------------------------

type Identifiable = {id: string};

// Scenarios --------------------------------------------------------------------------------------

export type Scenarios = Array<ScenarioPreview>;

export type NewScenario = {
  name: string;
  description?: string;
  modelId: string;
  modelParameters: Array<ParameterValue>;
  nodeListId: string;
  linkedInterventions: Array<InterventionImplementation>;
};

export type Scenario = Required<NewScenario> &
  Identifiable & {
    timestampSubmitted: string;
    timestampSimulated: string;
  };

export type ScenarioPreview = Pick<Scenario, 'id' | 'name' | 'description'>;

export type InfectionDataParameters = {
  path: {
    scenarioId: string;
  };
  query: {
    nodes?: Array<string>;
    startDate?: string;
    endDate?: string;
    compartments?: Array<string>;
    aggregations?: Record<string, Array<string>>;
    groups?: Array<string>;
    percentiles?: Array<string>;
  };
};

export type InfectionData = Array<InfectionDataEntry>;

export type InfectionDataEntry = {
  date?: string;
  node?: string;
  group?: string;
  compartment?: string;
  aggregation?: string;
  values: Record<string, number>;
};

// Interventions ----------------------------------------------------------------------------------

export type InterventionTemplates = Array<InterventionTemplates>;

export type NewInterventionTemplate = {
  name: string;
  description?: string;
  tags: Array<string>;
};

export type InterventionTemplate = Required<NewInterventionTemplate> & Identifiable;

export type InterventionImplementation = {
  interventionId: string;
  startDate: string;
  endDate: string;
  coefficient: number;
};

// Models -----------------------------------------------------------------------------------------

export type Models = Array<ModelPreview>;

export type NewModel = {
  name: string;
  description?: string;
  compartments: Array<string>;
  groups: Array<string>;
  parameterDefinitions: Array<string>;
};

export type Model = Required<NewModel> & Identifiable;

export type ModelPreview = Pick<Model, 'id' | 'name' | 'description'>;

// Compartments -----------------------------------------------------------------------------------

export type Compartments = Array<Compartment>;

export type NewCompartment = {
  name: string;
  description?: string;
  tags: Array<string>;
};

export type Compartment = Required<NewCompartment> & Identifiable;

// Nodes ------------------------------------------------------------------------------------------

export type Nodes = Array<Node>;

export type NewNode = {
  nuts: string;
  name: string;
};

export type Node = Required<NewNode> & Identifiable;

export type NodeLists = Array<NodeListPreview>;

export type NewNodeList = {
  name: string;
  description?: string;
  nodeIds: Nodes;
};

export type NodeList = Required<NewNodeList> & Identifiable;

export type NodeListPreview = Pick<NodeList, 'id' | 'name' | 'description'>;

// Movements --------------------------------------------------------------------------------------

// TODO

// Groups -----------------------------------------------------------------------------------------

export type Groups = Array<Group>;

export type NewGroup = {
  name: string;
  description?: string;
  category: string;
};

export type Group = Required<NewGroup> & Identifiable;

// Group Categories -------------------------------------------------------------------------------

// TODO

// Parameter --------------------------------------------------------------------------------------

export type ParameterDefinitions = Array<ParameterDefinition>;

export type NewParameterDefinition = {
  name: string;
  description?: string;
};

export type ParameterDefinition = Required<NewParameterDefinition> & Identifiable;

export type ParameterValue = {
  parameterId: string;
  values: Array<ParameterValueRange>;
};

export type ParameterValueRange = {
  groupId: string;
  valueMin: number;
  valueMax: number;
};
