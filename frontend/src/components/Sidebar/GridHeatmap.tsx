import React, {useEffect, useRef, useState} from 'react';
import * as am5core from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {useTheme} from '@mui/material/styles';
import {Box} from '@mui/material';
import {useGetMultipleSimulationDataByDateQuery} from 'store/services/scenarioApi';
import {useTranslation} from 'react-i18next';
import {NumberFormatter} from 'util/hooks';
import LoadingContainer from '../shared/LoadingContainer';
import CountyItem from 'components/Sidebar/SearchBar'

/* This component displays the evolution of the pandemic for a specific compartment (hospitalized, dead, infected, etc.) regarding the different scenarios
 */

// deviations toggle (TODO)
//const drawDeviations = false;

/**
 * React Component to render the Simulation Chart Section
 * @returns {JSX.Element} JSX Element to render the scenario chart container and the scenario graph within.
 */

 interface CountyItem {
  value: number;
  comp: string;
  /** ID for the district (Amtlicher Gemeindeschlüssel) (same as ags in store). */
  RS: string;
  /** Label/Name of the district (same as the name in the data store). */
  GEN: string;
  /** Region type identifier (same as the type in the data store). */
  BEZ: string;
}


/*  interface ByNodeCompartmentId{
  Node?: string;
  Compartment?: string;
  value1?:number;
 // value2?:number;
}
  */

export default function GridHeatmap(): JSX.Element {
  const {t, i18n} = useTranslation();
  const theme = useTheme();
  const scenarioList = useAppSelector((state) => state.scenarioList);
  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const selectedDate = useAppSelector((state) => state.dataSelection.date);
  const [countyItem, setCountyList] = useState<Array<CountyItem>>([]);
 // const [getcompartmentValues, setCompartmentValues] = useState<Dictionary<number> | null>(null);
  const node = useAppSelector((state) => state.dataSelection.district?.ags);
  const dispatch = useAppDispatch();
  const {data, isFetching} = useGetMultipleSimulationDataByDateQuery(
  {   
       // take scenario ids and flatten them into array
      ids: Object.entries(scenarioList.scenarios).map(([, scn]) => scn.id),
      day:  selectedDate ?? '',
      node: node,
      group: 'total',
      compartments: compartments
  },

  );
/*   type ByNodeCompartmentId = {
    Node?: Array<string>;
    Compartment?: Array<string>;
    Id1?:Array<number>;
    Id2?:Array<number>;
  } 
 */

 // type ByIdNodeCompartments = Dictionary<Map<string, {[key: string]: number}>>; 


  //const dataHeatmap:  ByIdNodeCompartments={};
//  const dataHeatmap: ByNodeCompartmentId ={}
  const {formatNumber} = NumberFormatter(i18n.language, 3, 8);

  const chartRef = useRef<am5xy.XYChart | null>(null);
  const rootRef = useRef<am5core.Root | null>(null);

 useEffect(() =>{
    {
      // get option list from assets
      fetch('assets/lk_germany_reduced_list.json', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then((response) => {
          // interpret content as JSON
          return response.json();
        })
        
        .then((jsonlist: CountyItem[]) =>
        {        
          // fill countyList state with list
          setCountyList(jsonlist);
        },
    
        // Reject Promise
        () => {
          console.warn('Did not receive proper county list');
        }
        );             
    }  
  }, [])


  useEffect(() => {
    // Create chart instance (is called when props.scenarios changes)
    const root =  am5core.Root.new('griddiv');
     const chart = root.container.children.push(am5xy.XYChart.new(root, {
     panX: false,
     panY: false,
     wheelX: "none",
     wheelY: "none",
     layout: root.verticalLayout
   }));


    // Create axes and their renderers
    const yRenderer = am5xy.AxisRendererY.new(root, {
      visible: false,
      minGridDistance: 20,
      inversed: true
    });

    yRenderer.grid.template.set("visible", false);

    const compartmentAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: yRenderer as am5xy.AxisRenderer,
        categoryField: "compartment"
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
      visible: false,
      minGridDistance: 30,
      inversed: true
    });

    xRenderer.grid.template.set("visible", false);
 

    const districtAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: xRenderer as am5xy.AxisRenderer,
        categoryField: "district"
      })
    );

    districtAxis.get("renderer").labels.template.setAll({
      rotation: -90,
      centerY: am5core.p50,
      centerX: am5core.p100,
      paddingRight: 15
    });
    
    const districtCategories = countyItem.map((county) => {return {category: county.GEN}});
    districtAxis.data.setAll(districtCategories);
    compartmentAxis.data.setAll(compartments.map((compartment) => { return {category: compartment}}));
   

    // Add series for 
    const gridSeries = chart.series.push(am5xy.ColumnSeries.new(root,{
      calculateAggregates: true,
      stroke: am5core.color(0xffffff),
      clustered: false,
      xAxis: compartmentAxis,
      yAxis: districtAxis,
      categoryXField: "district",
      categoryYField: "compartment",
      valueField: "value"
    }));

    gridSeries.columns.template.setAll({
      tooltipText: "{value}",
      strokeOpacity: 1,
      strokeWidth: 2,
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      cornerRadiusBL: 5,
      cornerRadiusBR: 5,
      width: am5core.percent(100),
      height: am5core.percent(100)
     // templateField: "columnSettings"
    })


    gridSeries.set("heatRules", [{
      target: gridSeries.columns.template,
      dataField: "value",
      min: am5core.color(0xff621f),
      max: am5core.color(0x661F00),
      key: "fill"
    }])

     chartRef.current = chart;
     rootRef.current = root;
    return () => {
      chartRef.current && chartRef.current.dispose();
      rootRef.current && rootRef.current.dispose();
      chart.dispose();
      root.dispose();
    }; 
  }, [scenarioList, dispatch, i18n.language, t, theme, formatNumber, countyItem]);


   // Effect to update Simulation and RKI Data
 useEffect(() => {
    if (
      chartRef.current && 
      data &&
      data.length > 0 &&
      selectedDate  
    ) 
      {
      
        const gridSeries = chartRef.current.series.getIndex(0) as am5xy.ColumnSeries;
        console.log("gridseries", gridSeries)
      
        if (!isFetching) {
              // Map compartment value to RS
            const dataMapped: Map<[string, string],number>= new Map<[string, string], number>();
            data[1].results.forEach((entry) => {
              const rs = entry.name;
              for (const j in entry.compartments) {
                
                dataMapped.set([rs, j], entry.compartments[j]);
            }
            });

        gridSeries.data.setAll((() => {
          const result: any = [];
          dataMapped.forEach((value, key) => {
            result.push({
                   'district': key[0],
                  'compartment': key[1],
                   value: value
                },);
          });
      
          return result;
        })())

/*         gridSeries.columns.each((cols) =>{
          const colData = cols.dataItem?.dataContext as CountyItem
          //colData.value = dataMapped.get(colData.RS) || Number.NaN;




        }) */
        
      
      
      }

      }

     }, [
      data,
      theme,
      dispatch,
      isFetching,
      formatNumber,
      t,
      countyItem
    ]); 
 


  return (
    <LoadingContainer
      sx={{width: '100%', height: '100%'}}
      show={isFetching}
      overlayColor={theme.palette.background.paper}
    >
      <Box
        id='griddiv'
        sx={{
          height: '100%',
          minHeight: '700px',
          width: '100%',
          minWidth: '200px',
          margin: 0,
          padding: 0,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'radial-gradient(#E2E4E6 10%, transparent 11%)',
          backgroundSize: '10px 10px',
          cursor: 'crosshair',
        }}
      />
    </LoadingContainer>
  );
}
