import {useMemo} from 'react';
import {NumberFormatter} from 'util/hooks';
import {useTranslation} from 'react-i18next';

export const useCompartmentLocalization = () => {
  const {i18n} = useTranslation();
  const {formatNumber} = NumberFormatter(i18n.language, 1, 0);
  return useMemo(
    () => ({
      formatNumber: formatNumber,
      customLang: 'backend',
      overrides: {
        ['compartments.Infected']: 'infection-states.Infected',
        ['compartments.MildInfections']: 'infection-states.MildInfections',
        ['compartments.Hospitalized']: 'infection-states.Hospitalized',
        ['compartments.ICU']: 'infection-states.ICU',
        ['compartments.Dead']: 'infection-states.Dead',
        ['compartments.DeadV1']: 'infection-states.DeadV1',
        ['compartments.DeadV2']: 'infection-states.DeadV2',
        ['compartments.Exposed']: 'infection-states.Exposed',
        ['compartments.Recovered']: 'infection-states.Recovered',
        ['compartments.Carrier']: 'infection-states.Carrier',
        ['compartments.Susceptible']: 'infection-states.Susceptible',
        ['compartments.InfectedT']: 'infection-states.InfectedT',
        ['compartments.InfectedTV1']: 'infection-states.InfectedTV1',
        ['compartments.InfectedTV2']: 'infection-states.InfectedTV2',
        ['compartments.InfectedV1']: 'infection-states.InfectedV1',
        ['compartments.InfectedV2']: 'infection-states.InfectedV2',
        ['compartments.HospitalizedV1']: 'infection-states.HospitalizedV1',
        ['compartments.HospitalizedV2']: 'infection-states.HospitalizedV2',
        ['compartments.ICUV1']: 'infection-states.ICUV1',
        ['compartments.ICUV2']: 'infection-states.ICUV2',
        ['compartments.ExposedV1']: 'infection-states.ExposedV1',
        ['compartments.ExposedV2']: 'infection-states.ExposedV2',
        ['compartments.CarrierT']: 'infection-states.CarrierT',
        ['compartments.CarrierTV1']: 'infection-states.CarrierTV1',
        ['compartments.CarrierTV2']: 'infection-states.CarrierTV2',
        ['compartments.CarrierV1']: 'infection-states.CarrierV1',
        ['compartments.CarrierV2']: 'infection-states.CarrierV2',
        ['compartments.SusceptibleV1']: 'infection-states.SusceptibleV1',
        ['compartments.SusceptibleV2']: 'infection-states.SusceptibleV2',
      },
    }),
    [formatNumber]
  );
};
