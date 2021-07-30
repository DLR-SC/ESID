import React from 'react';
import {Box} from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {Theme, createStyles, withStyles, makeStyles} from '@material-ui/core/styles';
import {useAppDispatch} from '../store/hooks';
import {selectScenario} from '../store/DataSelectionSlice';

/* This component displays the pandemic spread depending on different scenarios
 */

const StyledTableRow = withStyles((_theme) => ({
  root: {
    '& .MuiTableCell-root': {
      borderBottom: 0,
    },
  },
}))(TableRow);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      flexWrap: 'nowrap',
      height: theme.spacing(25),
      marginLeft: theme.spacing(27),
      zIndex: 0,

      '& :nth-child(n+1)': {
        marginRight: theme.spacing(2.5),
        padding: theme.spacing(7.65),
        border: `3px solid`,
        backgroundColor: '#F8F8F9',
      },

      '&>*:hover': {
        boxShadow: '0px 0px 16px 3px ',
      },
    },

    table: {
      width: '765px',
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(0),
      marginTop: 1,
      position: 'absolute',
      opacity: 0.8,
      backgroundColor: 'transparent',
      zIndex: 1,
    },
  })
);

function createRow(
  compartment: string,
  latest: number,
  basic: number,
  basicRate: number,
  medium: number,
  mediumRate: number,
  big: number,
  bigRate: number,
  maximum: number,
  maximumRate: number
) {
  return {compartment, latest, basic, basicRate, medium, mediumRate, big, bigRate, maximum, maximumRate};
}

const header = [
  {
    label: 'Now',
    color: '#3998DB',
  },

  {
    label: ' Medium contact',
    color: '#3998DB',
  },
  {
    label: 'Medium contact',
    color: '#876BE3',
  },
  {
    label: 'Medium contact',
    color: '#CC5AC7',
  },
  {
    label: 'Medium contact',
    color: '#EBA73B',
  },
];

const rows = [
  createRow('infected', 100, 100, 15, 100, -50, 100, 30, 100, -50),
  createRow('hospitalized', 145, 100, 15, 100, -50, 100, 30, 100, -50),
  createRow('death', 160, 100, 15, 100, -50, 100, 30, 100, -50),
  createRow('other', 170, 100, 15, 100, -50, 100, 30, 100, -50),
];

const scenario = [
  {
    color: '#3998DB',
  },
  {
    color: '#876BE3',
  },
  {
    color: '#CC5AC7',
  },
  {
    color: '#EBA73B',
    border: 'solid',
  },
];

export default function Scenario(): JSX.Element {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  return (
    <Box>
      <TableContainer>
        <StyledTableRow>
          <Table className={classes.table} aria-label="spanning table" size="small">
            <TableHead>
              <TableRow>
                {header.map((header, index) => (
                  <TableCell colSpan={2} align="center" style={{color: header.color, fontWeight: 'bold'}} key={index}>
                    {header.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  hover
                  key={row.compartment}
                  onMouseOver={() => {
                    dispatch(selectScenario(row.compartment));
                  }}
                >
                  <TableCell>{row.compartment}</TableCell>
                  <TableCell>{row.latest}</TableCell>
                  <TableCell>{row.basic}</TableCell>
                  <TableCell>{row.basicRate}%</TableCell>
                  <TableCell>{row.medium}</TableCell>
                  <TableCell>{row.mediumRate}%</TableCell>
                  <TableCell>{row.big}</TableCell>
                  <TableCell>{row.bigRate}%</TableCell>
                  <TableCell>{row.maximum}</TableCell>
                  <TableCell>{row.maximumRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableRow>
      </TableContainer>
      {/* Display Cards */}
      <Box className={classes.paper}>
        {scenario.map((scenario, index) => (
          <Paper
            style={{
              color: scenario.color,
            }}
            key={index}
          />
        ))}
      </Box>
    </Box>
  );
}
