// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {MouseEvent} from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import {useTranslation} from 'react-i18next';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/system/Box';

import ImprintDialog from './PopUps/ImprintDialog';
import PrivacyPolicyDialog from './PopUps/PrivacyPolicyDialog';
import AccessibilityDialog from './PopUps/AccessibilityDialog';
import AttributionDialog from './PopUps/AttributionDialog';

/**
 * This menu is found at the top right of the application and is reachable from everywhere. It contains ways to access
 * advanced functionality and all legal texts.
 */
export default function ApplicationMenu(): JSX.Element {
  const {t} = useTranslation();

  const [anchorElement, setAnchorElement] = React.useState<Element | null>(null);
  const [imprintOpen, setImprintOpen] = React.useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = React.useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = React.useState(false);
  const [attributionsOpen, setAttributionsOpen] = React.useState(false);

  /** Calling this method opens the application menu. */
  const openMenu = (event: MouseEvent) => {
    setAnchorElement(event.currentTarget);
  };

  /** Calling this method closes the application menu. */
  const closeMenu = () => {
    setAnchorElement(null);
  };

  /** This method gets called, when the imprint menu entry was clicked. It opens a dialog showing the legal text. */
  const imprintClicked = () => {
    closeMenu();
    setImprintOpen(true);
  };

  /** This method gets called, when the privacy policy menu entry was clicked. */
  const privacyPolicyClicked = () => {
    closeMenu();
    setPrivacyPolicyOpen(true);
  };

  /** This method gets called, when the accessibility menu entry was clicked. */
  const accessibilityClicked = () => {
    closeMenu();
    setAccessibilityOpen(true);
  };

  /** This method gets called, when the attribution menu entry was clicked. */
  const attributionClicked = () => {
    closeMenu();
    setAttributionsOpen(true);
  };

  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
      <Button
        id='top-bar-menu-button'
        aria-label={t('topBar.menu.label')}
        aria-controls='application-menu'
        aria-haspopup='true'
        onClick={openMenu}
      >
        <MenuIcon />
      </Button>
      <Menu id='application-menu' anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={closeMenu}>
        <MenuItem onClick={imprintClicked}>{t('topBar.menu.imprint')}</MenuItem>
        <MenuItem onClick={privacyPolicyClicked}>{t('topBar.menu.privacy-policy')}</MenuItem>
        <MenuItem onClick={accessibilityClicked}>{t('topBar.menu.accessibility')}</MenuItem>
        <MenuItem onClick={attributionClicked}>{t('topBar.menu.attribution')}</MenuItem>
      </Menu>

      <Dialog maxWidth='lg' fullWidth={true} open={imprintOpen} onClose={() => setImprintOpen(false)}>
        <ImprintDialog />
      </Dialog>

      <Dialog maxWidth='lg' fullWidth={true} open={privacyPolicyOpen} onClose={() => setPrivacyPolicyOpen(false)}>
        <PrivacyPolicyDialog />
      </Dialog>

      <Dialog maxWidth='lg' fullWidth={true} open={accessibilityOpen} onClose={() => setAccessibilityOpen(false)}>
        <AccessibilityDialog />
      </Dialog>

      <Dialog maxWidth='lg' fullWidth={true} open={attributionsOpen} onClose={() => setAttributionsOpen(false)}>
        <AttributionDialog />
      </Dialog>
    </Box>
  );
}
