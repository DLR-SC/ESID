/*
 * Temporary mapping to get filter tags from compartment until this is moved to new backend.
 */

/** Enums for the different states in the infection model/chain (value is localization string) */
export const enum InfectionTags {
  Susceptible   = 'compartments.i.sus',
  Exposed       = 'compartments.i.exp',
  Carrier       = 'compartments.i.car',
  Infected      = 'compartments.i.inf',
  Hospitalized  = 'compartments.i.hos',
  ICU           = 'compartments.i.icu',
  Recovered     = 'compartments.i.rec',
  Dead          = 'compartments.i.ded',
}

/** Old Enums for the amount of vaccinations (value is localization sting) */
export const enum VaccinationTags_OLD {
  V1 = 'compartments.v.v1',
  V2 = 'compartments.v.v2',
}

/** Enums for the grade of vaccination */
export const enum VaccinationTags {
  Naive             = 'compartments.v.nai',
  PartialImmunity   = 'compartments.v.par',
  ImprovedImmunity  = 'compartments.v.imp',
}

/** Enums if the data has be confirmed by a positive test */
export const enum ConfirmedTags {
  Confirmed = 'compartments.t.tru',
}

interface CompartmentMapping {
  [compartmentName: string]: Array<InfectionTags|VaccinationTags_OLD|VaccinationTags|ConfirmedTags>,
}

export const compartmentMapping: CompartmentMapping = {
  // old compartments
  "Carrier": [
    InfectionTags.Carrier,
  ],
  "CarrierT": [
    InfectionTags.Carrier,
    ConfirmedTags.Confirmed,
  ],
  "CarrierTV1": [
    InfectionTags.Carrier,
    ConfirmedTags.Confirmed,
    VaccinationTags_OLD.V1,
  ],
  "CarrierTV2": [
    InfectionTags.Carrier,
    ConfirmedTags.Confirmed,
    VaccinationTags_OLD.V2,
  ],
  "CarrierV1": [
    InfectionTags.Carrier,
    VaccinationTags_OLD.V1,
  ],
  "CarrierV2": [
    InfectionTags.Carrier,
    VaccinationTags_OLD.V2,
  ],
  "Exposed": [
    InfectionTags.Exposed,
  ],
  "ExposedV1": [
    InfectionTags.Exposed,
    VaccinationTags_OLD.V1,
  ],
  "ExposedV2": [
    InfectionTags.Exposed,
    VaccinationTags_OLD.V2,
  ],
  "Hospitalized": [
    InfectionTags.Hospitalized,
  ],
  "HospitalizedV1": [
    InfectionTags.Hospitalized,
    VaccinationTags_OLD.V1,
  ],
  "HospitalizedV2": [
    InfectionTags.Hospitalized,
    VaccinationTags_OLD.V2,
  ],
  "ICU": [
    InfectionTags.ICU,
  ],
  "ICUV1": [
    InfectionTags.ICU,
    VaccinationTags_OLD.V1,
  ],
  "ICUV2": [
    InfectionTags.ICU,
    VaccinationTags_OLD.V2,
  ],
  "Infected": [
    InfectionTags.Infected,
  ],
  "InfectedT": [
    InfectionTags.Infected,
    ConfirmedTags.Confirmed
  ],
  "InfectedTV1": [
    InfectionTags.Infected,
    ConfirmedTags.Confirmed,
    VaccinationTags_OLD.V1,
  ],
  "InfectedTV2": [
    InfectionTags.Infected,
    ConfirmedTags.Confirmed,
    VaccinationTags_OLD.V2,
  ],
  "InfectedV1": [
    InfectionTags.Infected,
    VaccinationTags_OLD.V1,
  ],
  "InfectedV2": [
    InfectionTags.Infected,
    VaccinationTags_OLD.V2,
  ],
  "Susceptible": [
    InfectionTags.Susceptible,
  ],
  "SusceptibleV1": [
    InfectionTags.Susceptible,
    VaccinationTags_OLD.V1,
  ],
  // new compartments
  "CarrierImprovedImmunity": [
    InfectionTags.Carrier,
    VaccinationTags.ImprovedImmunity,
  ],
  "CarrierImprovedImmunityConfirmed": [
    InfectionTags.Carrier,
    VaccinationTags.ImprovedImmunity,
    ConfirmedTags.Confirmed,
  ],
  "CarrierNaive": [
    InfectionTags.Carrier,
    VaccinationTags.Naive
  ],
  "CarrierNaiveConfirmed": [
    InfectionTags.Carrier,
    VaccinationTags.Naive,
    ConfirmedTags.Confirmed,
  ],
  "CarrierPartialImmunity": [
    InfectionTags.Carrier,
    VaccinationTags.PartialImmunity,
  ],
  "CarrierPartialImmunityConfirmed": [
    InfectionTags.Carrier,
    VaccinationTags.PartialImmunity,
    ConfirmedTags.Confirmed,
  ],
  "Dead": [
    InfectionTags.Dead,
  ],
  "ExposedImprovedImmunity": [
    InfectionTags.Exposed,
    VaccinationTags.ImprovedImmunity,
  ],
  "ExposedNaive": [
    InfectionTags.Exposed,
    VaccinationTags.Naive,
  ],
  "ExposedPartialImmunity": [
    InfectionTags.Exposed,
    VaccinationTags.PartialImmunity,
  ],
  "HospitalizedImprovedImmunity": [
    InfectionTags.Hospitalized,
    VaccinationTags.ImprovedImmunity,
  ],
  "HospitalizedNaive": [
    InfectionTags.Hospitalized,
    VaccinationTags.Naive,
  ],
  "HospitalizedPartialImmunity": [
    InfectionTags.Hospitalized,
    VaccinationTags.PartialImmunity,
  ],
  "ICUImprovedImmunity": [
    InfectionTags.ICU,
    VaccinationTags.ImprovedImmunity,
  ],
  "ICUNaive": [
    InfectionTags.ICU,
    VaccinationTags.Naive,
  ],
  "ICUPartialImmunity": [
    InfectionTags.ICU,
    VaccinationTags.PartialImmunity,
  ],
  "InfectedConfirmed": [
    InfectionTags.Infected,
    ConfirmedTags.Confirmed,
  ],
  "InfectedImprovedImmunity": [
    InfectionTags.Infected,
    VaccinationTags.ImprovedImmunity,
  ],
  "InfectedImprovedImmunityConfirmed": [
    InfectionTags.Infected,
    VaccinationTags.ImprovedImmunity,
    ConfirmedTags.Confirmed,
  ],
  "InfectedNaive": [
    InfectionTags.Infected,
    VaccinationTags.Naive,
  ],
  "InfectedPartialImmunity": [
    InfectionTags.Infected,
    VaccinationTags.PartialImmunity,
  ],
  "InfectedPartialImmunityConfirmed": [
    InfectionTags.Infected,
    VaccinationTags.PartialImmunity,
    ConfirmedTags.Confirmed,
  ],
  "Recovered": [
    InfectionTags.Recovered,
  ],
  "SusceptibleNaive": [
    InfectionTags.Susceptible,
    VaccinationTags.Naive,
  ],
  "SusceptiblePartialImmunity": [
    InfectionTags.Susceptible,
    VaccinationTags.PartialImmunity,
  ]
}
