// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useEffect, useMemo, useRef} from 'react';
import Joyride, {CallBackProps, Step, STATUS, ACTIONS, EVENTS} from 'react-joyride';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@mui/material/styles';
import {setShowPopover, setTourCompleted, setActiveTour} from '../../../store/UserOnboardingSlice';
import {selectTab} from '../../../store/UserPreferenceSlice';
import {DataSelection, selectDate, selectScenario} from '../../../store/DataSelectionSlice';

/**
 * Interface for the state of the tour steps
 */
interface State {
  /** A flag to run or stop the tour. */
  run: boolean;
  /** Array of Step objects for the tour. */
  steps: Step[];
  /** The current step index of the tour, keeping state of this value is necessary for joyride controlled (interactive) tours. */
  stepIndex: number;
}

/**
 * This component manages the joyride onboarding tour steps.
 * To see debug messages in the console, set the debug flag to true in the joyride component below.
 */
export default function TourSteps(): JSX.Element {
  const [state, setState] = useState<State>({
    run: false,
    steps: [],
    stepIndex: 0,
  });
  const {run, steps, stepIndex} = state;
  const [arePreferencesSaved, setArePreferencesSaved] = useState(false); // Flag to indicate that the preferences are saved

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const {t: tOnboarding} = useTranslation('onboarding');

  const activeTour = useAppSelector((state) => state.userOnboarding.activeTour);
  const showPopover = useAppSelector((state) => state.userOnboarding.showPopover);
  const showWelcomeDialog = useAppSelector((state) => state.userOnboarding.showWelcomeDialog);
  const isFilterDialogOpen = useAppSelector((state) => state.userOnboarding.isFilterDialogOpen);
  const selectedTab = useAppSelector((state) => state.userPreference.selectedTab);
  const simulationStart = useAppSelector((state) => state.dataSelection.simulationStart);
  const dataSelection = useAppSelector((state) => state.dataSelection);
  const scenarioList = useAppSelector((state) => state.scenarioList.scenarios);

  const previousSimulationStart = useRef(simulationStart); // To keep track of the previous simulation start date for the scenario controlled tour.
  const savedUserDataSelection = useRef<null | DataSelection>(null); // To keep track of the original data selection before starting the tour.

  /**
   * This useMemo gets the localized tour steps and returns them as an array of step objects to use in the Joyride component.
   */
  const localizedTourSteps: Step[] = useMemo(() => {
    if (activeTour) {
      const tourSteps = tOnboarding(`tours.${activeTour}.steps`, {returnObjects: true});
      if (tourSteps) {
        return Object.values(tourSteps) as Step[];
      }
    }
    return [];
  }, [activeTour, tOnboarding]);

  /**
   * This effect saves the current data selection before starting the tour,
   * sets the simulation start date, and starts the tour once preferences are saved.
   */
  useEffect(() => {
    if (activeTour && !showPopover && !showWelcomeDialog && !run) {
      if (!savedUserDataSelection.current) {
        savedUserDataSelection.current = dataSelection; // Save the current data selection of the user so we can override it with different values during the tour

        const maxDate = dataSelection.maxDate || '2024-07-08'; // Get the maximum date from the data selection
        dispatch(selectDate(maxDate)); // Set the simulation start date (purple line) to the maximum date

        const firstScenarioId = Number(Object.keys(scenarioList)[0]); // We get the first scenario id (base scenario) from scenarioList
        dispatch(selectScenario(firstScenarioId)); // Dispatch the selectScenario action with the base scenario

        setArePreferencesSaved(true); // Flag to indicate that the preferences are saved
      } else if (arePreferencesSaved) {
        // Starting the tour only after preferences are saved
        setState((prevState) => ({
          ...prevState,
          run: true,
          steps: localizedTourSteps,
          stepIndex: 0,
        }));
        setArePreferencesSaved(false); // Reset the flag after the tour starts to prevent re-triggering
      }
    }
  }, [
    activeTour,
    showPopover,
    showWelcomeDialog,
    run,
    dataSelection,
    dispatch,
    arePreferencesSaved,
    localizedTourSteps,
    scenarioList,
  ]);

  /**
   * This effect ensures that the tour is no longer active if the user closes the filter dialog during the execution of the tour.
   */
  useEffect(() => {
    if (activeTour === 'filter' && !isFilterDialogOpen && run && stepIndex > 0) {
      setState({run: false, steps: [], stepIndex: 0});
      dispatch(setActiveTour(null));
    }
  }, [isFilterDialogOpen, activeTour, run, stepIndex, dispatch]);

  /**
   * This effect ensures that the correct tab is selected when the user clicks on a tour.
   */
  useEffect(() => {
    if (activeTour) {
      if (activeTour === 'lineChart' && selectedTab !== '1') {
        dispatch(selectTab('1'));
      } else if (activeTour === 'parameters' && selectedTab !== '2') {
        dispatch(selectTab('2'));
      }
    }
  }, [activeTour, selectedTab, dispatch]);

  /**
   * This effect manages the controlled tour of the filter dialog.
   * For joyride controlled tours, manual control with step index is required to make sure the tour is executed correctly.
   */
  useEffect(() => {
    if (activeTour === 'filter' && isFilterDialogOpen && stepIndex === 0) {
      setState((prevState) => ({
        ...prevState,
        stepIndex: 1,
      }));
    }
  }, [activeTour, isFilterDialogOpen, stepIndex]);

  /**
   * This effect manages the 3rd step of the controlled scenario tour, which is to set the simulation start date to a specific date.
   * When the simulation start date is chosen, the tour should proceed to the next step.
   */
  useEffect(() => {
    if (activeTour === 'scenario' && stepIndex === 2) {
      if (simulationStart !== previousSimulationStart.current) {
        previousSimulationStart.current = simulationStart;
        setState((prevState) => ({
          ...prevState,
          stepIndex: 3,
        }));
      }
    }
  }, [simulationStart, activeTour, stepIndex]);

  /**
   * This function handles the callback events from the Joyride component.
   */
  const handleJoyrideCallback = (data: CallBackProps) => {
    const {action, index, status, type} = data;

    // If the tour is finished, skipped or closed
    if (
      ([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status) ||
      action === ACTIONS.CLOSE ||
      action === ACTIONS.STOP
    ) {
      dispatch(selectDate(savedUserDataSelection.current?.date || '2024-07-08')); // Restore the original date in the data selection
      dispatch(selectScenario(savedUserDataSelection.current?.scenario || 0)); // Restore the original selected scenario in the data selection
      savedUserDataSelection.current = null; // Reset the saved preferences after the tour is completed

      // If the tour was finished and not skipped, mark as completed
      if (status === STATUS.FINISHED && activeTour) {
        dispatch(setTourCompleted({tour: activeTour, completed: true}));
      }

      // We reset the tour state so we can restart the tour again if the user clicks again
      dispatch(setActiveTour(null));
      setState({run: false, steps: [], stepIndex: 0});

      // This is to close the popover after the filter tour is completed
      if (activeTour !== 'filter') {
        dispatch(setShowPopover(true));
      }

      return;
    }
    // When next or back button is clicked
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = action === ACTIONS.PREV ? index - 1 : index + 1;
      setState((prevState) => ({
        ...prevState,
        stepIndex: nextStepIndex,
      }));
    }
  };

  /**
   * Memoized locale for the Joyride component.
   */
  const joyrideLocale = useMemo(
    () => ({
      next: tOnboarding('next'),
      skip: tOnboarding('skip'),
      back: tOnboarding('back'),
      last: tOnboarding('last'),
    }),
    [tOnboarding]
  );

  /**
   * Memoized styles for the Joyride component.
   */
  const joyrideStyles = useMemo(
    () => ({
      options: {
        zIndex: 10000,
        backgroundColor: theme.palette.background.paper,
        textColor: theme.palette.text.primary,
        primaryColor: theme.palette.primary.main,
        width: '350px',
        arrowColor: theme.palette.background.paper,
      },
      tooltipContainer: {
        textAlign: 'left' as const,
      },
      tooltipTitle: {
        fontSize: theme.typography.h1.fontSize,
        fontWeight: theme.typography.caption.fontWeight,
        marginBottom: '8px',
      },
      tooltipContent: {
        fontSize: theme.typography.body1.fontSize,
        fontWeight: theme.typography.body1.fontWeight,
      },
    }),
    [theme]
  );

  return (
    <div>
      <Joyride
        steps={steps}
        stepIndex={stepIndex}
        run={run}
        callback={handleJoyrideCallback}
        continuous
        showSkipButton
        scrollToFirstStep
        spotlightClicks
        disableOverlayClose
        disableScrollParentFix
        locale={joyrideLocale}
        styles={joyrideStyles}
      />
    </div>
  );
}
