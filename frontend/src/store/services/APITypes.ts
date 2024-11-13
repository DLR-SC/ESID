// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

// Common
type Identifiable = {id: string};

// Groups
export type Groups = Array<string>;
export type CreateGroup = {
  name: string;
  description?: string;
  category: string;
};

export type Group = CreateGroup & Identifiable;

// Interventions
export type Interventions = Array<string>;
export type CreateIntervention = {
  name: string;
  description?: string;
};
export type Intervention = CreateIntervention & Identifiable;

// Models
export type Models = Array<string>;
export type CreateModel = {
  name: string;
  description?: string;
  aggregations?: Array<Array<string>>;
  compartments: Array<Compartment>;
  groups: Groups;
  parameterDefinitions: ParameterDefinitions;
};
export type Model = CreateModel & Identifiable;
export type Compartment = {
  name: string;
  description?: string;
  tags: Array<string>;
};

// Movements
// TODO

// Nodes
export type Nodes = Array<string>;
export type CreateNode = {
  NUTS: string;
  name?: string;
};
export type Node = CreateNode & Identifiable;

export type NodeLists = Array<string>;
export type CreateNodeList = {
  name: string;
  description?: string;
  nodeIds: Nodes;
};
export type NodeList = CreateNodeList & Identifiable;

// Parameter
export type ParameterDefinitions = Array<string>;
export type CreateParameterDefinition = {
  name: string;
  description?: string;
};
export type ParameterDefinition = CreateParameterDefinition & Identifiable;



// Scenarios
export type Scenarios = Array<string>;
export type CreateScenario = {
  name: string;
  description?: string;
  modelId: string;
  modelParameters: object; // TODO
  nodeListId: string;
  linkedInterventions: Interventions;
};

// Aggregations

