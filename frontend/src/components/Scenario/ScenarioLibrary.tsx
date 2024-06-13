// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {Paper, Popper} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {CardTitle} from './DataCard';
import {useGetHiddenScenarios} from './hooks';
import {useAppDispatch} from '../../store/hooks';
import {showScenario} from '../../store/DataSelectionSlice';

export default function ScenarioLibrary(): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();

  const libScenarios = useGetHiddenScenarios();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  return (
    <Box>
      <Button
        aria-describedby={id}
        type='button'
        onClick={handleClick}
        id='scenario-add-button'
        variant='outlined'
        color='success'
        sx={{
          height: '244px',
          width: '200px',
          margin: theme.spacing(3),
          marginTop: theme.spacing(2),
          fontWeight: 'bolder',
          fontSize: '3rem',
          border: `2px ${theme.palette.divider} dashed`,
          borderRadius: '3px',
          color: theme.palette.divider,
          alignSelf: 'top',

          '&:hover': {
            border: `2px ${theme.palette.divider} dashed`,
            background: '#E7E7E7',
          },
        }}
        aria-label={t('scenario.add')}
      >
        +
      </Button>
      <Popper id={id} open={open} anchorEl={anchorEl} sx={{zIndex: 100}}>
        <Paper>
          <Box sx={{width: '400px', margin: theme.spacing(2)}}>
            <Typography variant='h1'>Scenario Library</Typography>
            <Divider />
            {libScenarios.map((scenario) => (
              <LibraryCard key={scenario.id} id={scenario.id} label={scenario.label} />
            ))}
          </Box>
        </Paper>
      </Popper>
    </Box>
  );
}

function LibraryCard(props: Readonly<{id: number; label: string}>): JSX.Element {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  return (
    <Box
      id={`scenario-card-root-${props.id}`}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        color: 'grey', // TODO
        width: 'min-content',
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
      }}
    >
      <Box
        id='scenario-card-container'
        sx={{
          position: 'relative',
          zIndex: 0,
          flexGrow: 0,
          flexShrink: 0,
          width: '200px',
          boxSizing: 'border-box',
          marginX: '2px',
          marginY: theme.spacing(2),
          marginBottom: 0,
        }}
      >
        <Box
          id={`scenario-card-main-card-${props.id}`}
          sx={{
            position: 'relative',
            zIndex: 0,
            boxSizing: 'border-box',
            height: 'min-content',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
            border: `2px solid ${'grey'}`, // TODO
            borderRadius: '3px',
            background: theme.palette.background.paper,
            color: 'grey', // TODO
          }}
          onClick={() => dispatch(showScenario(props.id))}
        >
          <Box
            id={`scenario-card-front-${props.id}`}
            sx={{
              marginTop: '6px',
              marginBottom: '6px',
            }}
          >
            <CardTitle title={props.label} id={props.id} isFront />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
