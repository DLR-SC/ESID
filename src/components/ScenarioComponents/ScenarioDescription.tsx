// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';

interface ScenarioDescriptionProps {
  description: string;
  startDate: string;
  endDate: string;
  linkedInterventions: string[];
  model: string;
  nodeList: string;
}

export default function ScenarioDescription({
  description,
  startDate,
  endDate,
  linkedInterventions,
  model,
  nodeList,
}: ScenarioDescriptionProps): JSX.Element {
  const {t} = useTranslation();

  return (
    <Box
      sx={{
        width: 'full',
        overflowX: 'auto',
        overflowY: 'auto',
        height: (264 / 6) * 4,
      }}
    >
      <Box
        sx={{
          padding: 3,
        }}
      >
        <DescriptionSection title={t('scenario.description')} content={description} />
        <br />
        <DescriptionSection title={t('scenario.dates')} content={startDate + '-' + endDate} />
        <br />
        <DescriptionSection
          title={t('scenario.active-npis')}
          content={
            linkedInterventions.length > 0
              ? linkedInterventions.map((i) => (
                  <React.Fragment key={i}>
                    • {i}
                    <br />
                  </React.Fragment>
                ))
              : '-'
          }
        />
        <br />
        <DescriptionSection title={t('scenario.model')} content={model} />
        <br />
        <DescriptionSection title={t('scenario.regions')} content={nodeList} />
      </Box>
    </Box>
  );
}

function DescriptionSection(props: {title: string; content: string | JSX.Element | JSX.Element[]}): JSX.Element {
  const fontSize = '11pt';

  return (
    <>
      <Typography variant='h5' fontSize={fontSize}>
        {props.title}
      </Typography>
      <div style={{height: '6px'}} />
      <Typography variant='body2' fontSize={fontSize}>
        {props.content}
      </Typography>
    </>
  );
}
