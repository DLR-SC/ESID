import React from 'react';
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
import {useAppSelector} from '../store/hooks';

/* This component displays the pandemic spread depending on different scenarios
 */

const StyledTableRow = withStyles((_theme) => ({
  root: {
    '& .MuiTableCell-root': {
      borderBottom: 0,
    },

    '& .MuiTable-root input': {
      width: '100%',
    },
    '& .MuiTableCell-sizeSmall ': {
      padding: '6px 28px 6px 16px',
    },
  },
}))(TableRow);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      flexWrap: 'nowrap',
      opacity: 0.8,
      zIndex: 0,
      width: '65%',
      '& > *': {
        margin: theme.spacing(1),
        height: theme.spacing(28),
        border: `3px solid`,
        backgroundColor: '#F8F8F9',
      },

      '&>*:hover': {
        boxShadow: '0px 0px 16px 3px ',
      },

      '& .makeStyles-paper-11 > *': {
        margin: '6px',
      },
    },

    table: {
      marginTop: theme.spacing(2),
      position: 'absolute',
      paddingTop: '20px',
      maxWidth: '250px',
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
    label: '',
    colSpan: 1,
    color: '',
  },
  {
    label: 'Now',
    color: '#3998DB',
    colSpan: 1,
  },

  {
    label: ' Few contact',
    color: '#3998DB',
    colSpan: 2,
  },
  {
    label: 'Medium contact',
    color: '#876BE3',
    colSpan: 2,
  },
  {
    label: 'Medium contact',
    color: '#CC5AC7',
    colSpan: 2,
  },
  {
    label: 'Strong contact',
    color: '#EBA73B',
    colSpan: 2,
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
    minwidth: '160px',
    border: 0,
    boxShadow: '0px 0px 0px 0px ',
  },
  {
    color: '#3998DB',
    minwidth: '128px',
  },
  {
    color: '#876BE3',
    minwidth: '128px',
  },
  {
    color: '#CC5AC7',
    minwidth: '128px',
  },
  {
    color: '#EBA73B',
    minwidth: '128px',
    border: 'solid',
  },
];

export default function Scenario(): JSX.Element {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);

  return (
    <div>
      <TableContainer>
        <StyledTableRow>
          <Table
            className={classes.table}
            aria-label="spanning table"
            size="small"
            style={{width: 'auto', tableLayout: 'auto'}}
          >
            <TableHead>
              <TableRow>
                {header.map((header, index) => (
                  <TableCell
                    colSpan={header.colSpan}
                    align="center"
                    style={{color: header.color, fontWeight: 'bold'}}
                    key={index}
                  >
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
      <div className={classes.paper}>
        {scenario.map((scenario, index) => (
          <Paper
            style={{
              color: scenario.color,
              border: scenario.border,
              minWidth: scenario.minwidth,
              boxShadow: scenario.boxShadow,
            }}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
