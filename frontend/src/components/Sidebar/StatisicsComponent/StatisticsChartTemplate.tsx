import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import  {lineChart, renderAll, seriesChart, rowChart, barChart, numberDisplay, pieChart,units, legend} from "dc";
import crossfilter from "crossfilter";
import  {csvParse, curveLinear, scaleLinear, csv, DSVRowString, scaleOrdinal, scaleBand, curveStepBefore} from 'd3';
import "./dc.scss";
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import { Agent, Location, Trip, PandemosContext } from 'data_sockets/PandemosContext';
import { Crossfilter } from 'crossfilter2';
import dc from 'dc';


export default function StatisticsChartTemplate(props: { chartFunction: (arg0: null, arg1: Crossfilter<Trip> | undefined) => any; }):JSX.Element {
    //const {agents, locations, trips} = useContext(PandemosContext);
    const context = useContext(PandemosContext);
   const [chart,updateChart] = React.useState(null);
    const ndx = context.trips;
    const div = React.useRef(null);

 
   
    return (
        <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: '1',
          alignItems: 'center',
        }}
      >
         <div  ref={div}  style={{width: 500, height: 250}}></div>  
        
      


          </Box>  


)}


