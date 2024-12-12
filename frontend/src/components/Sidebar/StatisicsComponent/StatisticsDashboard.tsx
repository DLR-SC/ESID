import React, {useContext, useLayoutEffect, useRef, useState} from 'react';
import * as dc from 'dc';
import * as d3 from 'd3';
import {PandemosContext} from 'data_sockets/PandemosContext';
import {Box, Button, Grid, Typography} from '@mui/material';
import {useAppDispatch} from 'store/hooks';
import {
  selectActivities,
  selectAgeGroups,
  selectDestinationTypes,
  selectInfectionStates, selectOriginTypes,
  selectTransportationModes,
} from 'store/PandemosFilterSlice';
import {KeyInfo} from 'types/pandemos';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {scaleLinear} from 'd3';

export default function StatisticsDashboard(props: any): JSX.Element {
  const context = useContext(PandemosContext);
  const dispatch = useAppDispatch();
  const chartRefs = useRef<{[key: string]: any}>({});
  const chartGroup = 'dashboard' as any;
  const [showReset, setShowReset] = useState<string | null>(null);

  // To reset the app
  const resetFilters = () => {
    dc.filterAll('dashboard');
    dc.redrawAll('dashboard');
  };

  // Shows the reset icon for the clicked chart
  const handleChartClick = (chartId: string) => {
    setShowReset(chartId);
  };

  // To reset individual chart
  const resetChart = (chartId: string) => {
    const chart = chartRefs.current[chartId]; // Retrieve the chart from chartRefs using chartId
    if (chart) {
      chart.filterAll();
      chart.redraw();
    } else {
      console.error(`Chart with ID ${chartId} not found.`);
    }
    setShowReset(null);
  };

  useLayoutEffect(() => {
    if (context.expandedTrips && context.expandedTrips?.size() > 0) {
      // **************************************** 1. INFECTION CHART ******************************************//

      // Create the dimension based on infection_state
      const infectionDimension = context.expandedTrips?.dimension((d: any) => +d.infection_state);
      const infectionGroup = infectionDimension?.group().reduceCount();

      // Override the `all` method to filter out the `key: 0` entry
      const filteredInfectionStateGroup = {
        all: () => infectionGroup.all().filter((d) => d.key !== 0),
      };

      if (!infectionDimension || !infectionGroup) {
        console.error('Infection state dimension or group is not defined');
        return;
      }

      const odInfectionChart = dc.heatMap('#odInfection', chartGroup) as any;
      const infectionChart = dc.rowChart('#infection', chartGroup) as any;
      chartRefs.current['infection'] = infectionChart;

      infectionChart
        .width(400)
        .height(170)
        .dimension(infectionDimension)
        .group(filteredInfectionStateGroup)
        .label((d: any) => KeyInfo.infection_state[d.key].icon)
        .keyAccessor((d: any) => d.key)
        .colors(d3.scaleOrdinal(d3.schemeBlues[9].slice().reverse()))
        .on('filtered', function (_chart: any) {
          const selectedFilters = _chart.filters()
          dispatch(
            selectInfectionStates({
              infectionStates: selectedFilters,
            })
          );
        });

      // *********************************************************************************//

      // **************************************** 2. ORIGIN DESTINATION MATRIX ******************************************//
      const odInfectionDimension = context.expandedTrips?.dimension((d: any) => [
        d.start_location_type,
        d.end_location_type,
      ]);

      const odInfectionGroup = odInfectionDimension.group().reduceSum((d) => +d.infection_state);

      // Set up a quantized color scale for better mapping of numerical values
      const maxValue = Math.max(...odInfectionGroup.all().map((d: any) => d.value)); // Get max value
      const colorScale = d3
        .scaleQuantize<string>() // Explicitly set the type as <string>
        .domain([0, maxValue])
        .range(d3.schemeBlues[9].slice(1)); // Remove lightest shades as it gets white

      if (!odInfectionDimension || !odInfectionGroup) {
        console.error('Origin destionation infection dimension or group is not defined');
        return;
      }

      chartRefs.current['odInfection'] = odInfectionChart;

      odInfectionChart
        .width(400)
        .height(200)
        .dimension(odInfectionDimension)
        .group(odInfectionGroup)
        .keyAccessor((d: any) => (d.key && d.key[0] !== undefined ? KeyInfo.location_type[d.key[0]].icon : 'Unknown'))
        .valueAccessor((d: any) => (d.key && d.key[1] !== undefined ? KeyInfo.location_type[d.key[1]].icon : 'Unknown'))
        .colorAccessor((d: any) => +d.value)
        .colors((d: d3.NumberValue) => colorScale(d))
        //.colors(d3.scaleOrdinal(d3.schemeBlues[8]))
        .title((d: any) => {
          return (
            'Start: ' +
            (d.key && d.key[0] !== undefined ? KeyInfo.location_type[d.key[0]].icon : 'Unknown') +
            '\nEnd: ' +
            (d.key && d.key[1] !== undefined ? KeyInfo.location_type[d.key[1]].icon : 'Unknown') +
            '\nInfection Count: ' +
            (d.value !== undefined ? d.value : 'No data')
          );
        });
      odInfectionChart.turnOnControls(true);
      odInfectionChart.controlsUseVisibility(true);

      odInfectionChart.on('filtered', function (_chart: any, filter: any) {
        const selectedFilters = _chart.filters();
        dispatch(
          selectOriginTypes({
            originTypes: selectedFilters.map((d: any) => d[0]),
          })
        );
        dispatch(
          selectDestinationTypes({
            destinationTypes: selectedFilters.map((d: any) => d[1]),
          })
        );
      });

      // *********************************************************************************//

      // **************************************** 3. TRANPORTATION CHART  ******************************************//
      const transportModeDimension = context.expandedTrips.dimension((d: {transport_mode: any}) => +d.transport_mode);

      const transportModeGroup = transportModeDimension.group();
      if (!transportModeDimension || !transportModeGroup) {
        console.error('Transport mode dimension or group is not defined');
        return;
      }
      const transportModeChart = dc.pieChart('#transportMode', chartGroup) as any;
      chartRefs.current['transportMode'] = transportModeChart;
      transportModeChart
        .width(170)
        .height(170)
        .minAngleForLabel(0.2)
        .dimension(transportModeDimension)
        .group(transportModeGroup)
        .colors(d3.scaleOrdinal(d3.schemeBlues[9].slice().reverse()))
        .label((d: any) => {
          return KeyInfo.transport_mode[d.key].icon;
        })
        .title((d: any) => {
          return 'Mode:' + KeyInfo.transport_mode[d.key].fullName + '\nvalue: ' + d.value;
        })

        .on('filtered', function (_chart: any) {
          const selectedFilters = _chart.filters();
          dispatch(
            selectTransportationModes({
              transportationModes: selectedFilters,
            })
          );
        });

      // ************************************************************************************//

      // **************************************** 4. ACTIVITY CHART  ******************************************//
      const activityDimension = context.expandedTrips.dimension((d) => d.activity);

      const activityGroup = activityDimension?.group();
      if (!activityDimension || !activityGroup) {
        console.error('Activity dimension or group is not defined');
        return;
      }
      const activityChart = dc.pieChart('#activity', chartGroup) as any;
      chartRefs.current['activity'] = activityChart;

      activityChart
        .width(170)
        .height(170)

        .slicesCap(8)
        .dimension(activityDimension)
        .group(activityGroup)
        .minAngleForLabel(0.2)
        .colorAccessor(function (d: {value: any}, i: any) {
          return d.value;
        })
        .colors(d3.scaleOrdinal(d3.schemeBlues[9].slice().reverse()))
        .label((d: any) => KeyInfo.activity[d.key])
        .title((d: any) => {
          return 'Activity:' + '' + KeyInfo.activity[d.key] + '\nvalue: ' + d.value;
        })
        .on('filtered', function (_chart: any) {
          const selectedFilters = _chart.filters();
          dispatch(
            selectActivities({
              activities: selectedFilters,
            })
          );
        });

      activityChart.on('renderlet', (d: any) => {
        d.selectAll('text.pie-slice').style('fill', 'white'); // Change color based on the color scheme of the pie chart so that text is visible
        d.selectAll('text.pie-slice').style('font-size', '11px');
      });

      // *********************************************************************************//

      // **************************************** 5. TRIP DURATION CHART  ******************************************//
      const tripDurationDimension = context.expandedTrips?.dimension(function (d: any) {
        const endTime = Math.floor(Math.random() * 3600);
        const startTime = Math.floor(Math.random() * 2600);
        //return Math.floor((d.end_time-d.start_time)/60)  Only when real data with correct start and end time is available
        return Math.floor((endTime - startTime) / 60);
      });
      const tripDurationGroup = tripDurationDimension.group().reduceCount();
      if (!tripDurationDimension || !tripDurationGroup) {
        console.error('Trip duration dimension or group is not defined');
        return;
      }
      const tripdurationChart = dc.lineChart('#tripDuration', chartGroup) as any;
      chartRefs.current['tripDuration'] = tripdurationChart;
      tripdurationChart
        .width(220)
        .height(200)
        .margins({top: 10, right: 30, bottom: 30, left: 40})
        .x(scaleLinear().domain([0, 60]))
        .renderArea(true)
        .dimension(tripDurationDimension)
        .clipPadding(10)
        .group(tripDurationGroup)
        .on('filtered', function (_chart: any, filter: any) {
          /*const selectedFilters = _chart.filters();
          dispatch(
            selectTripDuration({
              start: Math.round(selectedFilters[0][0]),
              end: Math.round(selectedFilters[0][1]),
            })
          );*/
        })
        .title((d: any) => d.value);

      // **********************************************************************************//

      // **************************************** 5. AGE CHART  ******************************************//
      const ageDimension = context.expandedTrips?.dimension((d) => d.agent_age_group);
      const ageGroup = ageDimension?.group().reduceCount();
      if (!ageDimension || !ageGroup) {
        console.error('Age dimension or group is not defined');
        return;
      }
      const ageChart = dc.barChart('#age', chartGroup) as any;
      chartRefs.current['age'] = ageChart;
      ageChart
        .width(250)
        .height(200)
        .margins({top: 10, right: 10, bottom: 30, left: 40})
        .dimension(ageDimension)
        .group(ageGroup)
        .elasticY(true)
        .x(d3.scaleOrdinal())
        .xUnits(dc.units.ordinal)
        .barPadding(0.1)
        .keyAccessor((d: any) => d.key)
        .label((d: any) => KeyInfo.age_group[d.data.key].icon)
        .on('filtered', function (_chart: any) {
          // Get all selected filters
          const selectedFilters = _chart.filters()
          dispatch(
            selectAgeGroups({
              ageGroups: selectedFilters,
            })
          );
        });

      dc.renderAll(chartGroup); // Render the dc chart group

      // *********************************************************************************//
    }
  }, [context.expandedTrips, chartGroup, dispatch]);

  return (
    <Box sx={{p: 1}} id='dashboard'>
      <Grid container spacing={2}>
        <Button
          variant='contained'
          startIcon={<RestartAltIcon />}
          onClick={resetFilters}
          sx={{
            width: '80px',
            height: '26px',
            borderRadius: '20px',
            padding: '4px',
            fontSize: '12px',
            backgroundColor: 'grey',
            color: 'white',
            marginLeft: 'auto',
            marginBottom: '5px',
          }}
        >
          Reset
        </Button>
        {/* Infection Chart */}
        <Grid item xs={12} sx={{border: '2px solid #ddd', borderRadius: '4px', padding: 2}}>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Typography variant='h5'>Infection Chart</Typography>
              {showReset === 'infection' && ( //to show reset icon for individual charts
                <RestartAltIcon
                  onClick={() => resetChart('infection')}
                  sx={{
                    cursor: 'pointer',
                    color: 'grey',
                    '&:hover': {color: 'black'},
                  }}
                />
              )}
            </Box>
            <div id='infection' onClick={() => handleChartClick('infection')}></div>
          </Box>
        </Grid>

        {/* OD Infection Heatmap */}
        <Grid item xs={12} sx={{border: '2px solid #ddd', borderRadius: '4px', padding: 2}}>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Typography variant='h5'>Origin-Destination Infection</Typography>
              {showReset === 'odInfection' && ( //to show reset icon for individual charts
                <RestartAltIcon
                  onClick={() => resetChart('odInfection')}
                  sx={{
                    cursor: 'pointer',
                    color: 'grey',
                    '&:hover': {color: 'black'},
                  }}
                />
              )}
            </Box>
            <div id='odInfection' onClick={() => handleChartClick('odInfection')}></div>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              border: '2px solid #ccc',
              borderRadius: '8px',
              padding: 2,
            }}
          >
            <Grid container spacing={2}>
              {/* Age Groups */}
              <Grid item xs={12} md={6}>
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant='h5'>Age Groups</Typography>
                    {showReset === 'age' && ( //to show reset icon for individual charts
                      <RestartAltIcon
                        onClick={() => resetChart('age')}
                        sx={{
                          cursor: 'pointer',
                          color: 'grey',
                          '&:hover': {color: 'black'},
                        }}
                      />
                    )}
                  </Box>
                  <div id='age' onClick={() => handleChartClick('age')}></div>
                </Box>
              </Grid>

              {/* Transportation Modes */}
              <Grid item xs={12} md={6}>
                <Box sx={{display: 'flex', flexDirection: 'column', mb: 2, ml: 4}}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant='h5'>Transportation Modes</Typography>
                    {showReset === 'transportMode' && ( //to show reset icon for individual charts
                      <RestartAltIcon
                        onClick={() => resetChart('transportMode')}
                        sx={{
                          cursor: 'pointer',
                          color: 'grey',
                          '&:hover': {color: 'black'},
                        }}
                      />
                    )}
                  </Box>
                  <div id='transportMode' onClick={() => handleChartClick('transportMode')}></div>
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{mt: 2}}>
              {/* Trip Duration */}
              <Grid item xs={12} md={6}>
                <Box sx={{display: 'flex', flexDirection: 'column', ml: 2}}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant='h5'>Trip Duration</Typography>
                    {showReset === 'tripDuration' && (
                      <RestartAltIcon
                        onClick={() => resetChart('tripDuration')} //to show reset icon for individual charts
                        sx={{
                          cursor: 'pointer',
                          color: 'grey',
                          '&:hover': {color: 'black'},
                        }}
                      />
                    )}
                  </Box>
                  <div id='tripDuration' onMouseDown={() => handleChartClick('tripDuration')}></div>
                </Box>
              </Grid>

              {/* Activities */}
              <Grid item xs={12} md={6}>
                <Box sx={{display: 'flex', flexDirection: 'column', ml: 4}}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant='h5'>Agent Activities</Typography>
                    {showReset === 'activity' && (
                      <RestartAltIcon
                        onClick={() => resetChart('activity')} //to show reset icon for individual charts
                        sx={{
                          cursor: 'pointer',
                          color: 'grey',
                          '&:hover': {color: 'black'},
                        }}
                      />
                    )}
                  </Box>
                  <div id='activity' onClick={() => setShowReset('activity')}></div>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
