// add List Element typography using module augmentation
import React from 'react';
import {createTheme} from '@mui/material/styles';

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
      scenarios: Array<Array<string>>;
    };
  }

  interface ThemeOptions {
    custom?: {
      scenarios?: Array<Array<string>>;
    };
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    listElement: true;
  }
}

export default createTheme({
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
      fontSize: '16pt',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '13pt',
      fontWeight: 600,
    },
    h3: {
      fontSize: '12pt',
      fontWeight: 600,
      lineHeight: 1.15,
    },
    h4: undefined,
    h5: undefined,
    h6: undefined,
    subtitle1: undefined,
    subtitle2: undefined,
    body1: {
      fontSize: '13pt',
      fontWeight: 400,
    },
    body2: {
      fontSize: '12pt',
      fontWeight: 400,
    },
    button: {
      fontSize: '12pt',
      fontWeight: 500,
    },
    caption: {
      fontSize: '10pt',
      fontWeight: 600,
      // monospace Inter font does not exist
    },
    overline: undefined,
    listElement: {
      fontSize: '13pt',
      fontWeight: 500,
      fontFeatureSettings: `'tnum' on`,
    },
  },
  spacing: [0, 4, 8, 12, 26],
  components: {
    MuiDialog: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(5px)'
        }
      }
    }
  },
  custom: {
    //scenario colors with gradations, so the main color of a scenario is at [scenario_index][0]
    scenarios: [
      ['#3998DB', '#65B0E5', '#7ECFF2', '#B8EAFF', '#8C8C8C'],
      ['#876BE3', '#9C85E5', '#9AA3F5', '#C2C8FF', '#8C8C8C'],
      ['#CC5AC7', '#E581E1', '#CF9EF0', '#E4BDFF', '#8C8C8C'],
      ['#EBA73B', '#F2C479', '#F7DD8D', '#FFF0A3', '#8C8C8C'],
      ['#34C290', '#54E3B1', '#8AEDDB', '#8AEDDB', '#8C8C8C'],
      ['#EB7651', '#F0987D', '#F5BBA8', '#FADDD4', '#8C8C8C'],
      ['#34BEC7', '#67CED5', '#9ADFE3', '#CCEFF1', '#8C8C8C'],
      ['#9FC750', '#B7D57C', '#CFE3A8', '#E7F1D3', '#8C8C8C'],
    ],
  },
});
