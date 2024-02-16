// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useTheme} from '@mui/material/styles';
import {useAppSelector} from '../../store/hooks';
import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Collapse from '@mui/material/Collapse';
import {GroupFilterCard} from './GroupFilterCard';

interface GroupFilterAppendageProps {
  /** The scenario id. */
  scenarioId: number;

  /** The scenario color. */
  color: string;
}

/**
 * This component is placed on the right side of the scenario cards, if at least one group filter is active. It contains
 * a button to open and close the card appendage for the active group filters.
 */
export function GroupFilterAppendage(props: GroupFilterAppendageProps): JSX.Element | null {
  const theme = useTheme();
  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);

  const [folded, setFolded] = useState(true);

  if (!groupFilterList) {
    return null;
  }

  const groupFilterArray = Object.values(groupFilterList);

  // If no group filter is visible this will be hidden.
  if (!groupFilterArray.some((groupFilter) => groupFilter.isVisible)) {
    return null;
  }

  return (
    <Box
      id={`scenario-card-${props.scenarioId}-group-filter-container`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        marginY: theme.spacing(2),
        marginLeft: '-3px',
        padding: '1px',
        height: 'min-content',
        border: `1px solid ${props.color}`,
        borderRadius: '3px',
        background: theme.palette.background.paper,
      }}
    >
      <Button
        id={`scenario-card-${props.scenarioId}-group-filter-fold-toggle`}
        sx={{
          width: '26px',
          minWidth: '26px',
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
        onClick={() => setFolded(!folded)}
      >
        {folded ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      <Collapse in={folded} orientation='horizontal'>
        <Box
          id={`scenario-card-${props.scenarioId}-group-filter-list`}
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {groupFilterArray
            .filter((groupFilter) => groupFilter.isVisible)
            .map((groupFilter, i) => {
              return (
                <GroupFilterCard
                  key={groupFilter.name}
                  groupFilter={groupFilter}
                  groupFilterIndex={i}
                  scenarioId={props.scenarioId}
                />
              );
            })}
        </Box>
      </Collapse>
    </Box>
  );
}
