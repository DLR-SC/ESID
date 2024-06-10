// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import Box from '@mui/material/Box';
import {Dispatch, SetStateAction} from 'react';
import dayjs, {Dayjs} from 'dayjs';
import {DatePicker} from '@mui/x-date-pickers';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react';

interface DatePickerProps {
  /* Start day, the one displayed with a dashed line in the line chart */
  startDay: string | null;

  /* Function used to set the new start date */
  setStartDay: Dispatch<SetStateAction<string | null>>;

  /* Minimum date pickable for which some data are provided */
  minDate: string | null;

  /* Maximum date pickable for which some data are provided */
  maxDate: string | null;
}

/**
 * This component renders the MUI date picker
 */
export default function ReferenceDatePicker({startDay, setStartDay, minDate, maxDate}: DatePickerProps) {
  // Function used to update the starting date
  const updateDate = (newDate: Dayjs | null): void => {
    if (newDate) {
      setStartDay(newDate.toString());
    }
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
          label={'Reference-day'}
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
