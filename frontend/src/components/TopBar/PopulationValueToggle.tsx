import React from 'react';
import { RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { PopulationValueModeType } from 'types/populationValueMode';
import { setPopulationValueMode } from 'store/UserPreferenceSlice';

export default function PopulationValueToggle(): JSX.Element {
  const valueMode = useAppSelector((state) => state.userPreference.populationValueMode);
  const dispatch = useAppDispatch();

  const handleValueModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPopulationValueMode(event.target.value as PopulationValueModeType));
  };

  return (
    <div>
      <RadioGroup aria-label='value-mode' name='value-mode' value={valueMode} onChange={handleValueModeChange}>
        <FormControlLabel value='absolute' control={<Radio />} label='Absolute Value' />
        <FormControlLabel value='proportional' control={<Radio />} label='Proportional Value' />
      </RadioGroup>
    </div>
  );
}
