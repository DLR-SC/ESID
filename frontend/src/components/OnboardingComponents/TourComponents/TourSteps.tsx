// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useEffect, useMemo} from 'react';
import Joyride, {CallBackProps, Step, STATUS} from 'react-joyride';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {setShowPopover, setTourCompleted, setToursToShow} from '../../../store/UserOnboardingSlice';
import {useTranslation} from 'react-i18next';

export default function TourSteps(): JSX.Element {
  const [steps, setSteps] = useState<Step[]>([]);
  const [run, setRun] = useState(false);

  const dispatch = useAppDispatch();
  const toursToShow = useAppSelector((state) => state.userOnboarding.toursToShow);
  const showPopover = useAppSelector((state) => state.userOnboarding.showPopover);
  const showModal = useAppSelector((state) => state.userOnboarding.showModal);
  const {t: tOnboarding} = useTranslation('onboarding');

  // this useMemo gets the localized tour steps and returns them as an array of step objects to use in the Joyride component below
  const localizedTourSteps: Step[] = useMemo(() => {
    if (toursToShow) {
      const tourSteps = tOnboarding(`tours.${toursToShow}.steps`, {returnObjects: true});
      if (tourSteps) {
        console.log('the tour steps are', tourSteps);
        return Object.values(tourSteps) as Step[];
      }
    }
    return [];
  }, [toursToShow, tOnboarding]);

  // this effect sets the steps to the localized tour steps when a tour is clicked and checks if the popover or modal is open
  useEffect(() => {
    if (toursToShow && !showPopover && !showModal && !run) {
      setSteps(localizedTourSteps);
      setRun(true);
      console.log('active tour is:', toursToShow);
    }
  }, [toursToShow, showPopover, showModal, run, localizedTourSteps]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const {index, status} = data;
    console.log('Joyride callback index:', index);

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (toursToShow) {
        dispatch(setTourCompleted({tour: toursToShow, completed: true}));
      }
      dispatch(setToursToShow(null));
      setRun(false);
      setSteps([]);
      console.log('Tour completed:', toursToShow);
      dispatch(setShowPopover(true)); // this is to open the popover again after the tour is completed
    }
  };

  return (
    <div>
      <Joyride
        steps={steps}
        continuous={true}
        showSkipButton
        run={run}
        callback={handleJoyrideCallback}
        debug={true}
        scrollToFirstStep={false}
        disableScrolling={true}
        disableOverlayClose
        disableCloseOnEsc
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
