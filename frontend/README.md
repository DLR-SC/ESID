# ESID - Frontend Developer Documentation

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Initializing](#initializing)
  - [Develop](#development-server)
  - [Running Tests](#running-tests)
  - [Formatting Code](#formatting-code)
  - [Linting](#linting)
  - [Building Releases](#building-releases)
- [Technologies](#technologies)
- [Guidelines](#guidelines)

## Getting Started
### Prerequisites
To work with the frontend you need to download and install _Node.js_ and the _Node Package Manager_ (npm).
You can download the latest release from their website: https://nodejs.org/en/

### Initializing
After checking out the repository go to the `frontend` folder and use npm to download the dependencies:
```bash
git clone https://github.com/DLR-SC/ESID.git
cd ESID/frontend
npm install
```

### Development Server
You can set up and start a development server with the command:
```bash
npm run start
```
This will host a server on http://localhost:8080/, where the website will be displayed.
After running the command, your default browser should automatically open with the specified address (Internet Explorer is not supported).
Changes to your code will automatically be compiled, and the website will refresh itself.

### Running Tests
To run tests you can simply use:
```bash
npm run test
```
This will run all tests in the `src/__tests__` folder.
If you want to run a specific test only, you can run:
```bash
npm run test -t='test-name'
```

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
The resulting release will be in the `build` folder.

## Technologies
The project makes use of some core technologies and libraries.
You should always prefer their features over other libraries.
Also try to learn and keep up with their best practices and guidelines.
- **Typescript**: Type safety and increasing productivity.
- **React**: Efficient and robust user interface management.
- **Redux**: Efficient and robust state management.
- **Material UI**: Good looking user interface design and responsive layouting.

## Guidelines
**TODO**