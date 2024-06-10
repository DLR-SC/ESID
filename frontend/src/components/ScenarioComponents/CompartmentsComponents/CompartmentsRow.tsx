// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {ListItemButton, ListItemText, ListItemIcon, ClickAwayListener, Tooltip, useTheme} from '@mui/material';
import {InfoOutlined} from '@mui/icons-material';
import {Dispatch, SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {Localization} from 'types/localization';

interface CompartmentsRowProps {
  /* Unique identifier for the row */
  id: number;

  /* Boolean to determine if the row is selected */
  selected: boolean;

  /* Name of the compartment */
  compartment: string;

  /* Value of the compartment */
  value: string;

  /* Boolean to determine if the compartments are expanded */
  compartmentsExpanded: boolean;

  /* Function to set the selected compartment */
  setSelectedCompartment: Dispatch<SetStateAction<string>>;

  /* Minimum number of compartment rows */
  minCompartmentsRows: number;

  /* Localization object for custom language and overrides */
  localization?: Localization;
}

/**
 * This component renders a single row from the compartment List offering also localization support.
 */
export default function CompartmentsRow({
  id,
  selected,
  compartment,
  value,
  compartmentsExpanded,
  setSelectedCompartment,
  minCompartmentsRows,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'backend', overrides: {}},
}: CompartmentsRowProps) {
  const {t: defaultT} = useTranslation();
  const {t: customT} = useTranslation(localization.customLang);
  const theme = useTheme();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const openTooltip = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    setTooltipOpen(true);
  };
  const closeTooltip = () => setTooltipOpen(false);
  return (
    <ListItemButton
      key={id}
      sx={{
        display: compartmentsExpanded || id < minCompartmentsRows ? 'flex' : 'none',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: 2,
        paddingBottom: 2,
        height: '40px',
        bgcolor: `${selected ? theme.palette.background.default : 'none'}`,
        borderLeft: `2px ${selected ? theme.palette.primary.main : 'transparent'} solid`,
        borderTop: `2px ${selected ? theme.palette.background.paper : 'transparent'} solid`,
        borderBottom: `2px ${selected ? theme.palette.background.paper : 'transparent'} solid`,
        '&.MuiListItemButton-root.Mui-selected': {
          backgroundColor: `${selected ? 'white' : theme.palette.background.paper}`,
        },
        alignItems: 'center',
      }}
      selected={selected}
      onClick={() => {
        setSelectedCompartment(compartment);
      }}
    >
      <ListItemText
        primary={
          localization?.overrides && localization?.overrides[`compartments.${compartment}`]
            ? customT(localization?.overrides[`compartments.${compartment}`])
            : defaultT(`compartments.${compartment}`)
        }
        disableTypography={true}
        sx={{
          typography: 'listElement',
          fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
          fontWeight: selected ? 'bold' : 'normal',
          whiteSpace: 'nowrap',
        }}
      />
      <ListItemText
        primary={value}
        disableTypography={true}
        sx={{
          typography: 'listElement',
          fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
          color: selected ? theme.palette.text.primary : theme.palette.text.disabled,
          textAlign: 'right',
          paddingRight: 2,
          whiteSpace: 'nowrap',
        }}
      />
      <ListItemIcon
        id={`info-button-${compartment}`}
        sx={{
          minWidth: 'auto',
        }}
      >
        <ClickAwayListener onClickAway={closeTooltip}>
          <Tooltip
            arrow
            open={tooltipOpen}
            onClose={closeTooltip}
            onClick={openTooltip}
            title={
              localization?.overrides && localization?.overrides[`compartments.${compartment}`]
                ? customT(localization?.overrides[`compartments.${compartment}`])
                : defaultT(`compartments.${compartment}`)
            }
          >
            <InfoOutlined
              sx={{
                color: theme.palette.info.light,
                fontSize: '1rem',
              }}
            />
          </Tooltip>
        </ClickAwayListener>
      </ListItemIcon>
    </ListItemButton>
  );
}
