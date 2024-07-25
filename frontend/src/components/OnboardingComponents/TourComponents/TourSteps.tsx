import React, {useState, useEffect} from 'react';
import Joyride, {CallBackProps, Step, STATUS} from 'react-joyride';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {setTourCompleted, setToursToShow} from '../../../store/UserOnboardingSlice';
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
    if (toursToShow && !showPopover && !showModal) {
      console.log('show popover is: ', showPopover);
      console.log('Tour to show:', toursToShow);
      const selectedTourSteps = tourSteps[toursToShow];
      if (selectedTourSteps) {
        console.log('Selected tour steps:', selectedTourSteps);
        setSteps(selectedTourSteps);
        console.log('Setting run to true');
        setRun(true);
      }
    }
  }, [toursToShow, showPopover, tourSteps, showModal]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const {action, index, type, status, lifecycle} = data;
    console.log('Joyride callback type:', type);
    console.log('Joyride callback action:', action);
    console.log('Joyride callback data:', data);
    console.log('Joyride callback status:', status);
    console.log('Joyride callback lifecycle:', lifecycle);
    console.log('Joyride callback index:', index);

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (toursToShow) {
        dispatch(setTourCompleted({tour: toursToShow, completed: true}));
      }
      dispatch(setToursToShow(null));
      setRun(false);
      console.log('Tour completed:', toursToShow);
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
      />
    </div>
  );
}
