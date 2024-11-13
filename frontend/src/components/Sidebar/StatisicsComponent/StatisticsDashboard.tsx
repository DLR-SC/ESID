import React, {useContext, useLayoutEffect, useRef} from 'react';
import * as dc from 'dc';
import * as d3 from 'd3';
import {PandemosContext} from 'data_sockets/PandemosContext';
import {Box, Grid} from '@mui/material';
import {curveLinear, scaleLinear, scaleBand} from 'd3';
import {TabContext, TabPanel} from '@mui/lab';
import {useAppDispatch} from 'store/hooks';
import {
  selectActivities,
  selectAgeGroups,
  selectInfectionStates,
  selectTransportationModes,
  selectTripDuration,
} from 'store/PandemosFilterSlice';
import {KeyInfo} from 'types/pandemos';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function StatisticsDashboard(props: any): JSX.Element {
  const context = useContext(PandemosContext);
  const dispatch = useAppDispatch();
  const chartRefs = useRef<{[key: string]: any}>({});

  // General reset function for any chart
  const resetChart = (chartId: string) => {
    const chart = chartRefs.current[chartId];
    if (chart) {
      chart.filterAll();
      dc.redrawAll();
    }
  };

  useLayoutEffect(() => {
    if (context.expandedTrips) {
      // **************************************** 1. INFECTION CHART ******************************************//

      // Create the dimension based on infection_state
      const infectionDimension = context.expandedTrips?.dimension((d: any) => +d.infection_state);
      const infectionGroup = infectionDimension.group().reduceCount();

      // Override the `all` method to filter out the `key: 0` entry
      const filteredInfectionStateGroup = {
        all: function () {
          return infectionGroup.all().filter((d) => d.key !== 0);
        },
      };

      if (!infectionDimension || !infectionGroup) {
        console.error('Age dimension or group is not defined');
        return;
      }
      const infectionChart = dc.rowChart('#infection') as any;
      chartRefs.current['infection'] = infectionChart;

      infectionChart
        .width(400)
        .height(200)
        .dimension(infectionDimension)
        .group(filteredInfectionStateGroup)
        .elasticX(true)
        .keyAccessor((d: any) => KeyInfo.infection_state[d.key])
        .on('filtered', function (_chart: any) {
          // Get all selected filters
          const selectedFilters = _chart.filters();
          dispatch(
            selectInfectionStates({
              infectionStates: selectedFilters,
            })
          );
        });

      infectionChart.render();

      // *********************************************************************************//

      // **************************************** 2. ORIGIN DESTINATION MATRIX ******************************************//
      const odInfectionDimension = context.expandedTrips?.dimension((d: any) => [
        d.start_location_type,
        d.end_location_type,
      ]);

      const odInfectionGroup = odInfectionDimension?.group().reduceSum((d) => +d.infection_state);
      console.log('odInfectionGroup', odInfectionGroup.top(10));

      if (!odInfectionDimension || !odInfectionGroup) {
        console.error('Origin destionation infection dimension or group is not defined');
        return;
      }

      const odInfectionChart = dc.heatMap('#odInfection') as any;
      chartRefs.current['odInfection'] = odInfectionChart;

      odInfectionChart
        .width(400)
        .height(200)
        .dimension(odInfectionDimension)
        .group(odInfectionGroup)

        .margins({top: 30, right: 20, bottom: 30, left: 90})
        .keyAccessor((d: any) => (d.key && d.key[0] !== undefined ? KeyInfo.location_type[d.key[0]] : 'Unknown'))
        .valueAccessor((d: any) => (d.key && d.key[1] !== undefined ? KeyInfo.location_type[d.key[1]] : 'Unknown'))
        .margins({top: 30, right: 20, bottom: 30, left: 90})
        .colorAccessor((d: any) => (d.value ? +d.value : 0))
        //.colors(d3.scaleSequential(d3.schemeYlGnBu[9]))

        .title((d: any) => {
          return (
            'Start: ' +
            (d.key && d.key[0] !== undefined ? KeyInfo.location_type_string[d.key[0]] : 'Unknown') +
            '\nEnd: ' +
            (d.key && d.key[1] !== undefined ? KeyInfo.location_type_string[d.key[1]] : 'Unknown') +
            '\nInfection Count: ' +
            (d.value !== undefined ? d.value : 'No data')
          );
        });
      odInfectionChart.render();

      // *********************************************************************************//

      // **************************************** 3. TRANPORTATION CHART  ******************************************//
      const transportModeDimension = context.expandedTrips?.dimension((d: {transport_mode: any}) => d.transport_mode);

      const transportModeGroup = transportModeDimension?.group();

      if (!transportModeDimension || !transportModeGroup) {
        console.error('Transport mode dimension or group is not defined');
        return;
      }
      const transportModeChart = dc.pieChart('#transportMode') as any;
      chartRefs.current['transportMode'] = transportModeChart;

      transportModeChart
        .width(150)
        .height(150)
        .radius(90)
        .dimension(transportModeDimension)
        .group(transportModeGroup)
        .label((d: any) => KeyInfo.transport_mode[d.key])
        .title((d: any) => {
          return 'Mode:' + KeyInfo.transport_mode[d.key] + '\nvalue: ' + d.value;
        })
        .on('filtered', function (_chart: any, filter: any) {
          dispatch(
            selectTransportationModes({
              transportationModes: filter,
            })
          );
        });

      transportModeChart.on('pretransition', (d: any) => {
        d.selectAll('text.pie-slice').each(function () {
          d3.select(this).style('font-size', '10px');
        });
      });
      transportModeChart.render();
      //addResetFunction('transportMode');

      // ************************************************************************************//

      // **************************************** 4. ACTIVITY CHART  ******************************************//
      const activityDimension = context.expandedTrips?.dimension((d) => d.activity);

      const activityGroup = activityDimension?.group();
      if (!activityDimension || !activityGroup) {
        console.error('Activity dimension or group is not defined');
        return;
      }
      const activityChart = dc.pieChart('#activity') as any;
      chartRefs.current['activity'] = activityChart;

      activityChart
        .width(150)
        .height(150)
        .dimension(activityDimension)
        .group(activityGroup)
        .label((d: any) => KeyInfo.activity[d.key])
        .title((d: any) => {
          return 'Activity:' + KeyInfo.activity[d.key] + '\nvalue: ' + d.value;
        })
        .on('filtered', function (_chart: any, filter: any) {
          dispatch(
            selectActivities({
              activities: filter,
            })
          );
        });

      activityChart.on('pretransition', (d: any) => {
        d.selectAll('text.pie-slice').each(function () {
          d3.select(this).style('font-size', '10px');
        });
      });

      activityChart.render();
      //  addResetFunction('activity');

      // *********************************************************************************//

      // **************************************** 5. TRIP DURATION CHART  ******************************************//
      const tripDurationDimension = context.expandedTrips?.dimension(function (d: any) {
        const endTime = Math.floor(Math.random() * 3600);
        const startTime = Math.floor(Math.random() * 2600);
        //return Math.floor((d.end_time-d.start_time)/60)  Only when new data with correct start and end time is available for Pandemos
        return Math.floor((endTime - startTime) / 60);
      });
      const tripDurationGroup = tripDurationDimension?.group().reduceCount();

      if (!tripDurationDimension || !tripDurationGroup) {
        console.error('Trip duration dimension or group is not defined');
        return;
      }
      const tripdurationChart = dc.lineChart('#tripDuration') as any;
      chartRefs.current['tripDuration'] = tripdurationChart;
      tripdurationChart
        .width(220)
        .height(200)
        .margins({top: 10, right: 30, bottom: 30, left: 40})
        .x(scaleLinear().domain([0, 60]))
        .curve(curveLinear)
        .renderArea(true)
        .xAxisLabel('Trip duration')
        // .yAxisLabel("Number of trips")
        // .xUnits(units.integers)
        .dimension(tripDurationDimension)
        .clipPadding(10)
        .group(tripDurationGroup)
        .on('filtered', function (_chart: any, filter: any) {
          dispatch(
            selectTripDuration({
              // tripDurationMax: filter  // TODO: once the real data is available
            })
          );
        });
      tripdurationChart.render();

      // **********************************************************************************//

      // **************************************** 5. AGE CHART  ******************************************//
      const ageDimension = context.expandedTrips?.dimension((d) => d.agent_age_group);
      const ageGroup = ageDimension?.group().reduceCount();
      if (!ageDimension || !ageGroup) {
        console.error('Age dimension or group is not defined');
        return;
      }
      const ageChart = dc.barChart('#age') as any;
      chartRefs.current['age'] = ageChart;
      ageChart
        .width(210)
        .height(200)
        .margins({top: 10, right: 20, bottom: 30, left: 40}) // Adjust margins
        .x(scaleBand())
        .xUnits(dc.units.ordinal)
        .xAxisLabel('Age groups')
        .yAxisLabel('Number of people')
        .dimension(ageDimension)
        .brushOn(false)
        .group(ageGroup)
        .keyAccessor((d: any) => KeyInfo.age[d.key])
        .on('filtered', function (_chart: any) {
          // Get all selected filters
          const selectedFilters = _chart.filters();
          dispatch(
            selectAgeGroups({
              ageGroups: selectedFilters,
            })
          );
        });
      ageChart.render();

      // *********************************************************************************//
    }
  }, [context.expandedTrips]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
      }}
    >
      <Grid id='sidebar-tabs' item sx={{display: 'flex', flexGrow: 2, flexDirection: 'row'}}>
        <Box id='infection' sx={{flexBasis: '70%', paddingLeft: 80}}></Box>
      </Grid>
      <Box id='odInfection' sx={{display: 'inline-block', marginRight: '10px', cursor: 'pointer'}}></Box>
      <Grid id='sidebar-tabs' item sx={{display: 'flex', flexGrow: 1, flexDirection: 'row'}}>
        <RestartAltIcon onClick={() => resetChart('age')} />{' '}
        <Box id='age' sx={{flexBasis: '70%', paddingLeft: 80}}></Box>
        <RestartAltIcon onClick={() => resetChart('transportMode')} />{' '}
        <Box id='transportMode' sx={{flexBasis: '30%', marginRight: 1}}></Box>
      </Grid>
      <Grid id='sidebar-tabs' item sx={{display: 'flex', flexGrow: 1, flexDirection: 'row'}}>
        <RestartAltIcon onClick={() => resetChart('activity')} />{' '}
        <Box id='activity' sx={{flexBasis: '70%', marginLeft: 1}}></Box>
        <RestartAltIcon onClick={() => resetChart('tripDuration')} /> <Box id='tripDuration'></Box>
      </Grid>
    </Box>
  );
}
