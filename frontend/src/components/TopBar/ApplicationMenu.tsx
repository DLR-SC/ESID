// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {MouseEvent} from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import {useTranslation} from 'react-i18next';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/system/Box';

// Let's import pop-ups only once they are opened.
const ChangelogDialog = React.lazy(() => import('./PopUps/ChangelogDialog'));
const ImprintDialog = React.lazy(() => import('./PopUps/ImprintDialog'));
const PrivacyPolicyDialog = React.lazy(() => import('./PopUps/PrivacyPolicyDialog'));
const AccessibilityDialog = React.lazy(() => import('./PopUps/AccessibilityDialog'));
const AttributionDialog = React.lazy(() => import('./PopUps/AttributionDialog'));

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
  const [changelogOpen, setChangelogOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  /** Calling this method opens the application menu. */
  const openMenu = (event: MouseEvent) => {
    setAnchorElement(event.currentTarget);
  };

  /** Calling this method closes the application menu. */
  const closeMenu = () => {
    setAnchorElement(null);
  };

  /** This method gets called, when the login menu entry was clicked. */
  const loginClicked = () => {
    closeMenu();
    setSnackbarOpen(true);
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

  /** This method gets called, when the changelog menu entry was clicked. */
  const changelogClicked = () => {
    closeMenu();
    setChangelogOpen(true);
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
        <MenuItem onClick={loginClicked}>{t('topBar.menu.login')}</MenuItem>
        <Divider />
        <MenuItem onClick={imprintClicked}>{t('topBar.menu.imprint')}</MenuItem>
        <MenuItem onClick={privacyPolicyClicked}>{t('topBar.menu.privacy-policy')}</MenuItem>
        <MenuItem onClick={accessibilityClicked}>{t('topBar.menu.accessibility')}</MenuItem>
        <MenuItem onClick={attributionClicked}>{t('topBar.menu.attribution')}</MenuItem>
        <MenuItem onClick={changelogClicked}>{t('topBar.menu.changelog')}</MenuItem>
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

      <Dialog maxWidth='lg' fullWidth={true} open={changelogOpen} onClose={() => setChangelogOpen(false)}>
        <ChangelogDialog />
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity='info'>
          {t('WIP')}
        </Alert>
      </Snackbar>
    </Box>
  );
}
