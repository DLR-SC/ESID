// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useEffect, useMemo} from 'react';
import Joyride, {CallBackProps, Step, STATUS, ACTIONS, EVENTS} from 'react-joyride';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {setShowPopover, setTourCompleted, setActiveTour} from '../../../store/UserOnboardingSlice';
import {selectTab} from '../../../store/UserPreferenceSlice';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@mui/material/styles';

interface State {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

export default function TourSteps(): JSX.Element {
  const [state, setState] = useState<State>({
    run: false,
    steps: [],
    stepIndex: 0,
  });
  const {run, steps, stepIndex} = state;

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const activeTour = useAppSelector((state) => state.userOnboarding.activeTour);
  const showPopover = useAppSelector((state) => state.userOnboarding.showPopover);
  const showWelcomeDialog = useAppSelector((state) => state.userOnboarding.showWelcomeDialog);
  const isFilterDialogOpen = useAppSelector((state) => state.userOnboarding.isFilterDialogOpen);
  const selectedTab = useAppSelector((state) => state.userPreference.selectedTab);
  const {t: tOnboarding} = useTranslation('onboarding');

  /**
   * this useMemo gets the localized tour steps and returns them as an array of step objects to use in the Joyride component
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
   * this effect sets the steps to the localized tour steps when a tour is clicked and checks if the popover or modal is open
   */
  useEffect(() => {
    if (activeTour && !showPopover && !showWelcomeDialog && !run) {
      setState((prevState) => ({
        ...prevState,
        run: true,
        steps: localizedTourSteps,
        stepIndex: 0,
      }));
    }
  }, [activeTour, showPopover, showWelcomeDialog, run, localizedTourSteps]);

  /**
   * this effect manages the execution of the tour when the filter dialog is open
   * since the filter tour is a joyride controlled tour, manual control with step index is required to make sure the tour is executed correctly
   */
  useEffect(() => {
    if (isFilterDialogOpen && activeTour === 'filter' && run) {
      setState((prevState) => ({
        ...prevState,
        run: stepIndex === 0 ? false : run,
        stepIndex: stepIndex === 0 ? 1 : stepIndex,
      }));
    }
  }, [activeTour, isFilterDialogOpen, run, stepIndex]);

  /**
   * this effect ensures that the tour is no longer active if the user closes the filter dialog during the execution of the tour
   * because the tour is intended to be completed in the filter dialog
   */
  useEffect(() => {
    if (activeTour === 'filter' && !isFilterDialogOpen && run && stepIndex > 0) {
      setState({run: false, steps: [], stepIndex: 0});
      dispatch(setActiveTour(null));
    }
  }, [isFilterDialogOpen, activeTour, run, stepIndex, dispatch]);

  /**
   * this effect ensures that the correct tab is selected when the user clicks on a tour
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
   * this function handles the callback events from the Joyride component
   */
  const handleJoyrideCallback = (data: CallBackProps) => {
    const {action, index, status, type} = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (activeTour && status === STATUS.FINISHED) {
        dispatch(setTourCompleted({tour: activeTour, completed: true}));
      }
      dispatch(setActiveTour(null));
      setState({run: false, steps: [], stepIndex: 0});
      console.log('the tour is completed: ' + activeTour);
      if (activeTour != 'filter') {
        dispatch(setShowPopover(true)); // this is to close the popover after the filter tour is completed
      }
    } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setState((prevState) => ({
        ...prevState,
        stepIndex: nextStepIndex,
      }));
    }
  };

  return (
    <div>
      <Joyride
        steps={steps}
        stepIndex={stepIndex}
        run={run}
        callback={handleJoyrideCallback}
        continuous
        showSkipButton
        debug
        scrollToFirstStep
        spotlightClicks
        disableOverlayClose
        disableScrollParentFix
        locale={{
          next: tOnboarding('next'),
          skip: tOnboarding('skip'),
          back: tOnboarding('back'),
          last: tOnboarding('last'),
        }}
        styles={{
          options: {
            zIndex: 10000,
            backgroundColor: theme.palette.background.paper,
            textColor: theme.palette.text.primary,
            primaryColor: theme.palette.primary.main,
            width: '350px',
            arrowColor: theme.palette.background.paper,
          },
          tooltipContainer: {
            textAlign: 'left',
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
        }}
      />
    </div>
  );
}
