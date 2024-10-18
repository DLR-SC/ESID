// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useEffect} from 'react';
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
  TableContainer,
} from '@mui/material';
import styled from '@mui/material/styles/styled';
import {useAppDispatch} from 'store/hooks';
import {selectDistrict, selectCompartment} from 'store/DataSelectionSlice';
import {tableCellClasses} from '@mui/material/TableCell';
import {Dictionary} from 'util/util';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import type {District} from 'types/district';
import HorizontalThresholdItem from './HorizontalThresholdItem';
import ThresholdInput from './ThresholdInput';

export interface HorizontalThresholdListProps {
  /** The list of horizontal thresholds to display */
  horizontalThresholds: Dictionary<HorizontalThreshold>;

  /** A function that sets the horizontal thresholds for the y-axis. */
  setHorizontalThresholds: React.Dispatch<React.SetStateAction<Dictionary<HorizontalThreshold>>>;

  /** The selected District */
  selectedDistrict: District;

  /** The selected compartment */
  selectedCompartment: string;
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
  setHorizontalThresholds,
  selectedDistrict,
  selectedCompartment,
}: HorizontalThresholdListProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [ableToAddThreshold, setAbleToAddThreshold] = useState<boolean>(false);
  const [localThreshold, setLocalThreshold] = useState<number | null>(null);
  const [selectedThresholdKey, setSelectedThresholdKey] = useState<string>(
    `${selectedDistrict.ags}-${selectedCompartment}`
  );
  const [isAddingThreshold, setIsAddingThreshold] = useState<boolean>(false);
  const [editingThresholdKey, setEditingThresholdKey] = useState<string | null>(null);
  const isValid = localThreshold !== null && localThreshold > 0;

  // Checks if the user is able to add a threshold
  useEffect(() => {
    const key = `${selectedDistrict.ags}-${selectedCompartment}`;
    const existingThreshold = horizontalThresholds[key];
    if (existingThreshold) {
      setAbleToAddThreshold(false);
      return;
    }
    setAbleToAddThreshold(true);
  }, [selectedDistrict, selectedCompartment, horizontalThresholds]);

  // function to handle adding a new threshold
  const handleAddThreshold = () => {
    if (localThreshold === null || localThreshold < 0) return;
    const thresholdKey = `${selectedDistrict.ags}-${selectedCompartment}`;
    const existingThreshold = horizontalThresholds[thresholdKey];

    if (existingThreshold) {
      return;
    }

    const newThreshold: HorizontalThreshold = {
      district: selectedDistrict,
      compartment: selectedCompartment ?? '',
      threshold: localThreshold,
    };

    const newThresholds = {...horizontalThresholds, [thresholdKey]: newThreshold};
    setHorizontalThresholds(newThresholds);
    setSelectedThresholdKey(thresholdKey);
    setLocalThreshold(null);
    setIsAddingThreshold(false);
  };

  // function to handle deleting a threshold
  const handleDeleteThreshold = (district: District, compartment: string) => {
    const newThresholds = {...horizontalThresholds};
    delete newThresholds[`${district.ags}-${compartment}`];

    setHorizontalThresholds(newThresholds);
  };

  const handleSelectThreshold = (threshold: HorizontalThreshold) => {
    if (isAddingThreshold) {
      return;
    }
    setSelectedThresholdKey(threshold.district.ags + '-' + threshold.compartment);
    dispatch(selectDistrict(threshold.district));
    dispatch(selectCompartment(threshold.compartment));
  };

  const handleUpdateThreshold = (key: string, value: number) => {
    const existingThreshold = horizontalThresholds[key];

    if (existingThreshold) {
      if (value < 0) return;
      const updatedThreshold: HorizontalThreshold = {
        ...existingThreshold,
        threshold: value,
      };

      const newThresholds = {...horizontalThresholds, [key]: updatedThreshold};

      setHorizontalThresholds(newThresholds);
      setLocalThreshold(null);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
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
          <TableBody>
            <TableRow>
              <StyledTableCell colSpan={3} align='center'>
                <Typography variant='h2'>No thresholds set</Typography>
              </StyledTableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody data-testid='horizontal-table-body-testid'>
            {Object.entries(horizontalThresholds ?? {}).map(([key, threshold]) => {
              return (
                <HorizontalThresholdItem
                  key={key}
                  threshold={threshold}
                  thresholdKey={key}
                  handleDeleteThreshold={handleDeleteThreshold}
                  handleUpdateThreshold={handleUpdateThreshold}
                  handleSelectThreshold={handleSelectThreshold}
                  editingThresholdKey={editingThresholdKey}
                  setEditingThresholdKey={setEditingThresholdKey}
                  selected={selectedThresholdKey === key}
                  testId={`threshold-item-${key}`}
                />
              );
            })}
          </TableBody>
        )}
        <TableFooter>
          {isAddingThreshold ? (
            <TableRow data-testid='add-threshold-table-row-testid'>
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

              <StyledTableCell data-testid='threshold-input-container-testid'>
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
              onClick={() => {
                const key = `${selectedDistrict.ags}-${selectedCompartment}`;
                const existingThreshold = horizontalThresholds[key];

                if (existingThreshold) {
                  // handle error here, maybe show modal
                  return;
                }
                setIsAddingThreshold(true);
              }}
              data-testid='add-threshold-testid'
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
                    data-testid='add-threshold-button-testid'
                  >
                    <AddBoxIcon fontSize='large' />
                  </IconButton>
                </Box>
              </StyledTableCell>
            </TableRow>
          )}
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
