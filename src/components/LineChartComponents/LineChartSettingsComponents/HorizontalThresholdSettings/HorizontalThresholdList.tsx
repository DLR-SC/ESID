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
import {HorizontalThreshold} from 'types/horizontalThreshold';
import type {District} from 'types/district';
import HorizontalThresholdItem from './HorizontalThresholdItem';
import ThresholdInput from './ThresholdInput';
import {useTranslation} from 'react-i18next';

export interface HorizontalThresholdListProps {
  /** The list of horizontal thresholds to display */
  horizontalThresholds: Record<string, HorizontalThreshold>;

  /** The function to remove a horizontal threshold. */
  removeHorizontalThreshold: (id: string) => void;

  /** The function to update a horizontal threshold. */
  updateHorizontalThreshold: (newThreshold: HorizontalThreshold) => void;

  /** The selected District */
  selectedDistrict: District;

  /** The selected compartment */
  selectedCompartment: string;

  /** Array of compartment names */
  compartments: Array<{id: string; name: string}>;
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
  removeHorizontalThreshold,
  updateHorizontalThreshold,
  selectedDistrict,
  selectedCompartment,
  compartments,
}: HorizontalThresholdListProps) {
  const {t} = useTranslation();
  const {t: tSettings} = useTranslation('settings');
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [ableToAddThreshold, setAbleToAddThreshold] = useState<boolean>(false);
  const [localThreshold, setLocalThreshold] = useState<number | null>(null);
  const [selectedThresholdKey, setSelectedThresholdKey] = useState<string>(
    `${selectedDistrict.nuts}-${selectedCompartment}`
  );
  const [isAddingThreshold, setIsAddingThreshold] = useState<boolean>(false);
  const [editingThresholdKey, setEditingThresholdKey] = useState<string | null>(null);
  const isValid = localThreshold !== null && localThreshold > 0;

  // Checks if the user is able to add a threshold
  useEffect(() => {
    const key = `${selectedDistrict.nuts}-${selectedCompartment}`;
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
    const thresholdKey = `${selectedDistrict.nuts}-${selectedCompartment}`;
    const existingThreshold = horizontalThresholds[thresholdKey];

    if (existingThreshold) {
      return;
    }

    const districtToAdd = {
      ...selectedDistrict,
      name: selectedDistrict.nuts === '00000' ? 'germany' : selectedDistrict.name,
    };

    const newThreshold: HorizontalThreshold = {
      district: districtToAdd,
      compartment: selectedCompartment ?? '',
      threshold: localThreshold,
    };

    updateHorizontalThreshold(newThreshold);
    setSelectedThresholdKey(thresholdKey);
    setLocalThreshold(null);
    setIsAddingThreshold(false);
  };

  const handleSelectThreshold = (threshold: HorizontalThreshold) => {
    if (isAddingThreshold || editingThresholdKey !== null) {
      return;
    }
    setSelectedThresholdKey(threshold.district.nuts + '-' + threshold.compartment);
    dispatch(selectDistrict(threshold.district));
    dispatch(selectCompartment(threshold.compartment));
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell align='left'>
              <Typography variant='h2'>{tSettings('horizontalThresholds.district')}</Typography>
            </StyledTableCell>
            <StyledTableCell
              sx={{
                minWidth: '170px',
              }}
              align='left'
            >
              <Typography variant='h2'>{tSettings('horizontalThresholds.compartment')}</Typography>
            </StyledTableCell>
            <StyledTableCell
              sx={{
                minWidth: '250px',
              }}
              align='left'
            >
              <Typography variant='h2'>{tSettings('horizontalThresholds.threshold')}</Typography>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        {Object.entries(horizontalThresholds ?? {}).length === 0 && !isAddingThreshold ? (
          <TableBody>
            <TableRow>
              <StyledTableCell colSpan={3} align='center'>
                <Typography variant='h2'>{tSettings('horizontalThresholds.noThresholds')}</Typography>
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
                  removeHorizontalThreshold={removeHorizontalThreshold}
                  updateHorizontalThreshold={updateHorizontalThreshold}
                  districtName={t(`${threshold.district.name}`)}
                  compartmentName={compartments.find((c) => c.id === threshold.compartment)?.name}
                  thresholdValue={threshold.threshold}
                  handleSelectThreshold={handleSelectThreshold}
                  editingThresholdKey={editingThresholdKey}
                  setEditingThresholdKey={setEditingThresholdKey}
                  selected={selectedThresholdKey === key}
                  isEditingThreshold={editingThresholdKey !== null}
                  isAddingThreshold={isAddingThreshold}
                  testId={`threshold-item-${key}`}
                />
              );
            })}
          </TableBody>
        )}
        <TableFooter>
          {isAddingThreshold ? (
            <TableRow
              sx={{
                borderLeft: `2px ${theme.palette.primary.main} solid`,
              }}
              data-testid='add-threshold-table-row-testid'
            >
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
                  {compartments.find((c) => c.id === selectedCompartment)?.name}
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
                const key = `${selectedDistrict.nuts}-${selectedCompartment}`;
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
