// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import {Dispatch, SetStateAction} from 'react';
import dayjs, {Dayjs} from 'dayjs';
import {DatePicker} from '@mui/x-date-pickers';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react';
import {Localization} from 'types/localization';
import {useTranslation} from 'react-i18next';

interface DatePickerProps {
  /* Start day, the one displayed with a dashed line in the line chart */
  startDay: string | null;

  /* Function used to set the new start date */
  setStartDay: Dispatch<SetStateAction<string | null>>;

  /* Minimum date pickable for which some data are provided */
  minDate: string | null;

  /* Maximum date pickable for which some data are provided */
  maxDate: string | null;

  /*An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This component renders the MUI date picker
 */
export default function ReferenceDatePicker({
  startDay,
  setStartDay,
  minDate,
  maxDate,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: DatePickerProps) {
  // Function used to update the starting date
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  const updateDate = (newDate: Dayjs | null): void => {
    if (
      newDate &&
      minDate &&
      maxDate &&
      (newDate.isAfter(dayjs(minDate)) || newDate.isSame(dayjs(minDate))) &&
      (newDate.isBefore(dayjs(maxDate)) || newDate.isSame(dayjs(maxDate)))
    )
      setStartDay(newDate.toString());
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        id='scenario-view-compartment-list-date'
        sx={{
          display: 'flex',
          padding: 1,
          paddingRight: 3,
          paddingLeft: 3,
          marginBottom: 1,
        }}
      >
        <DatePicker<Dayjs>
          label={
            localization.overrides && localization.overrides['scenario.reference-day']
              ? customT(localization.overrides['scenario.reference-day'])
              : defaultT('scenario.reference-day')
          }
          value={dayjs(startDay)}
          minDate={dayjs(minDate)}
          maxDate={dayjs(maxDate)}
          onChange={updateDate}
          slotProps={{textField: {size: 'small'}}}
        />
      </Box>
    </LocalizationProvider>
  );
}
