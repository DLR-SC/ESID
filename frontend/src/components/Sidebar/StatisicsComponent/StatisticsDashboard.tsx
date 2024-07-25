import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import * as dc from "dc";
import {  Trip, PandemosContext } from 'data_sockets/PandemosContext';
import { Crossfilter } from 'crossfilter2';
import { Box, Typography } from "@mui/material";
import  { curveLinear, scaleLinear, scaleOrdinal, scaleBand, curveStepBefore} from 'd3';

export default function StatisticsDashboard(props: any):JSX.Element {
    const context = useContext(PandemosContext);
    const [chart,updateChart] = React.useState(null);

    useLayoutEffect(() => {
    if (context.trips){
    const transportModeDimension = context.trips?.dimension(function(d){
        const mode = Number(d.transport_mode);
        if (mode == 1)
            return "bicycle";
        else if (mode == 2)
            return "car_driver";
        else if (mode == 3)
            return "car_codriver";
        else if (mode == 4)
            return "public_transport";
        else if (mode == 5)
            return "walk";
        return "not specified";
    
    });
   // console.log("d.transport_mode",transportModeDimension?.top(Infinity));
    
    const transportModeGroup = transportModeDimension?.group();
   // console.log( "Hello", transportModeGroup?.top(Infinity)); 
   if (!transportModeDimension || !transportModeGroup) {
    console.error("Transport mode dimension or group is not defined");
    return;
}
    const transportModeChart = (dc.pieChart("#transportMode") as any)

     transportModeChart.dimension(transportModeDimension).group(transportModeGroup)
    transportModeChart.render()
   
  //  transportModeChart.render()
 
 
    const activityDimension = context.trips?.dimension(function(d){
        
        const activity = Number(d.activity);

        if (activity == 1) 
            return " work";
            else if (activity == 2)
            return "education";
            else if (activity == 3)
            return "shopping";
            else if (activity == 4)
            return "free_time";
            else if (activity == 5)
            return "private_matter";
            else if (activity == 6)
            return "others";
            else if (activity == 7)
            return "home";
            else if (activity == 0)
            return "not specified";
        return "not specified";
    
    });
 
    const activityGroup = activityDimension?.group();
   // console.log( "Hello", transportModeGroup?.top(Infinity)); 
   if (!activityDimension || !activityGroup) {
    console.error("Activity dimension or group is not defined");
    return;
}
   const activityChart = (dc.pieChart("#activity") as any)
    activityChart.dimension(activityDimension).group(activityGroup);
    activityChart.render();

   // activityChart.render();
 
    const tripDurationDimension = context?.trips.dimension(function(d) {
        const endTime = Math.floor(Math.random() * 3600);
        const startTime = Math.floor(Math.random() * 2600)  
        console.log(d)
        //return Math.floor((d.end_time-d.start_time)/60)  Only when new data with correct start and end time is available for Pandemos
        return Math.floor((endTime-startTime)/60)
    
    });
    const tripDurationGroup = tripDurationDimension?.group().reduceCount();
    console.log("d.tripDuration",tripDurationGroup?.top(Infinity));
    
    if (!tripDurationDimension || !tripDurationGroup) {
        console.error("Trip duration dimension or group is not defined");
        return; 
    }
    const tripdurationChart = (dc.lineChart("#tripDuration") as any)
    .x(scaleLinear().domain([0, 120]))
      .curve(curveStepBefore)
      .renderArea(true)
      .xAxisLabel("Trip duration")
      .yAxisLabel("Number of trips")
     // .xUnits(units.integers)
     .dimension(tripDurationDimension)
      .clipPadding(10)
    .group(tripDurationGroup)
        tripdurationChart.render();


    const odInfectionDimension = context.trips.dimension(function(d){
        return [d.start_location, d.end_location]; })

    const odInfectionGroup = odInfectionDimension.group().reduceCount();
    
    if (!odInfectionDimension || !odInfectionGroup) {
        console.error("Origin destionation infection dimension or group is not defined");
        return; 
    }

    const odInfectionChart = (dc.heatMap("#odInfection") as any)
    odInfectionChart.dimension(odInfectionDimension).group(odInfectionGroup).render();

}
}, []);
 


return(
    <React.Fragment>
<Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: '1',
        top: '10',
        alignItems: 'center',
      }}>
<Box  id="transportMode"></Box>
<Box  id="activity" ></Box>
<Box  id="tripDuration" ></Box>   
<Box  id="odInfection" ></Box>   
</Box>




</React.Fragment> 
)};