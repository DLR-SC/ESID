import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import * as dc from "dc";
import * as d3 from "d3";
import { PandemosContext } from 'data_sockets/PandemosContext';
import { Crossfilter } from 'crossfilter2';
import { Box, FormControl, Grid, Radio, Typography } from "@mui/material";
import  { curveLinear, scaleLinear, scaleOrdinal, scaleBand, curveStepBefore} from 'd3';
import { TabContext, TabPanel } from "@mui/lab";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { selectActivities, selectAgeGroups, selectDestinationTypes, selectInfectionStates, selectOriginTypes, selectTransportationModes, selectTripDuration } from "store/PandemosFilterSlice";
import { KeyInfo, TripExpanded } from "types/pandemos";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function StatisticsDashboard(props: any):JSX.Element {
    const context = useContext(PandemosContext);
   // const [chart,updateChart] = React.useState(null);
   /*  const [selectedValue, setSelectedValue] = React.useState('o'); */
    const dispatch = useAppDispatch();
    const chartRefs = useRef<{[key: string]: any}>({});
   // const [infectionState, setSelectedInfectionState] = React.useState('1');
  const [selectedInfectionState, setSelectedInfectionState] = useState<number[]>([1, 2, 3, 4]); // Default to all infection states
    /* const handleChange = (event: SelectChangeEvent) => {
        setSelectedInfectionState(event.target.value as unknown as number[]);
      }; */
    
  const infectionStateChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedInfectionState(event.target.value as number[]);
    };
       
    // General reset function for any chart
    const resetChart = (chartId: string) => {
        const chart = chartRefs.current[chartId];
        if (chart) {
            chart.filterAll();
            dc.redrawAll();
        }
    };

    useLayoutEffect(() => {
    if (context.expandedTrips){

    
/*         // TODO: change data to enumerate via drop down 1-4
        const odInfectionDimension = context.expandedTrips?.dimension(
            (d:any) => {
                if (selectedInfectionState.includes(d.infection_state)) {
                    return [d.start_location_type, d.end_location_type];
                }
                return null; // Ensure we return null for filtering
            }
        ) */
          
    const odInfectionDimension = context.expandedTrips?.dimension((d:any) =>  [d.start_location_type, d.end_location_type])
    const odInfectionGroup = odInfectionDimension.group().reduce(
                function(p:any, v:any) {
                    if (v.infection_state >= 1 && v.infection_state <= 4) {
                        p.count += v.infection_state;
                    }
                    return p;
                },
                function(p:any, v:any) {
                    if (v.infection_state >= 1 && v.infection_state <= 4) {
                        p.count -= v.infection_state;
                    }
                    return p;
                },
                function() {
                    return { count: 0 };
                }
            );

    

   // const odInfectionGroup = odInfectionDimension.group().reduceCount//reduceSum(function(d) { return d.infection_state });;
    //const odInfectionGroup = odInfectionDimension?.group().reduceCount();
    console.log("d.odInfectionGroup",odInfectionGroup?.top(Infinity));

    if (!odInfectionDimension || !odInfectionGroup) {
        console.error("Origin destionation infection dimension or group is not defined");
        return; 
    }

   // console.log("d.odInfectionGroup",odInfectionDimension?.top(Infinity));
  
    const odInfectionChart = (dc.heatMap("#odInfection") as any)
    chartRefs.current['odInfection'] = odInfectionChart;
   // const odInfectionChartLegend = (dc.htmlLegend() as any).container("#odInfectionChart-legend").horizontal(false).highlightSelected(true);
    odInfectionChart
   .width(400).height(200)
   . dimension(odInfectionDimension).group(odInfectionGroup)
    .keyAccessor((d:any) => KeyInfo.location_type_string[d.key[0]])
    .valueAccessor((d:any) => KeyInfo.location_type_string[d.key[1]])
    .margins({ top: 30, right: 10, bottom: 30, left: 90 }) 
   // .style('font-size', '10px')
  //  .selectAll('.axis text').style('font-size', '10px')
   // .keyAccessor(function(d: { key: (string )[]; }) { return  KeyInfo.location_type_string[d.key[0]]; })
    //.valueAccessor(function(d: { key: (string | number)[]; }) { return +d.key[1]; })
    .colorAccessor(function(d: { value: number; }) { 
        //console.log(d.value)
        return +d.value.count; })
        .title((d:any) => {
            return "Start: " + KeyInfo.location_type_string[d.key[0]] +
                   "\nEnd: " + KeyInfo.location_type_string[d.key[1]] +
                   "\nInfection Count: " + d.value.count;
        })
        .colors(d3.scaleSequential(d3.interpolateViridis))
       .calculateColorDomain();//.legend(odInfectionChartLegend);
    odInfectionChart.renderlet((d:any) => {
        d.selectAll('.axis text')
          .style('font-size', '10px')
         // .style('font-family', 'Arial, sans-serif')
          //.style('fill', 'blue'); // Customize as needed
      }); 
/*       odInfectionChart.on('filtered', (d:any)=> {
        dispatch(
            selectOriginTypes({
                originTypes: d.key[0] 
            }),
            selectDestinationTypes({
                destinationTypes: d.key[1] 
      }));
    });  */
    odInfectionChart.render();

     // Add reset function
    // addResetFunction('odInfection');
  
   
    const transportModeDimension = context.expandedTrips?.dimension((d: { transport_mode: any; }) => d.transport_mode);
 
    const transportModeGroup = transportModeDimension?.group();

   if (!transportModeDimension || !transportModeGroup) {
    console.error("Transport mode dimension or group is not defined");
    return;
}
    const transportModeChart = (dc.pieChart("#transportMode") as any)
    chartRefs.current['transportMode'] = transportModeChart;

     transportModeChart
     .width(150)
     .height(150)
     .radius(90)
     .dimension(transportModeDimension)
     .group(transportModeGroup)
     .label( (d: any) => KeyInfo.transport_mode_string[d.key]) 
     .title((d:any) => {
        return "Mode:" + KeyInfo.transport_mode_string[d.key] +
               "\nvalue: " + d.value;
    })
     .on('filtered', function(_chart: any, filter: any) {
        dispatch(
            selectTransportationModes({
                transportationModes: filter 
            })
    ); 
    });  
    
    transportModeChart.on('pretransition', (d: any)=> {
        d.selectAll('text.pie-slice').each(function() {
            d3.select(this).style('font-size', '10px'); // Adjust the font size as needed
        });
    });
    transportModeChart.render()
    //addResetFunction('transportMode');
  
 
    const activityDimension = context.expandedTrips?.dimension(
        (d)=> d.activity
);
 
    const activityGroup = activityDimension?.group();
   if (!activityDimension || !activityGroup) {
    console.error("Activity dimension or group is not defined");
    return;
}
   const activityChart = (dc.pieChart("#activity") as any)
   chartRefs.current['activity'] = activityChart;

    activityChart.width(150)
    .height(150)
    .dimension(activityDimension).group(activityGroup).label( 
            (d: any) => KeyInfo.activity[d.key]
    ) .title((d:any) => {
        return "Activity:" + KeyInfo.activity[d.key] +
               "\nvalue: " + d.value;
    })
      .on('filtered', function(_chart: any, filter: any) {
        dispatch(
            selectActivities({
                activities: filter // TODO: make sure this is the activity type number
            })
    );
    });  

            
    activityChart.on('pretransition', (d: any)=> {
        d.selectAll('text.pie-slice').each(function() {
            d3.select(this).style('font-size', '10px'); // Adjust the font size as needed
        });
    });

    activityChart.render();

  //  addResetFunction('activity');
 
    const tripDurationDimension = context.expandedTrips?.dimension(function(d: any) {
        const endTime = Math.floor(Math.random() * 3600);
        const startTime = Math.floor(Math.random() * 2600)  
        //return Math.floor((d.end_time-d.start_time)/60)  Only when new data with correct start and end time is available for Pandemos
        return Math.floor((endTime-startTime)/60)
    
    });
    const tripDurationGroup = tripDurationDimension?.group().reduceCount();
    
    if (!tripDurationDimension || !tripDurationGroup) {
        console.error("Trip duration dimension or group is not defined");
        return; 
    }
    const tripdurationChart = (dc.lineChart("#tripDuration") as any)
    chartRefs.current['tripDuration'] = tripdurationChart;
    tripdurationChart.width(220)
    .height(200)
    .margins({ top: 10, right: 30, bottom: 30, left: 40 }) // Adjust margins
    .x(scaleLinear().domain([0, 60]))
      .curve(curveLinear)
      .renderArea(true)
      .xAxisLabel("Trip duration")
     // .yAxisLabel("Number of trips")
     // .xUnits(units.integers)
     .dimension(tripDurationDimension)
      .clipPadding(10)
    .group(tripDurationGroup)
    .on('filtered', function(_chart: any, filter: any) {
        dispatch(
           selectTripDuration({
               // tripDurationMax: filter  // TODO: not working ask Moritz
            })
    );
        console.log('mode:', filter);
    });  
        tripdurationChart.render();
    
    //    addResetFunction('tripDuration');

    const ageDimension = context.expandedTrips?.dimension((d) => d.agent_age_group)
    const ageGroup   =   ageDimension?.group().reduceCount();

    if (!ageDimension || !ageGroup) {
        console.error("Age dimension or group is not defined");
        return; 
    }
    const ageChart = (dc.barChart("#age") as any);
    chartRefs.current['age'] = ageChart;
    ageChart.width(210)
    .height(200)
    .margins({ top: 10, right: 20, bottom: 30, left: 40 }) // Adjust margins
      .x (scaleBand())
      .xUnits(dc.units.ordinal)
      
      .xAxisLabel("Age groups")
    //  .yAxisLabel("Number of people")
     // .dimension(ageDim)
     .dimension(ageDimension)
      .brushOn(false)
// .group(ageGroup)
.group(ageGroup)
.keyAccessor((d: any) => KeyInfo.age[d.key])
.on('filtered', function(_chart: any, filter: any) {
    dispatch(
       selectAgeGroups({
         ageGroups: filter  // tripDurationMax: filter  // TODO: not working ask Moritz
        })
);
    //console.log('mode:', filter);
});  
ageChart.render();
//addResetFunction('age');

//dc.renderAll()
}
}, [context.expandedTrips]);
 


return(
  
<Box sx={{
        display: 'flex',
        flexDirection: 'column',
       // flexGrow: '1',
       // top: '10',
       // marginLeft:1,
       alignItems: 'left',
      }}>
  <Grid id="sidebar-tabs"item sx={{display: 'flex', flexGrow: 2, flexDirection: 'row'}}> 
{/*   <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="simple-select-infection-state">Select infection state</InputLabel>
        <Select
          labelId="simple-select-infection-state"
          id="simple-select"
          value={infectionState}
          label="Infection State"
          onChange={handleChange}
        >
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>

        </Select>
      </FormControl>
    </Box> */}

    <RestartAltIcon  onClick={() => resetChart('odInfection')}/> 
         <Box id="odInfection"></Box>   
   
</Grid>  
   <Box id="odInfection" sx={{ display: "inline-block", marginRight:"10px", cursor:"pointer" }} ></Box>  
  <Grid id="sidebar-tabs"item sx={{display: 'flex', flexGrow: 1, flexDirection: 'row'}}> 
 
  <RestartAltIcon  onClick={() => resetChart('tripDuration')}/> <Box  id="tripDuration" ></Box>    
   <RestartAltIcon  onClick={() => resetChart('transportMode')}/>     <Box  id="transportMode" sx={{ flexBasis: '30%', marginRight: 1 }}></Box> 
        
  </Grid>  
  <Grid id="sidebar-tabs"item sx={{display: 'flex', flexGrow: 1, flexDirection: 'row'}}>
  <RestartAltIcon  onClick={() => resetChart('age')}/>  <Box  id="age" sx={{ flexBasis: '70%', paddingLeft: 80 }}></Box>  
  <RestartAltIcon  onClick={() => resetChart('activity')}/>    <Box  id="activity"sx={{ flexBasis: '70%', marginLeft: 1 }}></Box> 
  </Grid> 
    
{/* <Grid id="sidebar-tabs"item sx={{display: 'flex', flexGrow: 1, flexDirection: 'row'}}>
<Radio
  checked={selectedValue === 'o'} 
  onChange={handleChange}
  value="a"
  name="radio-buttons"
  aria-label="Origin"
  inputProps={{ 'aria-label': 'A' }}
/>
<Radio
  checked={selectedValue === 'destination'}
  onChange={handleChange}
  value="b"
  name="radio-buttons"
 aria-label="Destination"
  inputProps={{ 'aria-label': 'B' }}
/> 
   
    </Grid>  */}



</Box>





)};