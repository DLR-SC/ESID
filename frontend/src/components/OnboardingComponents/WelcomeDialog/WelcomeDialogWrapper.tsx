// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppSelector, useAppDispatch} from '../../../store/hooks';
import {setShowWelcomeDialog, setTourCompleted, setShowTooltip} from '../../../store/UserOnboardingSlice';
import WelcomeDialog from './WelcomeDialog';
import esidLogo from '../../../../assets/logo/logo-200x66.png';
import welcomeSlidesIllustration1 from '../../../../assets/illustrations/illustration-1.png';
import welcomeSlidesIllustration2 from '../../../../assets/illustrations/illustration-2.svg';
import welcomeSlidesIllustration3 from '../../../../assets/illustrations/illustration-3.svg';
import welcomeSlidesIllustration4 from '../../../../assets/illustrations/illustration-4.png';
import welcomeSlidesIllustration5 from '../../../../assets/illustrations/illustration-5.svg';

/**
 * This component wraps the WelcomeDialog component and handles its state.
 */
export default function WelcomeDialogWrapper(): JSX.Element {
  const {t: tOnboarding} = useTranslation('onboarding');
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);
  const showWelcomeDialog = useAppSelector((state) => state.userOnboarding.showWelcomeDialog);
  const tours = useAppSelector((state) => state.userOnboarding.tours);

  /**
   * This useMemo hook gets the number of slides from the translation.
   */
  const {numberOfSlides} = useMemo(() => {
    const slideKeys = Object.keys(tOnboarding('welcomeModalSlides', {returnObjects: true}));
    return {
      slideKeys: slideKeys,
      numberOfSlides: slideKeys.length,
    };
  }, [tOnboarding]);

  /**
   * This effect checks if the user has already taken at least one tour, if not, the welcome dialog is shown.
   */
  useEffect(() => {
    const isUserFirstTime = Object.values(tours).every((tour) => tour === null);
    if (isUserFirstTime) {
      dispatch(setShowWelcomeDialog(true));
    }
  }, [dispatch, tours]);

  /**
   * Those functions handle the next and previous button of the dialog.
   */
  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  /**
   * This function handles the closing of the dialog and after shows the tooltip over the information button.
   */
  const handleClose = useCallback(() => {
    dispatch(setShowWelcomeDialog(false));
    dispatch(setShowTooltip(true));
    Object.keys(tours).forEach((tourKey) => {
      if (tours[tourKey as keyof typeof tours] === null) {
        dispatch(setTourCompleted({tour: tourKey as keyof typeof tours, completed: false}));
      }
    });
  }, [dispatch, tours]);

  /**
   * This useMemo hook memoizes the images to be shown in the welcome dialog.
   */
  const memoizedImages: {[key: number]: string} = useMemo(
    () => ({
      0: esidLogo,
      1: welcomeSlidesIllustration1,
      2: welcomeSlidesIllustration2,
      3: welcomeSlidesIllustration3,
      4: welcomeSlidesIllustration4,
      5: welcomeSlidesIllustration5,
    }),
    []
  );

  /**
   * This useMemo gets the slide title, content, maybe later text and if the tour chips should be shown on the last slide.
   */
  const {slideTitle, slideContent, maybeLaterText, showTourChips, showLanguagePicker} = useMemo(() => {
    const slideTitle = tOnboarding(`welcomeModalSlides.slide${step + 1}.title`);
    const slideContent = tOnboarding(`welcomeModalSlides.slide${step + 1}.content`);
    const maybeLaterText = tOnboarding('maybeLater');
    const showTourChips = step === numberOfSlides - 1;
    const showLanguagePicker = step === 0;
    return {slideTitle, slideContent, maybeLaterText, showTourChips, showLanguagePicker};
  }, [step, numberOfSlides, tOnboarding]);

  return (
    <WelcomeDialog
      open={showWelcomeDialog}
      step={step}
      onClose={handleClose}
      onNext={handleNext}
      onPrev={handlePrev}
      numberOfSlides={numberOfSlides}
      images={memoizedImages}
      title={slideTitle}
      content={slideContent}
      showTourChips={showTourChips}
      showLanguagePicker={showLanguagePicker}
      maybeLaterText={maybeLaterText}
    />
  );
}
