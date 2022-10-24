import React from 'react';
import { Box, Typography } from "@mui/material";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

export function ManageGroupDialog(): JSX.Element {
  const {t} = useTranslation();
  const theme = useTheme();

  const filterList = useAppSelector((state) => state.dataSelection.filter);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      flexGrow: '1',
      padding: theme.spacing(4),
      alignItems: 'center'
    }}>
      <Typography variant='h1'>{t('group-filters.title')}</Typography>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        flexGrow: '1',
      }}>
        <Box sx={{
          minWidth: '300px',
          borderRight: 'black 1px solid',
          marginRight: theme.spacing(3)
        }}>
          <Typography variant='h2'>
            {t('group-filters.list-title')}
          </Typography>
          {filterList?.map((item) => (
            <div key={item.name}>
              {item.name}
            </div>
          ))}
        </Box>


        <Box sx={{
          display: 'flex',
          flexGrow: '1',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography variant='body1'>
            {t('group-filters.nothing-selected')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

