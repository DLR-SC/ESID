<!--
SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
SPDX-License-Identifier: CC-BY-4.0
-->

# ESID - Frontend Developer Documentation

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Initializing](#initializing)
  - [Development](#development)
  - [Running Tests](#running-tests)
  - [Generating Coverage Reports](#generating-coverage-reports)
  - [Formatting Code](#formatting-code)
  - [Linting](#linting)
  - [Building Releases](#building-releases)
- [Technologies](#technologies)
- [Guidelines](#guidelines)
  - [TypeScript](#typescript)
  - [React](#react)
  - [Redux](#redux)
  - [Design and Layout](#design-and-layout)
  - [Testing](#testing)
  - [Performance](#performance)
  - [Documentation](#documentation)
  - [Internationalization](#internationalization)
  - [Accessibility](#accessibility)
  - [Code Style](#code-style)
  - [Imports](#imports)

## Getting Started

### Prerequisites

To work with the frontend you need to download and install _Node.js_, and the _Node Package Manager_ (npm). You can
download the latest release from their website: https://nodejs.org/en/

### Initializing

After checking out the repository go to the `frontend` folder and use npm to download the dependencies:

```bash
git clone https://github.com/DLR-SC/ESID.git
cd ESID/frontend
npm install
```

### Development

You can set up and start a development server with the command:

```bash
npm run start
```

This will host a server on http://localhost:8080/, where the website will be displayed. After running the command, your
default browser should automatically open with the specified address (Internet Explorer is not supported). Changes to
your code will automatically be compiled, and the website will refresh itself.

### Running Tests

To run tests you can simply use:

```bash
npm run test
```

This will run all tests in the `src/__tests__` folder. The results will be printed to the console, and a JUnit report
will be generated into `reports/jest-junit.xml`. If you want to run a specific test only, you can run:

```bash
npm run test -- -t='deepCopy'       # Runs all deep copy tests.
npm run test -- -t='deepCopy array' # Runs only the deep copy array test.
```

### Generating Coverage Reports

To create a coverage report run:

```bash
npm run coverage
```

The results will be printed to console, and to a clover file in `reports/clover.xml`.

### Formatting Code

To automatically format all code in accordance to our guideline you can run:

```bash
npm run format
```

You should run this before committing.

### Linting

To automatically test code against a subset of our coding conventions you can run:

```bash
npm run lint
```

You should run this before committing.

### Building Releases

Release build can be created with the simple command:

```bash
npm run build
```

The resulting release will be in the `dist` folder.

If you want to test a release build you can run:

```bash
npm run preview
# or
npm run build-and-preview
```

## Technologies

The project makes use of some core technologies and libraries. You should always prefer their features over other
libraries. Also try to learn and keep up with their best practices and guidelines.

- **TypeScript**: Type safety and increasing productivity.
- **React**: Efficient and robust user interface management.
- **Redux**: Efficient and robust state management.
- **Material UI**: Good looking user interface design and responsive layout.

## Guidelines

In general developers should follow the best practices of the libraries they use.

### TypeScript

- Try to write all code in TypeScript. Only resort to JavaScript if it is absolutely necessary.
- Avoid the use `any`. If there is no type information available, create an interface that describes the type.

### React

- Make small individual components that fulfill as small of a role as possible.
- Strongly prefer React-Hooks over class components.

### Redux

Application state management is done using [Redux](https://redux.js.org/). We use the
[Redux Toolkit](https://redux-toolkit.js.org/) to easier work with the framework.
[React Redux](https://react-redux.js.org/) provides the interface between React and Redux.

While it is possible to manage all state with Redux, it should be preferred to use React's `props` functionality to
manage local component state. Redux should only be used, when the state affects large portions of the application that
would be difficult to handle with React's `props` alone.

### Design and Layout

- The frontend should follow the [Material Design guidelines](https://material.io/).
  - The [Material UI](https://material-ui.com/) library does conform to these guidelines. So make use of it as much as
    possible.
  - For icons make use of [Material Icons](https://fonts.google.com/icons).
- The application should always look best in a 16:9 ratio with 1920x1080 and 2560x1440 pixel resolutions.
- The layout should be as responsive as possible, but the previous point has priority.
- The UI should be self describing. To ensure that all functionality can be understood add tooltips to components.
- The frontend uses a global theme based on the following guidelines:
  <details>
  <summary>Design Guidelines for Colors and Typography <i>(-- Click to expand --)</i></summary>

  ![](docs/images/ThemeGuidelines.svg 'ESID Design Guidelines')

  **The alternative text color for lighter and darker variants where the contrast is not high enough is always either `#F2F2F2` (light text), or `#0C0B0D` (dark text).**

  - The Spacing is done in 5 steps: `0 px`, `4 px`, `8 px`, `12 px`, and `26 px`

  </details>

  - The theme is provided using the [MUI Theme Provider](https://mui.com/customization/theming 'mui.com')
  - <details>
    <summary>It can be accessed in components like this: <i>(-- Click to expand --)</i></summary>

    ```tsx
    import {useTheme} from '@mui/material/styles';

    export default function MyComponent(): JSX.Element {
      const theme = useTheme();

      return (
        <Box
          sx={{
            /*
             * Available theme properties can be found at their declaration inside the App.tsx.
             */
            // accessing theme variables
            background: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,

            // accessing theme typography
            typography: theme.typography.h1,
            // or
            typography: 'h1',

            // accessing theme spacing via index [0, 4, 8, 12, 26]
            margin: theme.spacing(3), // 12 px margin
          }}
        >
        </Box>
      );
    ```

    </details>

### Testing

All code should be tested:

- Pure TypeScript should be tested using unit tests with a 100% coverage.
- UI code should be tested using the react-testing-library.

### Performance

New code should be checked for Performance degradation.
Use the Browser Based Profiling Tools (Chrome/Firefox):

- [React Developer Tools](https://beta.reactjs.org/learn/react-developer-tools) (Profiler)
- Performance insights (Chrome)
- Lighthouse (Chrome)

### Documentation

Code should be documented as much as possible. Each class and function should contain a detailed description of what it
does, what inputs it gets and what outputs it produces. Document only functions that require it. Getters and setters for
example don't to be documented unless they do something unconventional.

### Internationalization

All text in the application should be internationalized with at least German and English support. To internationalize
texts the [react-i18next](https://react.i18next.com/) framework is used.

You can add translations in the `locales/<language>-<namespace>.json5` files. The following code snippets show
how to use a translation in a React-Hook.

`locales/en-global.json5`:

```json
{
  "helloWorld": "Hello, World!"
}
```

`locales/de-global.json5`:

```json
{
  "helloWorld": "Hallo, Welt!"
}
```

`HelloWorld.tsx`:

```tsx
import React from 'react';
import {useTranslation} from 'react-i18next';

export default function HelloWorld(): JSX.Element {
  const {t} = useTranslation();
  return <h1>{t('helloWorld')}</h1>;
}
```

### Accessibility

The application should conform to modern accessibility (a11y) guidelines. We use
[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) to check for a11y problems. During a pull request
a Lighthouse report is automatically generated during the CI checks.

### Code Style

Function names, parameters, variables and class members should be written in `camelCase`. The exception for functions
are React-Hooks, which should be written in `PascalCase`. In addition, classes and interfaces should also be written in
`PascalCase`:

```tsx
function myFunction(myParameter: string) {
  const myVariable = myParameter;
}

function MyHook() {
  return <div>Hello World</div>;
}

interface MyInterface {
  myMember: string;
}

class MyClass {
  myMember: MyInterface;
}
```

Try to use `const` as much as possible and use `let` otherwise. Never use `var`!

### Imports

To optimize the final size of the bundle it is important to make imports as granular as possible to allow for the best
dead code removal. This is especially important for the material icons package.

Example:

```tsx
// DON'T DO THIS, it will import ALL the material icons into our application:
import {LockIcon} from '@mui/icons-material';

// Instead do this, to insure only the used icons are being imported:
import LockIcon from '@mui/icons-material/Lock';
```
