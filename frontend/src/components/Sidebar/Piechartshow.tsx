import * as React from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { PieChart, Pie } from "recharts";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';

const data01 = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 }
];
const data02 = [
  { name: "A1", value: 100 },
  { name: "A2", value: 300 },
  { name: "B1", value: 100 },
  { name: "B2", value: 80 },
  { name: "B3", value: 40 },
  { name: "B4", value: 30 },
  { name: "B5", value: 50 },
  { name: "C1", value: 100 },
  { name: "C2", value: 200 },
  { name: "D1", value: 150 },
  { name: "D2", value: 50 }
];



export default function Piechartshow(): JSX.Element {
  const [age, setAge] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };
  return (
    <Stack sx={{overflow: "scroll", height:'400px'}}>
      <Stack spacing={2} direction="row" sx={{paddingTop:'20px',mx: 'auto'}}>

    </Stack>
    
    <div>
    <Box sx={{display:"flex", paddingTop:'20px',paddingRight:'20px'}}>
  <Box width={140}> <h5 >vaccinated</h5></Box>
  <Box
  sx={{
        width: 400,
        maxWidth: '100%',
        height:7,
      }}>
      <TextField fullWidth label="fullWidth" id="fullWidth" /></Box>
    </Box>
      </div>
      
    <PieChart width={400} height={320}>
      <Pie
        data={data01}
        dataKey="value"
        outerRadius={60}
        fill="#8884d8"
      />
      <Pie
        data={data02}
        dataKey="value"
        innerRadius={70}
        outerRadius={90}
        fill="#82ca9d"
        label
      />
    </PieChart>

<Box sx={{display:"flex",paddingRight:'10px' }}>
  <Box width={140}> <h5 >Detail 1</h5></Box>
 
<FormControl fullWidth>
  <InputLabel id="demo-simple-select-label">Age</InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    value={age}
    label="Age"
    onChange={handleChange}
  >
    <MenuItem value={10}>Ten</MenuItem>
    <MenuItem value={20}>Twenty</MenuItem>
    <MenuItem value={30}>Thirty</MenuItem>
  </Select>
</FormControl>
</Box>

<Box sx={{display:"flex", paddingTop:'20px',paddingRight:'20px'}}>
  <Box width={140}> <h5 >Detail 1</h5></Box>
 
<FormControl fullWidth>
  <InputLabel id="demo-simple-select-label">Age</InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    value={age}
    label="Age"
    onChange={handleChange}
  >
    <MenuItem value={10}>Ten</MenuItem>
    <MenuItem value={20}>Twenty</MenuItem>
    <MenuItem value={30}>Thirty</MenuItem>
  </Select>
</FormControl>
</Box>

<Box sx={{display:"flex",paddingTop:'20px',paddingRight:'20px'}}>
  <Box width={140}> <h5 >Detail 1</h5></Box>
 
<FormControl fullWidth>
  <InputLabel id="demo-simple-select-label">Age</InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    value={age}
    label="Age"
    onChange={handleChange}
  >
    <MenuItem value={10}>Ten</MenuItem>
    <MenuItem value={20}>Twenty</MenuItem>
    <MenuItem value={30}>Thirty</MenuItem>
  </Select>
</FormControl>
</Box>
<Box sx={{display:"flex",paddingTop:'20px',paddingRight:'20px'}}>
  <Box width={140}> <h5 >Detail 1</h5></Box>
 
<FormControl fullWidth>
  <InputLabel id="demo-simple-select-label">Age</InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    value={age}
    label="Age"
    onChange={handleChange}
  >
    <MenuItem value={10}>Ten</MenuItem>
    <MenuItem value={20}>Twenty</MenuItem>
    <MenuItem value={30}>Thirty</MenuItem>
  </Select>
</FormControl>
</Box>

<Stack spacing={4} direction="row" sx={{paddingTop:'20px',mx: 'auto'}}>
      {/* <Button variant="outlined">Back</Button>
      <Button variant="outlined">Cancel</Button>
      <Button variant="outlined">Save</Button> */}
    </Stack>
 </Stack>

 
  );
}