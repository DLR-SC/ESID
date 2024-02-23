# Technologies and Guidelines

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
  - [Branching Strategy](#branching-strategy)
  - [Git Commit Messages](#git-commit-messages)


## Technologies

The project makes use of some core technologies and libraries. You should always prefer their features over other
libraries. Also try to learn and keep up with their best practices and guidelines.

- **[TypeScript](https://www.typescriptlang.org/)**: Type safety and increasing productivity.
- **[React](https://react.dev/)**: Efficient and robust user interface management.
- **[Redux](https://redux.js.org/)**: Efficient and robust state management.
- **[Material UI](https://mui.com/material-ui/)**: Good looking user interface design and responsive layout.


## Guidelines

> [!TIP]
> In general developers should follow the best practices of the libraries they use.


### TypeScript

- Try to write all code in TypeScript. Only resort to JavaScript if it is absolutely necessary.
- Avoid the use `any`. If there is no type information available, create an interface that describes the type.
- Use the [linter](/frontend/README.md#linting-code) to follow common best prectices.


### React

- Make small individual components that fulfill as small of a role as possible.
- Strongly prefer React-Hooks over class components.


### Redux

Application state management is done using [Redux](https://redux.js.org/).
We use the [Redux Toolkit](https://redux-toolkit.js.org/) to easier work with the framework.
[React Redux](https://react-redux.js.org/) provides the interface between React and Redux.

> [!IMPORTANT]
> While it is possible to manage all state with Redux, it should be preferred to use React's `props` functionality to manage local component state.
> Redux should only be used, when the state affects large portions of the application that would be difficult to handle with React's `props` alone.


### Design and Layout

- The frontend should follow the [Material Design guidelines](https://material.io/).
  - The [Material UI](https://material-ui.com/) library does conform to these guidelines. So make use of it as much as
    possible.
  - For icons make use of [Material Icons](https://fonts.google.com/icons).
- The application should always look best in a `16:9` ratio with `1920x1080` and `2560x1440` pixel resolutions.
- The layout should be as responsive as possible, but the previous point has priority.
- The UI should be self describing. To ensure that all functionality can be understood, add tooltips to components where necessary.
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

> [!IMPORTANT]  
> All code should be tested:
> - Pure TypeScript should be tested using unit tests with a 100% coverage.
> - UI code should be tested using the `react-testing-library`.


### Performance

New code should be checked for Performance degradation.
Use the Browser Based Profiling Tools (Chrome/Firefox):
- [React Developer Tools](https://beta.reactjs.org/learn/react-developer-tools) (Profiler)
- Performance insights (Chrome)
- Lighthouse (Chrome)

> [!NOTE]
> A lighthouse report is automatically generated with every pull request, linking the results of the development branch in the pull request makes the review easier.


### Documentation

Code should be documented as much as possible.
Each class and function should contain a detailed description of what it does, what inputs it gets and what outputs it produces.
Document only functions that require it.
Getters and setters for example don't to be documented unless they do something unconventional.


### Internationalization

> [!IMPORTANT]
> All text in the application should be internationalized with at least German and English support.

To internationalize texts the [react-i18next](https://react.i18next.com/) framework is used.

You can add translations in the `locales/<language>-<namespace>.json5` files.
The following code snippets show how to use a translation in a React-Hook.

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

The application should conform to modern accessibility (a11y) guidelines.
We use [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) to check for a11y problems.

> [!NOTE]
> During a pull request a Lighthouse report is automatically generated during the CI checks.


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


---
### Branching Strategy
The development of ESID follows a simplified version of **git-flow**: The `main` branch always contains stable code.
New features and bug fixes are implemented in `feature/*` or `fix/*` branches and are merged to `develop` once they are finished.
When a new milestone is reached, the content of `develop` will be merged to `main` and a tag is created.

[Github Actions](https://github.com/DLR-SC/ESID/actions) are used for continuous integration.
All pull requests and pushes to `main` and `develop` are built automatically.


### Git Commit Messages
Commits should start with a Capital letter and should be written in present tense (e.g. __:tada: Add cool new feature__ instead of __:tada: Added cool new feature__).
It's a great idea to start the commit message with an applicable emoji. This does not only look great but also makes you rethink what to add to a commit.
* :tada: `:tada:` when adding a cool new feature
* :wrench: `:wrench:` when refactoring / improving a small piece of code
* :hammer: `:hammer:` when refactoring / improving large parts of the code
* :sparkles: `:sparkles:` when formatting code
* :art: `:art:` improving / adding assets like textures or images
* :rocket: `:rocket:` when improving performance
* :memo: `:memo:` when writing docs
* :beetle: `:beetle:` when fixing a bug
* :green_heart: `:green_heart:` when fixing the CI build
* :heavy_check_mark: `:heavy_check_mark:` when working on tests
* :arrow_up_small: `:arrow_up_small:` when adding / upgrading dependencies
* :arrow_down_small: `:arrow_down_small:` when removing / downgrading dependencies
* :twisted_rightwards_arrows: `:twisted_rightwards_arrows:` when merging branches
* :fire: `:fire:` when removing files
* :truck: `:truck:` when moving / renaming files or namespaces

A good way to enforce this on your side is to use a `commit-hook`. To do this, paste the following script into `.git/hooks/commit-msg`.

``` bash
#!/bin/bash

# regex to validate in commit msg
commit_regex='(:(tada|wrench|hammer|sparkles|art|rocket|memo|beetle|green_heart|arrow_up_small|arrow_down_small|twisted_rightwards_arrows|fire|truck|heavy_check_mark):(.+))'
error_msg="Aborting commit. Your commit message is missing an emoji as described in the contributing guideline."

if ! grep -xqE "$commit_regex" "$1"; then
    echo "$error_msg" >&2
    exit 1
fi
```

And make sure that it is executable:

``` bash
chmod +x .git/hooks/commit-msg
```
