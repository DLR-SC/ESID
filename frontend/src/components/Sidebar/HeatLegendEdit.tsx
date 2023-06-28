import React, {useEffect,useState} from 'react';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HeatLegend from './HeatLegend';
import EditIcon from '@mui/icons-material/Edit';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';



import {
  selectDefaultLegend,
  selectHeatmapLegend,
  setDefaultLegends,
  setHeatmapLegends,
} from '../../store/UserPreferenceSlice';
import {HeatmapLegend} from '../../types/heatmapLegend';
import {useTranslation} from 'react-i18next';




 export default function HeatLegendEdit(): JSX.Element {
   const dispatch = useAppDispatch();
   const activeScenario = useAppSelector((state) => state.dataSelection.scenario);
   const legend = useAppSelector((state) => state.userPreference.selectedHeatmap);
   const presets = useAppSelector((state) => state.userPreference.heatmaps);
   const theme = useTheme();
   const {t} = useTranslation();

   const [showall, setshowall] = useState(false);

 
   const [heatLegendEditOpen, setHeatLegendEditOpen] = React.useState(false);

   const handleChange = (event: SelectChangeEvent) => {
     const preset = presets.find((preset) => preset.name == event.target.value);
     if (preset) {
       dispatch(selectHeatmapLegend({legend: preset}));
     }
   };

   useEffect(() => {
   
     if (legend.name == 'uninitialized') {

       fetch('assets/heatmap_legend_presets.json', {
         headers: {
           'Content-Type': 'application/json',
           Accept: 'application/json',
         },
       })
       .then((response) => {

         return response.json();
       })
       .then(

         (presetList: HeatmapLegend[]) => {
           presetList.forEach((legend) => {
             if (legend.isNormalized) {
               legend.steps.forEach((step) => {

                 step.value = step.value / legend.steps[legend.steps.length - 1].value;


               });
             }
           });

           const defaultLegends: HeatmapLegend[] = [];
           const stepCount = theme.custom.scenarios[0].length - 1;
           for (let i = 0; i < theme.custom.scenarios.length; i++) {

             const steps = [];
             for (let j = 0; j < stepCount; j++) {
               steps.push({color: theme.custom.scenarios[i][stepCount - 1 - j], value: j / (stepCount - 1)});


             }
             defaultLegends.push({name: 'Default', isNormalized: true, steps});
           }
           dispatch(setDefaultLegends({legends: defaultLegends}));

           presetList.unshift(defaultLegends[0]);
  
           dispatch(setHeatmapLegends({legends: presetList}));
          
           dispatch(selectHeatmapLegend({legend: defaultLegends[0]}));
         },
       
         () => {
           console.warn('Did not receive proper heatmap legend presets');
         }
         );

     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
     if (activeScenario) {

       dispatch(selectDefaultLegend({selectedScenario: activeScenario - 1}));
     }
   }, [activeScenario, dispatch]);

   return (
     <>
     <Tooltip title={t('heatlegend.edit').toString()} placement='right' arrow>

     <IconButton
     color={'primary'}
     onClick={() => setHeatLegendEditOpen(true)}
     aria-label={t('heatlegend.edit')}
     size='small'
     sx={{padding: theme.spacing(0), marginBottom: theme.spacing(1)}}
     >

     <EditIcon />
     </IconButton>
     </Tooltip>
     <Dialog maxWidth='lg' fullWidth={true} open={heatLegendEditOpen} onClose={() => setHeatLegendEditOpen(false)}>
     <Box
     sx={{
       padding: theme.spacing(4),
       background: theme.palette.background.paper,
     }}
     >

    
     <span style={{float:'right'}}>
       <FormGroup>
  <FormControlLabel control= {<Switch checked={showall} onChange={() => setshowall(!showall)} />} label={t('heatmapchart.textshow')} labelPlacement="start"/>

    </FormGroup>
     </span>
     <FormControl fullWidth sx={{marginBottom: theme.spacing(3)}}>

     {showall  ? ( 

       <Select id='heatmap-select' aria-label={t('heatlegend.select')} value={legend.name} onChange={handleChange}>
       {presets.map((preset, i) => (


         <MenuItem key={'legendPresetSelect' + i.toString()} value={preset.name}>

         <Grid container maxWidth='lg'>
         <Grid item xs={12}>

         <HeatLegend
         legend={preset}
         exposeLegend={() => {
           return;
         }}
         min={0}
         max={preset.steps[preset.steps.length - 1].value}
         displayText={!preset.isNormalized}
         id={preset.name}
         />

         </Grid>
         <Grid item xs={12}>
         <Typography variant='h2' align='center'>
         {preset.name}
         </Typography>
         </Grid>
         </Grid>
         </MenuItem>
         ))}
       </Select>

       ) :( 

       <Select id='heatmap-select' aria-label={t('heatlegend.select')} value={legend.name} onChange={handleChange}>
       
       
       {presets.slice(0, 4).map((preset, i) => (


         <MenuItem key={'legendPresetSelect' + i.toString()} value={preset.name}>

         <Grid container maxWidth='lg'>
         <Grid item xs={12}>

         <HeatLegend
         legend={preset}
         exposeLegend={() => {
           return;
         }}
         min={0}
         max={preset.steps[preset.steps.length - 1].value}
         displayText={!preset.isNormalized}
         id={preset.name}
         />


         </Grid>
         <Grid item xs={12}>
         <Typography variant='h2' align='center'>
         {preset.name}
         </Typography>
         </Grid>
         </Grid>
         </MenuItem>
         ))}
       </Select>
       )}


       </FormControl>
       <Grid container item justifyContent={'flex-end'}>
       <Button variant='contained' onClick={() => setHeatLegendEditOpen(false)}>
       {t('okay')}
       </Button>
       </Grid>
       </Box>
       </Dialog>
       </>
       );
 }
