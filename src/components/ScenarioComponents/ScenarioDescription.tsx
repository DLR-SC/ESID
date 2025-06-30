import React from 'react';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';

export default function ScenarioDescription(): JSX.Element {
  const theme = useTheme();
  const scenario = {
    description: 'In this scenarios we close schools and mandate remote work where possible. ',
    startDate: '2021-11-18',
    endDate: '2021-12-18',
    linkedInterventions: ['Home Office', 'Schools Closed'],
    model: 'SECIRVVS',
    nodeList: 'All Counties',
  };

  return (
    <Box
      sx={{
        width: 'full',
        bgcolor: theme.palette.background.paper,
        overflowX: 'auto',
        overflowY: 'auto',
        height: (248 / 6) * 4,
      }}
    >
      <Box
        sx={{
          padding: 3,
        }}
      >
        <DescriptionSection title='Description' content={scenario.description} />
        <br />
        <DescriptionSection
          title='Dates'
          content={
            new Date(scenario.startDate).toLocaleDateString() + '-' + new Date(scenario.endDate).toLocaleDateString()
          }
        />
        <br />
        <DescriptionSection
          title='Active Interventions'
          content={scenario.linkedInterventions.map((i) => (
            <React.Fragment key={i}>
              • {i}
              <br />
            </React.Fragment>
          ))}
        />
        <br />
        <DescriptionSection title='Model' content={scenario.model} />
        <br />
        <DescriptionSection title='Node List' content={scenario.nodeList} />
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
      <Typography variant='body2' fontSize={fontSize} textAlign='justify'>
        {props.content}
      </Typography>
    </>
  );
}
