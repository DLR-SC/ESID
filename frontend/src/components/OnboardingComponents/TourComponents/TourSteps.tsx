// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useEffect} from 'react';
import Joyride, {CallBackProps, Step, STATUS} from 'react-joyride';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {setShowPopover, setTourCompleted, setToursToShow} from '../../../store/UserOnboardingSlice';
import {TourStep} from 'types/tourStep';
import tourStepsData from '../../../../assets/tourSteps.json';

export default function TourSteps(): JSX.Element {
  const [steps, setSteps] = useState<Step[]>([]);
  const [run, setRun] = useState(false);

  const dispatch = useAppDispatch();
  const tourSteps: TourStep = tourStepsData as unknown as TourStep;
  const toursToShow = useAppSelector((state) => state.userOnboarding.toursToShow);
  const showPopover = useAppSelector((state) => state.userOnboarding.showPopover);
  const showModal = useAppSelector((state) => state.userOnboarding.showModal);

  useEffect(() => {
    if (toursToShow && !showPopover && !showModal && !run) {
      console.log('Tour to show:', toursToShow);
      const selectedTourSteps = tourSteps[toursToShow];
      if (selectedTourSteps) {
        setSteps(selectedTourSteps);
        setRun(true);
      }
    }
  }, [toursToShow, showPopover, showModal, run, tourSteps]);

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
      />
    </div>
  );
}
