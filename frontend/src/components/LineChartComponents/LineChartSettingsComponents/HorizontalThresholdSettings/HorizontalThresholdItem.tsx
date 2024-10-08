import React, {useState} from 'react';
import {Grid, IconButton, TextField, Typography, Divider, Box} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import {useTheme} from '@mui/material/styles';
import {HorizontalThreshold} from 'types/horizontalThreshold';
import type {District} from 'types/district';
import {selectDistrict, selectCompartment} from 'store/DataSelectionSlice';
import {useAppDispatch} from 'store/hooks';

export interface HorizontalThresholdItemProps {
  /** The threshold item to display */
  threshold: HorizontalThreshold;

  /** The key for the threshold (used for editing and updates) */
  thresholdKey: string;

  /** Callback to handle the deletion of a threshold */
  handleDeleteThreshold: (district: District, compartment: string) => void;

  /** Callback to handle updating the threshold value */
  handleUpdateThreshold: (key: string, value: number) => void;

  /** Current edited key of the threshold */
  editingThresholdKey: string | null;

  /** Callback to set the current edited key of the threshold */
  setEditingThresholdKey: React.Dispatch<React.SetStateAction<string | null>>;

  /** The to determine whether threshold is selected */
  selected: boolean;

  /** Callback to set the currently selected threshold */
  setSelectedThresholdKey: React.Dispatch<React.SetStateAction<string>>;
}

export const HorizontalThresholdItem = ({
  threshold,
  thresholdKey,
  handleDeleteThreshold,
  handleUpdateThreshold,
  editingThresholdKey,
  setEditingThresholdKey,
  selected,
  setSelectedThresholdKey,
}: HorizontalThresholdItemProps) => {
  const [localThreshold, setLocalThreshold] = useState<number>(threshold.threshold);
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const updateThreshold = () => {
    if (localThreshold < 0) return;
    handleUpdateThreshold(thresholdKey, localThreshold);
    setEditingThresholdKey(null);
  };

  const handleEditThreshold = (key: string, threshold: number) => {
    setEditingThresholdKey(key);
    setLocalThreshold(threshold);
  };

  const handleSelectThreshold = (threshold: HorizontalThreshold) => {
    setSelectedThresholdKey(threshold.district.ags + '-' + threshold.compartment);
    dispatch(selectDistrict(threshold.district));
    dispatch(selectCompartment(threshold.compartment));
  };

  return (
    <React.Fragment>
      <Grid
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4,
          paddingY: 1,
          paddingX: 3,
          borderLeft: selected ? `4px solid ${theme.palette.primary.main}` : 'none',
        }}
        onClick={() => handleSelectThreshold(threshold)}
      >
        <Box>
          <Typography variant='h2'>{threshold.district.name}</Typography>
          <Typography variant='subtitle1'>{threshold.compartment}</Typography>
        </Box>

        {editingThresholdKey === thresholdKey ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 4,
              width: '100%',
            }}
          >
            <TextField
              type='number'
              variant='filled'
              label='Threshold'
              value={localThreshold}
              size='small'
              onChange={(e) => setLocalThreshold(Number(e.target.value))}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
              }}
            >
              <IconButton
                aria-label='update Horizontal Y-threshold'
                size='large'
                onClick={updateThreshold}
                sx={{
                  color: theme.palette.success.main,
                }}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                aria-label='cancel update Horizontal Y-threshold'
                size='large'
                onClick={() => setEditingThresholdKey(null)}
                sx={{
                  color: theme.palette.error.main,
                }}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Box>
              <Typography variant='h2'>{threshold.threshold}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => handleEditThreshold(thresholdKey, threshold.threshold)}>
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label='delete Horizontal Y-threshold'
                size='large'
                onClick={() => handleDeleteThreshold(threshold.district, threshold.compartment)}
              >
                <DeleteForeverIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Grid>
      <Divider
        sx={{
          marginY: 2,
        }}
      />
    </React.Fragment>
  );
};
