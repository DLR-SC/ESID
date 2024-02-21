// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

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
      fontSize: '11pt',
      fontWeight: 500,
      fontFeatureSettings: `'tnum' on`,
    },
  },
  spacing: [0, 4, 8, 12, 26],
  components: {
    MuiDialog: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(5px)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '10pt',
          textAlign: 'justify',
        },
      },
    },
  },
  custom: {
    //scenario colors with graduations
    scenarios: [
      // Main   | Grad-1   | Grad-2   | Grad-3   | Grad-4   | Grad-5   | Disabled  |
      ['#000000', '#303030', '#606060', '#909090', '#c0c0c0', '#e0e0e0', '#8c8c8c'], // Case Data
      ['#3998db', '#56a8e3', '#6cb6eb', '#7fc1f0', '#94cef7', '#b8e1ff', '#8c8c8c'], // Scenario 1
      ['#876be3', '#987feb', '#a892f0', '#b5a2f5', '#c0affa', '#d0c2ff', '#8c8c8c'], // Scenario 2
      ['#cc5ac7', '#e070db', '#eb7ce6', '#f291ee', '#faa0f6', '#fcb6f9', '#8c8c8c'], // Scenario 3
      ['#eba73b', '#f2b552', '#f5c06c', '#faca7d', '#fad393', '#ffdea8', '#8c8c8c'], // Scenario 4
      ['#34c290', '#3ecf9c', '#50deac', '#66edbe', '#76f5c8', '#87fad2', '#8c8c8c'], // Scenario 5
      ['#ed6137', '#f8683b', '#f87c56', '#f89374', '#f9b19b', '#fbcfc2', '#8c8c8c'], // Scenario 6
      ['#21b3c0', '#23c3d3', '#37ccd8', '#57d6de', '#85e2e7', '#b5edf0', '#8c8c8c'], // Scenario 7
      ['#90b748', '#a0c750', '#aed06a', '#bdd885', '#d0e3a8', '#e3eeca', '#8c8c8c'], // Scenario 8
    ],
  },
});
