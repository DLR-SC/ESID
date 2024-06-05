import {ListItemButton, ListItemText, ListItemIcon, ClickAwayListener, Tooltip, useTheme} from '@mui/material';
import {InfoOutlined} from '@mui/icons-material';
import {Dispatch, SetStateAction, useState} from 'react';
import {useTranslation} from 'react-i18next';
import React from 'react';

interface CompartmentsRowProps {
  id: number;
  selected: boolean;
  compartment: string;
  value: string;
  compartmentsExpanded: boolean;
  setSelectedCompartment: Dispatch<SetStateAction<string>>;
  minCompartmentsRows: number;
  localization: {
    numberFormatter: (value: number) => string;
    customLang?: string;
    overrides?: {
      [key: string]: string;
    };
  };
}

export default function CompartmentsRow({
  id,
  selected,
  compartment,
  value,
  compartmentsExpanded,
  setSelectedCompartment,
  minCompartmentsRows,
  localization,
}: CompartmentsRowProps) {
  const {t: defaultT} = useTranslation();
  const customLang = localization.customLang;
  const {t: customT} = useTranslation(customLang || undefined);
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
          localization.overrides && localization.overrides[`compartments.${compartment}`]
            ? customT(localization.overrides[`compartments.${compartment}`])
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
              localization.overrides && localization.overrides['compartments.tooltip']
                ? customT(localization.overrides['compartments.tooltip'])
                : defaultT('compartments.tooltip')
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
