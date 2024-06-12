// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useEffect, useState} from 'react';
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
import {ParameterData, useGetScenarioParametersQuery, useGetSimulationsQuery} from '../store/services/scenarioApi';
import {useTranslation} from 'react-i18next';
import {useGetGroupSubcategoriesQuery} from '../store/services/groupApi';
import {useAppSelector} from '../store/hooks';
import GridOff from '@mui/icons-material/GridOff';

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
  const {t} = useTranslation();
  const theme = useTheme();

  const [scenarioId, setScenarioId] = useState<number | null>(null);

  const selectedScenario = useAppSelector((state) => state.dataSelection.scenario);
  const {data: simulations} = useGetSimulationsQuery();
  const {data: parameters} = useGetScenarioParametersQuery(scenarioId);

  // This effect gets the id of the scenario, where the parameters are stored.
  useEffect(() => {
    const scenario = simulations?.results.find((sim) => sim.id === selectedScenario);

    // The scenario id is unfortunately hidden in a URL. It is always the last number in the URL, so we use the
    // following regex to extract that number.
    const scenarioIdResult = scenario?.scenario.match(/(\d+)(?!.*\d)/);
    if (scenarioIdResult) {
      const id = parseInt(scenarioIdResult[0]);
      setScenarioId(id);
    } else {
      setScenarioId(null);
    }
  }, [simulations, selectedScenario]);

  if (scenarioId !== null) {
    return (
      <TableContainer sx={{background: theme.palette.background.paper, height: '100%'}}>
        <Table stickyHeader size='small' sx={{position: 'relative'}}>
          <TableHeader />
          <TableBody>
            {parameters?.map((entry) => <ParameterRow key={'row-' + crypto.randomUUID()} params={entry} />)}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box sx={{background: theme.palette.background.paper, display: 'flex', flexDirection: 'column', height: '100%'}}>
      <TableContainer>
        <Table stickyHeader size='small' sx={{position: 'relative'}}>
          <TableHeader />
        </Table>
      </TableContainer>
      <Box
        sx={{
          margin: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <GridOff color='primary' fontSize='large' />
        <Typography variant='body1'>{t('parameters.no-parameters')}</Typography>
      </Box>
    </Box>
  );
}

/**
 * Creates the header row of the parameter editor.
 */
function TableHeader(): JSX.Element {
  const {t: tBackend} = useTranslation('backend');
  const {data: groups} = useGetGroupSubcategoriesQuery();
  return (
    <TableHead>
      <TableRow>
        <ParameterColumHeader colSpan={2} name='Parameter' />
        {groups?.results // Currently only age groups are supported. We also need to ignore the 'total' group.
          ?.filter((group) => group.key !== 'total')
          .filter((group) => group.category === 'age')
          .map((group) => (
            <ParameterColumHeader key={group.key} name={tBackend(`group-filters.groups.${group.key}`)} />
          ))}
      </TableRow>
    </TableHead>
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
function ParameterRowHeader(props: Readonly<{symbol: string; description: string; unit: string}>): JSX.Element {
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
        unit={t(`parameters.${props.params.key}.unit`)}
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
  const {t, i18n} = useTranslation('backend');

  const getContent = useCallback(
    (min: number, max: number) => {
      const unit = t(`parameters.${props.params.key}.unit`);
      if (unit === '%') {
        min *= 100;
        max *= 100;
      }

      if (min === max) {
        return `${min.toLocaleString(i18n.language)}\u202F${unit}`;
      } else {
        return `${min.toLocaleString(i18n.language)} - ${max.toLocaleString(i18n.language)}\u202F${unit}`;
      }
    },
    [i18n.language, props.params.key, t]
  );

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
          {getContent(entry.min, entry.max)}
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
