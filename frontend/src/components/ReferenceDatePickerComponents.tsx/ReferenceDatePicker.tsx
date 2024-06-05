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
  referenceDay: string | null;
  setReferenceDay: Dispatch<SetStateAction<string | null>>;
  minDate: string | null;
  maxDate: string | null;
}

export default function ReferenceDatePicker({referenceDay, setReferenceDay, minDate, maxDate}: DatePickerProps) {
  const updateDate = (newDate: Dayjs | null): void => {
    if (newDate) {
      setReferenceDay(newDate.toString());
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
          value={dayjs(referenceDay)}
          minDate={dayjs(minDate)}
          maxDate={dayjs(maxDate)}
          onChange={updateDate}
          slotProps={{textField: {size: 'small'}}}
        />
      </Box>
    </LocalizationProvider>
  );
}
