import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,

  ReferenceLine
} from "recharts";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400
  },
  {
    name: "Page B",
    uv: -3000,
    pv: 1398,
    amt: 2210
  },
  {
    name: "Page C",
    uv: -2000,
    pv: -9800,
    amt: 2290
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000
  },

];

export default function BarchartStack(): JSX.Element {

  const [age, setAge] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  return (
    <Stack sx={{ overflow: "scroll", height: '400px' }}>
      <Stack spacing={2} direction="row" sx={{ paddingTop: '20px', mx: 'auto' }}>

      </Stack>
      <div>
        <Box sx={{ display: "flex", paddingTop: '20px', paddingRight: '20px' }}>
          <Box width={140}> <h5 >vaccinated</h5></Box>
          <Box
            sx={{

              width: 400,
              maxWidth: '100%',
              height: 7,
            }}>
            <TextField fullWidth label="fullWidth" id="fullWidth" /></Box>
        </Box>
      </div>
      <br></br>
      <br></br>
      <div>
        <BarChart
          width={300}
          height={200}
          data={data}
          stackOffset="sign"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" style={{ fontSize: '10px' }} />
          <YAxis style={{ fontSize: '10px' }} />

          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="pv" fill="#8884d8" stackId="stack" />
          <Bar dataKey="uv" fill="#82ca9d" stackId="stack" />
        </BarChart>

      </div>
      <Box sx={{ display: "flex", paddingRight: '20px', paddingTop: '20px' }}>
        <Box width={100}> <h5 >Detail 1</h5></Box>

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

      <Box sx={{ display: "flex", paddingTop: '20px', paddingRight: '20px' }}>
        <Box width={100}> <h5 >Detail 2</h5></Box>

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

      <Box sx={{ display: "flex", paddingTop: '20px', paddingRight: '20px' }}>
        <Box width={100}> <h5 >Detail 3</h5></Box>

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
      <Box sx={{ display: "flex", paddingTop: '20px', paddingRight: '20px' }}>
        <Box width={100}> <h5 >Detail 4</h5></Box>

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

      {/* <Stack spacing={4} direction="row" sx={{paddingTop:'20px',mx: 'auto'}}>
      <Button variant="outlined">Back</Button>
      <Button variant="outlined">Cancel</Button>
      <Button variant="outlined">Save</Button>
    </Stack> */}

    </Stack>
  );
}