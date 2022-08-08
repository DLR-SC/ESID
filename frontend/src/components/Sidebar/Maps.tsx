import React, {useState} from 'react';
import {Tab} from '@mui/material';
import DistrictMap from './DistrictMap';
import {TabContext, TabList, TabPanel} from '@mui/lab';
import SquareMap from './SquareMap';

export default function Maps(): JSX.Element {
  const [tab, setTab] = useState<string>('0');
  const handleTabChange = (_: React.SyntheticEvent, newTab: string) => {
    setTab(newTab);
  };
  return (
    <TabContext value={tab}>
      <TabList onChange={handleTabChange}>
        <Tab label='Default' value='0' />
        <Tab label='test' value='1' />
      </TabList>
      <TabPanel value='0'>
        <DistrictMap />
      </TabPanel>
      <TabPanel value='1'>
        <SquareMap />
      </TabPanel>
    </TabContext>
  );
}
