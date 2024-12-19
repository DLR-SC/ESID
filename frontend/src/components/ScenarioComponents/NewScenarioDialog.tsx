// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {dateToISOString} from '../../util/util';
import dayjs, {Dayjs} from 'dayjs';
import {useTranslation} from 'react-i18next';

interface ScenarioFormProps {
  models: string[];
  npiOptions: Array<{id: string; name: string}>;
  nodeOptions: string[];
  onSubmit: (scenarioData: NewScenarioData | null) => void;
}

export interface NewScenarioData {
  name: string;
  description: string;
  model: string;
  startDate: string;
  endDate: string;
  npis: string[];
  selectedNode: string;
}

export default function NewScenarioDialog({models, npiOptions, nodeOptions, onSubmit}: ScenarioFormProps) {
  const {t} = useTranslation();

  const [formData, setFormData] = React.useState<NewScenarioData>({
    name: '',
    description: '',
    model: models[0],
    startDate: dateToISOString(dayjs().subtract(1, 'day').toDate()),
    endDate: dateToISOString(dayjs().add(4, 'week').add(1, 'day').toDate()),
    npis: [],
    selectedNode: nodeOptions[0],
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof NewScenarioData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewScenarioData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('scenario-library.new.name-required');
    }
    if (!formData.model) {
      newErrors.model = t('scenario-library.new.model-required');
    }
    if (!formData.selectedNode) {
      newErrors.selectedNode = t('scenario-library.new.node-required');
    }
    if (dayjs(formData.endDate).isBefore(dayjs(formData.startDate))) {
      newErrors.endDate = t('scenario-library.new.date-order');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleReset = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(null);
  };

  const handleNPIChange = (npi: string) => {
    const newNPIs = formData.npis.includes(npi)
      ? formData.npis.filter((item) => item !== npi)
      : [...formData.npis, npi];

    setFormData((prev) => ({
      ...prev,
      npis: newNPIs,
    }));
  };

  return (
    <Box component='form' onSubmit={handleSubmit} onReset={handleReset} sx={{margin: '16px', p: 2}}>
      <Typography variant='h5' gutterBottom>
        {t('scenario-library.new.title')}
      </Typography>

      <TextField
        fullWidth
        label={t('scenario-library.new.name')}
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({...prev, name: e.target.value}))}
        error={!!errors.name}
        helperText={errors.name}
        margin='normal'
        required
      />

      <TextField
        fullWidth
        label={t('scenario-library.new.description')}
        multiline
        rows={4}
        value={formData.description}
        onChange={(e) => setFormData((prev) => ({...prev, description: e.target.value}))}
        margin='normal'
      />

      <Box sx={{display: 'flex', gap: '4px', my: 2}}>
        <DatePicker<Dayjs>
          label={t('scenario-library.new.start-date')}
          value={dayjs(formData.startDate)}
          disabled={true}
          onChange={(date) =>
            setFormData((prev) => ({
              ...prev,
              startDate: dateToISOString((date ?? dayjs().subtract(1, 'day')).toDate()),
            }))
          }
        />
        <DatePicker<Dayjs>
          label={t('scenario-library.new.end-date')}
          value={dayjs(formData.endDate)}
          disabled={true}
          onChange={(date) =>
            setFormData((prev) => ({
              ...prev,
              endDate: dateToISOString(date?.toDate() ?? dayjs().add(4, 'week').add(1, 'day').toDate()),
            }))
          }
        />
      </Box>

      <FormControl fullWidth margin='normal' error={!!errors.npis} required>
        <Typography variant='subtitle1' gutterBottom>
          {t('scenario-library.new.interventions')}
        </Typography>
        <FormGroup>
          {npiOptions.map((npi) => (
            <FormControlLabel
              key={npi.id}
              control={<Checkbox checked={formData.npis.includes(npi.id)} onChange={() => handleNPIChange(npi.id)} />}
              label={npi.name}
            />
          ))}
        </FormGroup>
      </FormControl>

      <FormControl fullWidth margin='normal' error={!!errors.model} required>
        <InputLabel>{t('scenario-library.new.model')}</InputLabel>
        <Select
          value={formData.model}
          disabled={true}
          label={t('scenario-library.new.model')}
          onChange={(e) => setFormData((prev) => ({...prev, model: e.target.value}))}
        >
          {models.map((model) => (
            <MenuItem key={model} value={model}>
              {model}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin='normal' error={!!errors.selectedNode} required>
        <InputLabel>{t('scenario-library.new.node-list')}</InputLabel>
        <Select
          value={formData.selectedNode}
          label={t('scenario-library.new.node-list')}
          disabled={true}
          onChange={(e) => setFormData((prev) => ({...prev, selectedNode: e.target.value}))}
        >
          {nodeOptions.map((node) => (
            <MenuItem key={node} value={node}>
              {node}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
        <Button type='submit' variant='contained' color='primary' sx={{mt: 3}}>
          {t('scenario-library.new.create')}
        </Button>
        <Button type='reset' variant='contained' color='error' sx={{mt: 3}}>
          {t('scenario-library.new.cancel')}
        </Button>
      </Box>
    </Box>
  );
}
