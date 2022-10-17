import React, {useState} from 'react';
import {Tab} from '@mui/material';
import DistrictMap from './DistrictMap';
import {TabContext, TabList, TabPanel} from '@mui/lab';
import SquareMap from './SquareMap';
import {useTranslation} from 'react-i18next';

export default function Maps(): JSX.Element {
  const {t} = useTranslation();
  const [tab, setTab] = useState<string>('0');
  const handleTabChange = (_: React.SyntheticEvent, newTab: string) => {
    setTab(newTab);
  };
  return (
    <TabContext value={tab}>
      <TabList onChange={handleTabChange}>
        <Tab label={t('sideBar.activeSimulation')} value='0' />
        <Tab label={t('sideBar.multipleSimulations')} value='1' />
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
