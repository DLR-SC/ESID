// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useEffect, useMemo} from 'react';
import Joyride, {CallBackProps, Step, STATUS, ACTIONS, EVENTS} from 'react-joyride';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {setShowPopover, setTourCompleted, setActiveTour} from '../../../store/UserOnboardingSlice';
import {useTranslation} from 'react-i18next';

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
  const activeTour = useAppSelector((state) => state.userOnboarding.activeTour);
  const showPopover = useAppSelector((state) => state.userOnboarding.showPopover);
  const showWelcomeModal = useAppSelector((state) => state.userOnboarding.showWelcomeModal);
  const isFilterDialogOpen = useAppSelector((state) => state.userOnboarding.isFilterDialogOpen);
  const {t: tOnboarding} = useTranslation('onboarding');

  // this useMemo gets the localized tour steps and returns them as an array of step objects to use in the Joyride component below
  const localizedTourSteps: Step[] = useMemo(() => {
    if (activeTour) {
      const tourSteps = tOnboarding(`tours.${activeTour}.steps`, {returnObjects: true});
      if (tourSteps) {
        console.log('the tour steps are', tourSteps);
        return Object.values(tourSteps) as Step[];
      }
    }
    return [];
  }, [activeTour, tOnboarding]);

  // this effect sets the steps to the localized tour steps when a tour is clicked and checks if the popover or modal is open
  useEffect(() => {
    if (activeTour && !showPopover && !showWelcomeModal && !run) {
      setState((prevState) => ({
        ...prevState,
        run: true,
        steps: localizedTourSteps,
        stepIndex: 0,
      }));
    }
  }, [activeTour, showPopover, showWelcomeModal, run, localizedTourSteps]);

  // this effect checks if the filter modal is open in order to handle the execution of the joyride controlled tour
  useEffect(() => {
    if (isFilterDialogOpen && run) {
      setState((prevState) => ({
        ...prevState,
        run: stepIndex === 0 ? false : run,
        stepIndex: stepIndex === 0 ? 1 : stepIndex,
      }));
    }
  }, [isFilterDialogOpen, run, stepIndex]);

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
        locale={{
          next: tOnboarding('next'),
          skip: tOnboarding('skip'),
          back: tOnboarding('back'),
          last: tOnboarding('last'),
        }}
        styles={{
          options: {
            zIndex: 10000,
            backgroundColor: '#fff',
            textColor: '#000',
            primaryColor: '#1976d2',
            width: '300px',
            arrowColor: '#fff',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '8px',
          },
          tooltipContent: {
            fontSize: '0.875rem',
          },
        }}
      />
    </div>
  );
}
