import React from 'react';
import {useAppDispatch} from '../store/hooks';
import {selectCompartment} from '../store/DataSelectionSlice';
import {selectRate} from '../store/DataSelectionSlice';
import {selectScenario} from '../store/DataSelectionSlice';
import {createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';

/* This component displays the pandemic spread depending on different scenarios
 */

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      flexWrap: 'nowrap',
      position: 'relative',
      height: theme.spacing(25),
      marginLeft: theme.spacing(26),
      zIndex: 1,

      '&  .MuiPaper-root': {
        backgroundColor: 'transparent',
      },

      '& :nth-child(n+1)': {
        marginRight: theme.spacing(2.5),
        padding: theme.spacing(7.65),
        border: `3px solid`,
      },
    },
    root: {
      width: '100%',
      display: 'flex',
      flexGrow: 1,
      marginBottom: '200px',
    },

    table: {
      width: '765px',
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(0),
      maxHeight: '200px',
      marginTop: 1,
      position: 'absolute',
      opacity: 0.8,
      backgroundColor: 'transparent',
      zIndex: 0,
      '& .MuiTableCell-root': {
        borderBottom: 0,
      },
    },

    tableRow: {
      '&$selected, &$selected:hover': {
        backgroundColor: '#F2F2F2',
      },
    },
    selected: {},
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
  createRow('infected', 100, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('hospitalized', 145, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('death', 160, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('other', 170, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('deat', 160, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('othe', 170, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('deat', 160, 200, 15, 300, -50, 400, 30, 500, -50),
  createRow('oter', 170, 200, 15, 300, -50, 400, 30, 500, -50),
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
  const [selectedID, setSelectedID] = React.useState('');
  const [active, setActive] = React.useState(0);

  function ChangeShadow(index: number) {
    setActive(index);
  }

  return (
    <Box className={classes.root}>
      <Box style={{width: '100%', position: 'relative'}}>
        <Box
          style={{position: 'absolute', flex: '1 1 auto', overflowY: 'hidden', overflowX: 'auto', width: '100%'}}
          data-simplebar
        >
          <TableContainer className={classes.table} data-simplebar>
            <Table stickyHeader aria-label='sticky table'>
              <TableHead>
                <TableRow style={{backgroundColor: '#f4f4f4'}}>
                  {header.map((header, index) => (
                    <TableCell colSpan={2} align='left' style={{color: header.color, fontWeight: 'bold'}} key={index}>
                      {header.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={index}
                    onClick={() => {
                      setSelectedID(row.compartment);

                      scenario.map((scenario, index) => (
                        <Paper
                          key={index}
                          style={
                            active === index
                              ? {color: scenario.color, boxShadow: '0px 0px 16px 3px'}
                              : {color: scenario.color}
                          }
                          onClick={() => ChangeShadow(index)}
                        />
                      ));
                      dispatch(selectCompartment(row.compartment));

                      switch (active) {
                        case 0:
                          dispatch(selectRate(row.basic));
                          dispatch(selectScenario(header[1].label));
                          break;

                        case 1:
                          dispatch(selectRate(row.medium));
                          dispatch(selectScenario(header[2].label));
                          break;

                        case 2:
                          dispatch(selectRate(row.big));
                          dispatch(selectScenario(header[3].label));
                          break;

                        case 3:
                          dispatch(selectRate(row.maximum));
                          dispatch(selectScenario(header[4].label));
                          break;

                        default:
                          dispatch(selectRate(row.latest));
                      }
                    }}
                    selected={selectedID === row.compartment}
                    classes={{selected: classes.selected}}
                    className={classes.tableRow}
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
          </TableContainer>
          {/* Display Cards */}
          <Box className={classes.paper}>
            {scenario.map((scenario, index) => (
              <Paper
                key={index}
                style={
                  active === index ? {color: scenario.color, boxShadow: '0px 0px 16px 3px'} : {color: scenario.color}
                }
                onClick={() => ChangeShadow(index)}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
