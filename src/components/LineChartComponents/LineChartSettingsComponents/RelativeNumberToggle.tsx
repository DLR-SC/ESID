// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {useAppDispatch} from 'store/hooks';
import {toggleRelativeNumbers} from 'store/DataSelectionSlice';
import Switch from '@mui/material/Switch';

export default function RelativeNumberToggle({relativeNumbers}: {relativeNumbers: boolean}) {
  const dispatch = useAppDispatch();

  return <Switch checked={relativeNumbers} onChange={() => dispatch(toggleRelativeNumbers())} />;
}
