<!--
SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
SPDX-License-Identifier: CC-BY-4.0
-->

# ESID - Frontend Developer Documentation

<!-- omit from toc -->
## Table of Contents
- [Getting Started](#getting-started)
  - [Forking and Cloning](#forking-and-cloning)
  - [Initializing ESID](#initializing-esid)
  - [Development](#development)
  - [Running Tests](#running-tests)
  - [Generating Coverage Reports](#generating-coverage-reports)
  - [Formatting Code](#formatting-code)
  - [Linting Code](#linting-code)
  - [Building Releases](#building-releases)
  - [Committing, Pushing, and Pull Request](#committing-pushing-and-pull-request)

## Getting Started

> [!IMPORTANT]
> To work with the frontend you need to download and install _Node.js_, and the _Node Package Manager_ (npm). You can download the latest release from their website: [NodeJS.org](https://nodejs.org/en/)

> [!TIP]  
> Our used Technologies and Guidelines can be found [here](docs/Technologies-and-Guidelines.md).


### Forking and Cloning

Start by forking the repository by clicking the **Fork** button on the top right of this page.
This creates a copy of this repository under your account.

Next, clone the forked repository:
```bash
git clone git@github.com:<your user name>/ESID.git
cd ESID
git remote add upstream git@github.com:DLR-SC/ESID.git
git checkout develop
```

> [!NOTE]  
> The `develop` branch contains our latest developed features as outlined in our [Branching Strategy](#branching-strategy).

In compliance with this strategy you can create your own branch for your changes:
```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-bugfix
```
On this branch you can perform your changes, push to a feature branch and create a pull request to ESID's develop branch.


### Initializing ESID

After checking out a branch go to the `frontend` folder and use npm to download and install the dependencies:
```bash
cd frontend # assuming you are in the root repository folder ()
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
> [!TIP]  
> You should run this and the [linter](#linting-code) before making a commit or pull request.


### Linting Code

To automatically test code against a subset of our coding conventions you can run:
```bash
npm run lint
```
> [!TIP]  
> You should run this and the [formatter](#formatting-code) before making a commit or pull request.


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

### Committing, Pushing, and Pull Request

> [!NOTE]
> When you want to commit changes please keep our [guideline for commit messages](docs/Technologies-and-Guidelines.md#commit-messages) in mind to have a meaningful commit history.

Once you are done with your changes make sure you have pushed them to your forked repository with:
```bash
git push origin your-branch-name # i.e. feature/my-feature or fix/my-bugfix
```
When there were changes to ESID's `develop` branch in the meantime, you will need to merge those to your fork before creating a pull request:
``` bash
git fetch upstream
git merge upstream/develop
```

Once everything is merged and conflicts are resolved can create a pull request on GitHub to ESID's develop branch. :tada:
> [!TIP]  
> Make sure to add a goo description of your changes and go over the checklist in the pull request template to make it easier for the reviewer to go through your changes and give helpful feedback and suggestions.

