<!--
SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
SPDX-License-Identifier: CC-BY-4.0
-->

# Documentation for the Onboarding system of ESID

## Table of Contents

- [Introduction](#introduction)
- [Onboarding System Structure](#onboarding-system-structure)
- [Tour Structure](#tour-structure)
- [Adding a New Tour](#adding-a-new-tour)
- [Resources](#resources)

## Introduction

This documentation explains the structure of the Onboarding system and provides instructions on how to add new tours. The onboarding system is designed to guide new users through ESID's functionalities.

## Onboarding System Structure

The onboarding system consists of the following components:

- **Welcome Modal**: displays an overview of ESID through slides and illustrations on the user's first visit.
- **Onboarding Tours**: built using the React Joyride library. These tours can be accessed by clicking on the different tour chips in the information button in the top bar or from the last slide of the welcome modal. Currently, the onboarding system includes the following tours:
  - District map
  - Scenario
  - Line chart
  - Filters
  - Parameters

## Tour Structure

The onboarding system uses a modular approach, where each tour is represented as a separate **chip**. This allows for interactive and feature-specific tours rather than a single, static tour.

Each tour consist of a series of steps, each associated with a specific UI element. Example of a tour object:

```
tours: {
    districtMap: {
      title: 'Map',
      steps: {
        step1: {
          target: '#sidebar-root',
          title: 'Step 1',
          content: 'The map shows an overview of all rural and urban districts in Germany. You can select a different district by clicking on it and display case data for specific regions.  ',
          disableBeacon: true,
          spotlightClicks: true,
          showProgress: true,
          placement: 'right-start',
        },
        step2: {
          target: '#sidebar-root',
          title: 'Step 2',
          content: 'To get a more detailed overview, you can zoom in or out of the map using the plus or minus symbol or the mouse wheel. You can reset the map to its default view using the "Reset" button.',
          disableBeacon: true,
          spotlightClicks: true,
          showProgress: true,
          placement: 'right',
        },
        ...
      }
    }
}
```

## Adding a New Tour

This section explains how to add a new tour.

### 1. Update Tour Types

In `types/tours.ts`, add the new tour type to the `TourType` union. Example:

```typescript
export type TourType = 'districtMap' | 'scenario' | 'lineChart' | 'filter' | 'parameters' | 'newTour';
```

### 2. Define the Tour steps

Tour content is managed through localization files. To add a new tour:

- Open the localization files: `en-onboarding.json5` and `de-onboarding.json5`
- Add the new tour data to the tours object in both files.

Translations must be done manually for each language in each file.

### 3. Add tour data to the Redux store

Update the `UserOnboardingSlice` to include the new tour data.

### 4. Update the Tour Chips List

Modify the `TourChipList.tsx` component to include the new tour.

### 5. Implement Necessary Logic in Tour Steps

The `TourSteps.tsx` file contains the core logic for managing tour steps and executing tours.

- For interactive tours that require manual control of the step index (known as Joyride controlled tours), use `useEffect` hooks to manage the step index.

Make sure to add or update comments in `TourSteps.tsx` to document the new tour’s functionality and integration. Documented code will help future developers in understanding the implementation.

For more details on implementing tours with Joyride, refer to the [Joyride documentation](https://docs.react-joyride.com) and check out this [CodeSandbox example](https://codesandbox.io/p/devbox/rough-currying-c0xm7q?file=%2Fsrc%2FControlled%2Findex.tsx%3A48%2C43) for a practical demonstration.

### 6. Test the New Tour

To make sure that the new tour functions correctly:

1. Add the `debug` prop to the Joyride component to view detailed logs and inspect the behavior of the tour.
2. Test the tour to confirm that all steps are displayed properly and the tour progresses as expected.

Note: Unit tests for Joyride tours are currently not implemented, so thorough manual testing is essential.

### 7. Update the Documentation

Once you've added a new tour or made other significant changes, make sure to update this documentation so it stays up to date.

# Resources

- [React Joyride](https://docs.react-joyride.com)
- [CodeSandbox example](https://codesandbox.io/p/devbox/rough-currying-c0xm7q?file=%2Fsrc%2FControlled%2Findex.tsx%3A48%2C43)
