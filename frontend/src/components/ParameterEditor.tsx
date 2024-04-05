// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

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
import {useGetGroupSubcategoriesQuery} from '../store/services/groupApi';

/**
 * This component visualizes the parameters of the selected scenario. It uses a table with the following format:
 *
 * | Parameter    |   Group 1   |   Group 2   |   Group 3   |
 * | ------------ | ----------- | ----------- | ----------- |
 * | Parameter 1  | (Min - Max) | (Min - Max) | (Min - Max) |
 * | Parameter 2  | (Min - Max) | (Min - Max) | (Min - Max) |
 * | Parameter 3  | (Min - Max) | (Min - Max) | (Min - Max) |
 *
 * The parameter always consists of a symbol and a description. The symbol is in latex equation format. The groups could
 * be different socio-economic groups, e.g. age.
 */
export default function ParameterEditor() {
  const {t} = useTranslation('backend');
  const theme = useTheme();
  const {data} = useGetScenarioParametersQuery(1);
  const {data: groups} = useGetGroupSubcategoriesQuery();

  return (
    <TableContainer sx={{background: theme.palette.background.paper, height: '100%'}}>
      <Table stickyHeader size='small' sx={{position: 'relative'}}>
        <TableHead>
          <TableRow>
            <ParameterColumHeader colSpan={2} name='Parameter' />
            {groups?.results // Currently only age groups are supported. We also need to ignore the 'total' group.
              ?.filter((group) => group.key !== 'total')
              .filter((group) => group.category === 'age')
              .map((group) => <ParameterColumHeader key={group.key} name={t(`group-filters.groups.${group.key}`)} />)}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((entry) => <ParameterRow key={'row-' + crypto.randomUUID()} params={entry} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * A simple header component.
 * It creates a table cell with the given header name, and it spans by default one column.
 */
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

/**
 * This component creates the header for each parameter.
 * The symbol is the scientific symbol for the parameter in latex equation format. The description explains the
 * parameter in a single sentence.
 */
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

/**
 * Depending on the type of parameter, this component renders different types of parameter rows.
 */
function ParameterRow(props: Readonly<{params: ParameterData}>): JSX.Element | null {
  const {t} = useTranslation('backend');

  return (
    <TableRow>
      <ParameterRowHeader
        symbol={t(`parameters.${props.params.key}.symbol`)}
        description={t(`parameters.${props.params.key}.description`)}
      />
      {((): JSX.Element | null => {
        // jsx inline switch case
        switch (props.params.type) {
          case 'MIN_MAX_GROUPED':
            return <ParameterRowMinMaxGrouped params={props.params} />;
          case 'COMPUTED':
            return <ParameterRowComputed params={props.params} />;
          default:
            return null;
        }
      })()}
    </TableRow>
  );
}

/**
 * Renders parameter values for all groups with min and max values.
 * If min and max are identical only one value is shown.
 */
function ParameterRowMinMaxGrouped(props: Readonly<{params: ParameterData}>): Array<JSX.Element> {
  const theme = useTheme();
  const {i18n} = useTranslation('backend');

  return (props.params.data as Array<{span: number; min: number; max: number}>).map((entry) => (
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
  ));
}

/**
 * Renders an equation which makes up the parameter.
 * The equation is spanning over the whole row.
 */
function ParameterRowComputed(props: Readonly<{params: ParameterData}>): JSX.Element {
  return (
    <TableCell colSpan={6} sx={{textAlign: 'center'}}>
      <MathMarkdown>{props.params.data as string}</MathMarkdown>
    </TableCell>
  );
}
