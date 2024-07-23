import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import  {lineChart, renderAll, seriesChart, rowChart, barChart, numberDisplay, pieChart,units, legend} from "dc";
import crossfilter from "crossfilter";
import  {csvParse, curveLinear, scaleLinear, csv, DSVRowString, scaleOrdinal, scaleBand, curveStepBefore} from 'd3';
import Papa from 'papaparse';
import "./dc.scss";
import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';


async function fetchCsv() {
    const response = await fetch('bs_cols.csv');
    const reader = response.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder('utf-8');
    const csv = await decoder.decode(result.value);
    console.log('csv', typeof csv);
    return csv;
} 


function App() {
    const app = useRef<HTMLDivElement | null>(null);
    const app2 = useRef<HTMLDivElement | null>(null);
    const app3 = useRef<HTMLDivElement | null>(null);
    const app4 = useRef<HTMLDivElement | null>(null);
    const theme = useTheme();
  // const personsPerTripCountChart = rowChart("#App");
     
    useLayoutEffect(() => {


                function getData(result: any) {
                //const csvParse = Papa.parse(result, {header:true});
                
                const csv = csvParse(result)
                const ndx = crossfilter(csv)
                //console.log("ndx", ndx.GroupAll().)
               // const data = ndx.groupAll()
                const personsDim = ndx.dimension(function(d) {return d["personID"];})
                const ageDim = ndx.dimension(function(d) {return d["age"];})
                const durationDim = ndx.dimension(function(d:any) {return Math.floor(d["travelTime"]/60);})
                const vehicleDim = ndx.dimension(function(d) { 
                  
                  if (parseFloat(d.vehicleChoice) == 1) 
                  return "bicycle";
                  else if (parseFloat(d.vehicleChoice) == 2)
                  return "car_driver";
                  else if (parseFloat(d.vehicleChoice) == 3)
                  return "car_codriver";
                  else if (parseFloat(d.vehicleChoice) == 4)
                  return "public_transport";
                  else if (parseFloat(d.vehicleChoice) == 5)
                  return "walk";
                  return 0;
                    });
                
                  const activityDim = ndx.dimension(function(d) { 
                  
                      if (parseFloat(d.ActivityAfter) == 1) 
                      return " work";
                      else if (parseFloat(d.ActivityAfter) == 2)
                      return "education";
                      else if (parseFloat(d.ActivityAfter) == 3)
                      return "shopping";
                      else if (parseFloat(d.ActivityAfter) == 4)
                      return "free_time";
                      else if (parseFloat(d.ActivityAfter) == 5)
                      return "private_matter";
                      else if (parseFloat(d.ActivityAfter) == 6)
                      return "others";
                      else if (parseFloat(d.ActivityAfter) == 7)
                      return "home";
                      else if (parseFloat(d.ActivityAfter) == 0)
                      return "not specified";
                      return 0;
                        });
                const ageRangeDim = ndx.dimension(function(d) {
                
                  if (parseFloat(d.age) <= 7) 
                return "0-7";
                else if (parseFloat(d.age) <= 18) 
                return "8-18";
                else if (parseFloat(d.age) <= 25)
                return "19-25";
                else if (parseFloat(d.age) <= 40) 
                return "26-40";
                else if (parseFloat(d.age) <= 50)
                return "41-50";
                else if (parseFloat(d.age) <= 65) 
                return "51-65";
                else if (parseFloat(d.age) <= 80)
                return "66-80";
                else if (parseFloat(d.age) <= 90) 
                return "81-90";
                else if (parseFloat(d.age)  <= 100)
                return "91-100";
                  
                return 0;
                  });

                const vehicleGroup = vehicleDim.group().reduceCount()
                const personsGroup = personsDim.groupAll().reduceCount().value()//.reduce(reduceAdd, reduceRemove )  
                const ageGroup = ageDim.group().reduceCount()
                const ageRangeGroup = ageRangeDim.group()//.reduceSum()function(d) {return d.;})
                const activityGroup = activityDim.group().reduceCount()
                const durationGroup = durationDim.group().reduceCount()
              //  console.log(durationGroup.top(Infinity) )
               // const test = ageRangeGroup..group().reduceCount();
               // const ageGroup = ageDim.group(( function (v:any) {return Math.ceil(v);}));
             /*   const ageGroup = ageDim.group( function (v:any)    
              {  const temp = [];
                
                if (v <= 7) 
                temp.push("0-7");
                else if (v <= 18) 
                temp.push ("8-18");
                else if (v <= 25)
                temp.push("19-25");
                else if (v <= 40) 
                temp.push ("26-40");
                else if (v <= 50)
                temp.push("41-50");
                else if (v <= 65) 
                temp.push ("51-65");
                else if (v <= 80)
                temp.push("66-80");
                else if (v <= 90) 
                temp.push ("81-90");
                else if (v <= 100)
                temp.push("91-100");
                //console.log("temp", temp);
                return temp;
              });
              */   // console.log("dada", vehicleGroup.all());
                

                /* personsPerTripCountChart
                                    .dimension(persons)
                                    .group(personsGroup); */
                  
        
    //   personsPerTripCountChart.render(); 
     const ageGroupChart = (barChart("#App") as any)
                            //  .width(768)
                           //   .height(480)
                              //.x(scaleLinear().domain([0, 90]))
                              .x (scaleBand())
                              .xUnits(units.ordinal)
                              .xAxisLabel("Age groups")
                              .yAxisLabel("Number of people")
                             // .dimension(ageDim)
                             .dimension(ageRangeDim)
                              .brushOn(false)
                        // .group(ageGroup)
                        .group(ageRangeGroup)
                        .on('renderlet', function(chart: { selectAll: (arg0: string) => { (): any; new(): any; on: { (arg0: string, arg1: (d: any) => void): void; new(): any; }; }; }) {
                          chart.selectAll('rect').on('click', function(d) {
                             console.log('click!', d);
                          });
                       });
 
      const vehicleChart = (pieChart("#App2") as any)
                      // .width(768)
                     //  .height(480)
                       .dimension(vehicleDim)
                  .group(vehicleGroup) 
                //  .legend(legend())
        
                  /* .on('renderlet', function(chart) {
                   chart.selectAll('rect').on('click', function(d) {
                      console.log('click!', d);
                   });
                }); */
       const activityChart = (pieChart("#App3") as any)
                      // .width(768)
                     //  .height(480)
                       .dimension(activityDim)
                  .group(activityGroup)
                  //.legend(legend().horizontal(true))
        
       const durationChart = (lineChart("#App4") as any)
                  //  .width(768)
                 //   .height(480)
                   // .x(scaleLinear().range([0, 400]))
                  .x(scaleLinear().domain([0, 120]))
                    .curve(curveStepBefore)
                    .renderArea(true)
                    .xAxisLabel("Trip duration")
                    .yAxisLabel("Number of trips")
                   // .xUnits(units.integers)
                   .dimension(durationDim)
                   // .brushOn(false)
                    //.renderDataPoints(true)
                    .clipPadding(10)
              .group(durationGroup)
               .on('renderlet', function(chart: { selectAll: (arg0: string) => { (): any; new(): any; on: { (arg0: string, arg1: (d: any) => void): void; new(): any; }; }; }) {
                chart.selectAll('rect').on('click', function(d) {
                   console.log('click!', d);
                });
             });

              ageGroupChart.render()
              vehicleChart.render()   
              activityChart.render()    
              durationChart.render()   
         
                    } fetchCsv().then(getData);       

                   }, [app,app2,app3, app4])

    return (
      <React.Fragment>
            <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexGrow: '1',

        alignItems: 'center',
      }}
    >
          <div  ref={app4} id="App4" style={{width: 500, height: 250}}></div>  
        <div  ref={app} id="App" style={{width: 500, height: 250}}></div>   
        </Box>    
        <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexGrow: '1',
        marginTop: theme.spacing(6),
        alignItems: 'center',
      }}
    >
       
        <div ref={app2} id="App2" style={{width: 500, height: 200}}></div>  
        <div  ref={app3} id="App3" style={{width: 500, height: 200}}></div>      
        </Box>  
        </React.Fragment> 
    );
}

export default App;

// work to be done
/*
   order age group, align legends well and include more charts 1) person charts, dimension is created already. 2) series chart to see when the trips are occuring.
 Example source: https://dc-js.github.io/dc.js/examples/


*/