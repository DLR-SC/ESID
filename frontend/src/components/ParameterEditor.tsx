import React from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import 'katex/dist/katex.min.css';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import MathMarkdown from './shared/MathMarkdown';
import {ParameterData, useGetScenarioParametersQuery} from '../store/services/scenarioApi';
import {useTranslation} from 'react-i18next';

export default function ParameterEditor() {
  const theme = useTheme();
  const {data} = useGetScenarioParametersQuery(1);

  return (
    <TableContainer sx={{background: theme.palette.background.paper, height: '100%'}}>
      <Table stickyHeader size='small' sx={{position: 'relative'}}>
        <TableHead>
          <TableRow>
            <ParameterColumHeader colSpan={2} name='Parameter' />
            <ParameterColumHeader name='0 - 4' />
            <ParameterColumHeader name='5 - 14' />
            <ParameterColumHeader name='15 - 34' />
            <ParameterColumHeader name='35 - 59' />
            <ParameterColumHeader name='60 - 79' />
            <ParameterColumHeader name='80+' />
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((entry) => <ParameterRow key={'row-' + crypto.randomUUID()} params={entry} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ParameterColumHeader(props: Readonly<{name: string; colSpan?: number}>): JSX.Element {
  const theme = useTheme();

  return (
    <TableCell
      colSpan={props.colSpan ?? 1}
      sx={{color: theme.palette.text.disabled, fontSize: '10pt', verticalAlign: 'bottom'}}
    >
      {props.name}
    </TableCell>
  );
}

function ParameterRowHeader(props: Readonly<{symbol: string; description: string}>): JSX.Element {
  return (
    <>
      <TableCell sx={{borderRight: 'none'}}>
        <MathMarkdown>{`$$${props.symbol}$$`}</MathMarkdown>
      </TableCell>
      <TableCell sx={{borderLeft: 'none'}}>
        <Typography variant='subtitle1'>{props.description}</Typography>
      </TableCell>
    </>
  );
}

function ParameterRow(props: Readonly<{params: ParameterData}>): JSX.Element | null {
  const theme = useTheme();
  const {t, i18n} = useTranslation('backend');
  if (!i18n.exists(`parameters.${props.params.key}`, {ns: 'backend'})) {
    return null;
  }

  if (props.params.type === 'MIN_MAX_GROUPED') {
    return (
      <TableRow>
        <ParameterRowHeader
          symbol={t(`parameters.${props.params.key}.symbol`)}
          description={t(`parameters.${props.params.key}.description`)}
        />
        {(props.params.data as Array<{span: number; min: number; max: number}>).map((entry) => (
          <TableCell
            key={`cell-${props.params.symbol}-${crypto.randomUUID()}`}
            colSpan={entry.span}
            sx={{textAlign: 'center', padding: 0}}
          >
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Divider
                sx={{
                  flexGrow: 1,
                  borderBottomStyle: 'dashed',
                  borderBottomWidth: '2px',
                  visibility: entry.span > 1 ? 'visible' : 'hidden',
                }}
              />
              <Typography
                variant='body2'
                sx={{
                  borderWidth: '1px',
                  borderColor: theme.palette.divider,
                  borderStyle: 'solid',
                  borderRadius: '5px',
                  padding: theme.spacing(2),
                }}
              >
                {entry.min === entry.max
                  ? entry.min.toLocaleString(i18n.language)
                  : `${entry.min.toLocaleString(i18n.language)} - ${entry.max.toLocaleString(i18n.language)}`}
              </Typography>
              <Divider
                sx={{
                  flexGrow: 1,
                  borderBottomStyle: 'dashed',
                  borderBottomWidth: '2px',
                  visibility: entry.span > 1 ? 'visible' : 'hidden',
                }}
              />
            </Box>
          </TableCell>
        ))}
      </TableRow>
    );
  } else {
    return (
      <TableRow>
        <ParameterRowHeader symbol={props.params.symbol} description={props.params.key} />
        <TableCell colSpan={6} sx={{textAlign: 'center'}}>
          <MathMarkdown>{props.params.data as string}</MathMarkdown>
        </TableCell>
      </TableRow>
    );
  }
}
