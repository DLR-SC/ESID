import React, {Suspense} from 'react';
import {Provider} from 'react-redux';

import './App.scss';

import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Store from './store';
import {Box} from '@mui/material';
import {createTheme, ThemeProvider} from '@mui/material/styles';

// add List Element typography using module augmentation
declare module '@mui/material/styles' {
  interface TypographyVariants {
    listElement: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    listElement?: React.CSSProperties;
  }

  interface Theme {
    custom: {
      scenarios: Array<string>
    };
  }

  interface ThemeOptions {
    custom?: {
      scenarios?: Array<string>
    };
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    listElement: true;
  }
}

const theme = createTheme({
  palette: {
    background: {
      default: '#F0F0F2',
      paper: '#F8F8F9',
    },
    text: {
      primary: '#0C0B0D',
      secondary: '#212122',
      disabled: '#8C8C8C',
    },
    primary: {
      main: '#543CF0',
      light: '#998BF5',
      dark: '#3619EB',
      contrastText: '#F2F2F2',
    },
    secondary: {
      main: '#962FEF',
      light: '#AA57F2',
      dark: '#840EE9',
      contrastText: '#F2F2F2',
    },
    info: {
      main: '#3382EE',
      light: '#5999F1',
      dark: '#0654BE',
      contrastText: '#F2F2F2',
    },
    warning: {
      main: '#FFAD23',
      light: '#FFBD4F',
      dark: '#FF9F00',
      contrastText: '#0C0B0D',
    },
    divider: '#D2D1DB',
  },
  typography: {
    fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
    fontSize: 13,
    h1: {
      fontSize: 16,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 13,
      fontWeight: 600,
    },
    h3: {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.15,
    },
    h4: undefined,
    h5: undefined,
    h6: undefined,
    subtitle1: undefined,
    subtitle2: undefined,
    body1: {
      fontSize: 13,
      fontWeight: 400,
    },
    body2: {
      fontSize: 12,
      fontWeight: 400,
    },
    button: {
      fontSize: 12,
      fontWeight: 500,
    },
    caption: {
      fontSize: 10,
      fontWeight: 600,
      // monospace Inter font does not exist
    },
    overline: undefined,
    listElement: {
      fontSize: 13,
      fontWeight: 500,
      fontFeatureSettings: `'tnum' on`,
    },
  },
  spacing: [0, 4, 8, 12, 26],
  custom: {
    scenarios: [
      '#3998DB',
      '#876BE3',
      '#CC5AC7',
      '#EBA73B',
      '#34C290',
      '#EB7651',
      '#34BEC7',
      '#9FC750',
    ],
  },
});

/**
 * This is the root element of the React application. It divides the main screen area into the three main components.
 * The top bar, the sidebar and the main content area.
 */
export default function App(): JSX.Element {
  return (
    <Suspense fallback='loading'>
      <Provider store={Store}>
        <ThemeProvider theme={theme}>
          <Box id='app' display='flex' flexDirection='column' style={{height: '100%'}}>
            <TopBar />
            <Box display='flex' flexDirection='row' flexGrow={1} alignItems='stretch'>
              <Sidebar />
              <MainContent />
            </Box>
          </Box>
        </ThemeProvider>
      </Provider>
    </Suspense>
  );
}
