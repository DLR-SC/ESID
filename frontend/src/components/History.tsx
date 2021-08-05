import React from 'react';
import {makeStyles, withStyles, Theme, createStyles} from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {useTranslation} from 'react-i18next';
import List from '@material-ui/core/List';
import {Box} from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CallMadeIcon from '@material-ui/icons/CallMade';

/* The history componenent displays the restrictions occured during a pandemic
   classified by month-Year. Each specific month is associated with a list of events */

const AntTabs = withStyles({
  root: {
    borderBottom: '1px solid #e8e8e8',
  },
})(Tabs);

const AntTab = withStyles(() =>
  createStyles({
    root: {
      textTransform: 'none',
      '&:focus': {
        fontWeight: 'bold',
      },

      '&:not(:first-of-type)': {
        marginLeft: 3,
        color: 'black',
      },
      '&:not(:last-of-type)': {
        color: 'black',
      },
    },
  })
)((props: StyledTabProps) => <Tab disableRipple {...props} />);

interface StyledTabProps {
  label: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  Tab: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  history: {
    overflow: 'auto',
    maxHeight: '30vh',
    position: 'relative',

    backgroundColor: theme.palette.background.paper,
  },
  PeriodContainer: {
    position: 'relative',
    backgroundColor: '#F2F2F2',
  },
  EventContainer: {
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function History(): JSX.Element {
  const {t} = useTranslation('global');
  const classes = useStyles();

  const [value, setValue] = React.useState(0);
  const handleChange = (_event: React.ChangeEvent<Record<string, never>>, value: number) => {
    value === 1 ? setValue(1) : setValue(0);
  };

  // Events list, later data will be fetched from the backend.
  const eventperiod = [
    {id: 1, day: '24', month: 'January', year: '2020'},
    {id: 2, day: '24', month: 'January', year: '2020'},
    {id: 3, day: '24', month: 'January', year: '2020'},
    {id: 4, day: '24', month: 'January', year: '2020'},
  ];

  const eventcontent = [
    {id: 1, idperiod: 1, eventlabel: 'event content'},
    {id: 2, idperiod: 1, eventlabel: 'event content'},
    {id: 3, idperiod: 1, eventlabel: 'event content'},
    {id: 4, idperiod: 2, eventlabel: 'event content'},
    {id: 5, idperiod: 2, eventlabel: 'event content'},
    {id: 6, idperiod: 2, eventlabel: 'event content'},
    {id: 7, idperiod: 3, eventlabel: 'event content'},
    {id: 8, idperiod: 4, eventlabel: 'event content'},
  ];

  // Dislay period
  const DisplayHistory = eventperiod.map((period, index) => (
    <List key={index}>
      <Box pl={9}>
        <ListItemText secondary={period.month} />
      </Box>
      <Box
        style={{
          border: '1.5px solid ',
          borderLeft: 0,
          borderRight: 0,
          borderImage: 'linear-gradient(360deg, #dee1e1 10%, #f4f4f4 360%)',
          borderImageSlice: 1,
        }}
      >
        {/* Display events */}
        {eventcontent.map((event, index2) =>
          period.id === event.idperiod ? (
            <Box key={index2} className={classes.EventContainer}>
              <ListItem disableGutters={false}>
                <ListItemIcon>
                  <CallMadeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText secondary={event.eventlabel} />
              </ListItem>
            </Box>
          ) : null
        )}
      </Box>
    </List>
  ));

  return (
    <div className={classes.Tab}>
      <AntTabs
        TabIndicatorProps={{
          style: {
            backgroundColor: '#D3D2D8',
          },
        }}
        value={value}
        onChange={handleChange}
        style={{
          borderTop: '1.5px solid',
          borderImage: 'linear-gradient(360deg, #dee1e1 10%, #f4f4f4 360%)',
          borderImageSlice: 1,
          borderBottom: 0,
        }}
      >
        {/* Set table labels */}
        <AntTab label={t('history.placeholder')} />
        <AntTab label={t('details.placeholder')} />
      </AntTabs>
      {value === 0 ? ( //History Tab content
        <Box className={classes.history}>
          <Box className={classes.PeriodContainer}>{DisplayHistory}</Box>
        </Box>
      ) : (
        // Details Tab content
        <Tab label="Details" />
      )}
    </div>
  );
}
