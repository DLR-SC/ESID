// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState} from 'react';
import AddBoxIcon from '@mui/icons-material/AddBox';
import {useTheme} from '@mui/material/styles';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  TableFooter,
  TableBody,
} from '@mui/material';
import styled from '@mui/material/styles/styled';
import {tableCellClasses} from '@mui/material/TableCell';
import {Dictionary} from 'util/util';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import type {District} from 'types/district';
import HorizontalThresholdItem from './HorizontalThresholdItem';
import ThresholdInput from './ThresholdInput';

export interface HorizontalThresholdListProps {
  /** The list of horizontal thresholds to display */
  horizontalThresholds: Dictionary<HorizontalThreshold>;

  /** Callback to handle the deletion of a threshold */
  handleDeleteThreshold: (district: District, compartment: string) => void;

  /** Callback to handle changes to an existing threshold value */
  handleUpdateThreshold: (key: string, value: number) => void;

  /** Callback to handle selection of thresholds */
  handleSelectThreshold: (threshold: HorizontalThreshold) => void;

  /** Callback to handle adding a new threshold */
  handleAddThreshold: () => void;

  /** boolean function to handle flow of adding a new threshold */
  handleIsAddingThreshold: (value: boolean) => void;

  /** A boolean state to see whether a threshold is currently being added */
  isAddingThreshold: boolean;

  /** set the isAddingThreshold  */
  setIsAddingThreshold: React.Dispatch<React.SetStateAction<boolean>>;

  /** local value of threshold  */
  localThreshold: number | null;

  /** function to set local threshold */
  setLocalThreshold: React.Dispatch<React.SetStateAction<number | null>>;

  /** boolean whether it's possible to add a threshold */
  ableToAddThreshold: boolean;

  /** The selected District */
  selectedDistrict: District;

  /** The selected compartment */
  selectedCompartment: string;

  /** The currently selected threshold key */
  selectedThresholdKey: string | null;
}

const StyledTableCell = styled(TableCell)(({theme}) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.background.default,
    border: 0,
    color: theme.palette.text.primary,
  },
}));

export default function HorizontalThresholdList({
  horizontalThresholds,
  handleDeleteThreshold,
  handleUpdateThreshold,
  handleSelectThreshold,
  handleAddThreshold,
  isAddingThreshold,
  handleIsAddingThreshold,
  setIsAddingThreshold,
  selectedDistrict,
  selectedCompartment,
  ableToAddThreshold,
  localThreshold,
  setLocalThreshold,
  selectedThresholdKey,
}: HorizontalThresholdListProps) {
  const theme = useTheme();
  const [editingThresholdKey, setEditingThresholdKey] = useState<string | null>(null);
  const isValid = localThreshold !== null && localThreshold > 0;

  return (
    <Table component={Paper}>
      <TableHead>
        <TableRow>
          <StyledTableCell align='left'>
            <Typography variant='h2'>District</Typography>
          </StyledTableCell>
          <StyledTableCell
            sx={{
              minWidth: '170px',
            }}
            align='left'
          >
            <Typography variant='h2'>Compartment</Typography>
          </StyledTableCell>
          <StyledTableCell
            sx={{
              minWidth: '250px',
            }}
            align='left'
          >
            <Typography variant='h2'>Threshold</Typography>
          </StyledTableCell>
        </TableRow>
      </TableHead>
      {Object.entries(horizontalThresholds ?? {}).length === 0 && !isAddingThreshold ? (
        <TableRow>
          <StyledTableCell colSpan={3} align='center'>
            <Typography variant='h2'>No thresholds set</Typography>
          </StyledTableCell>
        </TableRow>
      ) : (
        <>
          <TableBody>
            {Object.entries(horizontalThresholds ?? {}).map(([key, threshold]) => {
              return (
                <HorizontalThresholdItem
                  key={key}
                  threshold={threshold}
                  thresholdKey={key}
                  handleDeleteThreshold={handleDeleteThreshold}
                  handleUpdateThreshold={handleUpdateThreshold}
                  editingThresholdKey={editingThresholdKey}
                  setEditingThresholdKey={setEditingThresholdKey}
                  selected={selectedThresholdKey === key}
                  handleSelectThreshold={handleSelectThreshold}
                />
              );
            })}
          </TableBody>
        </>
      )}
      <TableFooter>
        {isAddingThreshold ? (
          <TableRow>
            <StyledTableCell align='left'>
              <Typography
                variant='body1'
                sx={{
                  fontSize: theme.typography.listElement.fontSize,
                }}
              >
                {selectedDistrict.name}
              </Typography>
            </StyledTableCell>
            <StyledTableCell align='left'>
              <Typography
                variant='body1'
                sx={{
                  fontSize: theme.typography.listElement.fontSize,
                }}
              >
                {selectedCompartment}
              </Typography>
            </StyledTableCell>

            <StyledTableCell>
              <ThresholdInput
                id='horizontal-y-threshold-input'
                value={localThreshold}
                error={!isValid}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : Number(e.target.value);
                  setLocalThreshold(value);
                }}
                onSave={handleAddThreshold}
                onCancel={() => setIsAddingThreshold(false)}
                isSaveDisabled={!isValid}
              />
            </StyledTableCell>
          </TableRow>
        ) : (
          <TableRow
            sx={{
              ':hover': {
                cursor: 'pointer',
                backgroundColor: theme.palette.action.hover,
              },
            }}
            onClick={() => handleIsAddingThreshold(true)}
          >
            <StyledTableCell
              colSpan={3}
              sx={{
                borderLeft: '0px',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <IconButton
                  aria-label='add Horizontal Y-threshold'
                  sx={{
                    display: 'flex',
                    gap: 2,
                    color: theme.palette.primary.main,
                  }}
                  disabled={!ableToAddThreshold}
                >
                  <AddBoxIcon fontSize='large' />
                </IconButton>
              </Box>
            </StyledTableCell>
          </TableRow>
        )}
      </TableFooter>
    </Table>
  );
}
