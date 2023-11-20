import React from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
 
  ReferenceLine
} from "recharts";

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

export default function App() {
  return (
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
      <XAxis dataKey="name" style={{fontSize:'10px'}}/>
      <YAxis dataKey="name" style={{fontSize:'10px'}}/>
      
      <ReferenceLine y={0} stroke="#000" />
      <Bar dataKey="pv" fill="#8884d8" stackId="stack" />
      <Bar dataKey="uv" fill="#82ca9d" stackId="stack" />
    </BarChart>
  );
}
