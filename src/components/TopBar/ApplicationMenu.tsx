// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {MouseEvent, Suspense, useContext} from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import {useTranslation} from 'react-i18next';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/system/Box';
import {useAppSelector} from 'store/hooks';
import {AuthContext, IAuthContext} from 'react-oauth2-code-pkce';
import CircularProgress from '@mui/material/CircularProgress';

// Let's import pop-ups only once they are opened.
const DataUploadDialog = React.lazy(() => import('./PopUps/DataUploadDialog'));
const ChangelogDialog = React.lazy(() => import('./PopUps/ChangelogDialog'));
const ImprintDialog = React.lazy(() => import('./PopUps/ImprintDialog'));
const PrivacyPolicyDialog = React.lazy(() => import('./PopUps/PrivacyPolicyDialog'));
const AccessibilityDialog = React.lazy(() => import('./PopUps/AccessibilityDialog'));
const AttributionDialog = React.lazy(() => import('./PopUps/AttributionDialog'));

type TokenData = {
  realm_access?: {
    roles?: string[];
  };
};

/**
 * This menu is found at the top right of the application and is reachable from everywhere. It contains ways to access
 * advanced functionality and all legal texts.
 */
export default function ApplicationMenu(): JSX.Element {
  const {t} = useTranslation();

  const realm = useAppSelector((state) => state.realm.name);
  const {login, token, logOut, idToken, tokenData} = useContext<IAuthContext>(AuthContext);

  // user cannot login when realm is not selected
  const loginDisabled = realm === '';
  // user is authenticated when token is not empty
  const isAuthenticated = token !== '';

  // user is admin (can manage users)
  const isAdmin = tokenData && ((tokenData as TokenData).realm_access?.roles ?? []).includes('lha-user-admin');

  const [anchorElement, setAnchorElement] = React.useState<Element | null>(null);
  const [imprintOpen, setImprintOpen] = React.useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = React.useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = React.useState(false);
  const [attributionsOpen, setAttributionsOpen] = React.useState(false);
  const [changelogOpen, setChangelogOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  const keycloakLogout = () => {
    window.location.assign(
      `${
        import.meta.env.VITE_OAUTH_API_URL
      }/realms/${realm}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURI(
        `${import.meta.env.VITE_OAUTH_REDIRECT_URL}`
      )}&id_token_hint=${idToken}`
    );
  };

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
    login();
  };

  /** This method gets called, when the logout menu entry was clicked. */
  const logoutClicked = () => {
    closeMenu();
    logOut();
    keycloakLogout();
  };

  /** This method gets called, when the login menu entry was clicked. */
  const uploadClicked = () => {
    closeMenu();
    setUploadOpen(true);
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
        {isAuthenticated ? (
          <MenuItem onClick={logoutClicked}>{t('topBar.menu.logout')}</MenuItem>
        ) : (
          <MenuItem onClick={loginClicked} disabled={loginDisabled}>
            {t('topBar.menu.login')}
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem component='a' target='_blank' href={`${import.meta.env.VITE_OAUTH_API_URL}/admin/${realm}/console`}>
            {t('topBar.menu.admin')}
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={uploadClicked} disabled={!isAuthenticated}>
          {t('topBar.menu.upload')}
        </MenuItem>
        <MenuItem onClick={imprintClicked}>{t('topBar.menu.imprint')}</MenuItem>
        <MenuItem onClick={privacyPolicyClicked}>{t('topBar.menu.privacy-policy')}</MenuItem>
        <MenuItem onClick={accessibilityClicked}>{t('topBar.menu.accessibility')}</MenuItem>
        <MenuItem onClick={attributionClicked}>{t('topBar.menu.attribution')}</MenuItem>
        <MenuItem onClick={changelogClicked}>{t('topBar.menu.changelog')}</MenuItem>
      </Menu>

      <Dialog maxWidth='lg' fullWidth={true} open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <DataUploadDialog />
      </Dialog>

      <Dialog maxWidth='lg' fullWidth={true} open={imprintOpen} onClose={() => setImprintOpen(false)}>
        <Suspense
          fallback={
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
              <CircularProgress sx={{padding: '10rem'}} disableShrink />
            </Box>
          }
        >
          <ImprintDialog />
        </Suspense>
      </Dialog>

      <Dialog maxWidth='lg' fullWidth={true} open={privacyPolicyOpen} onClose={() => setPrivacyPolicyOpen(false)}>
        <Suspense
          fallback={
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
              <CircularProgress sx={{padding: '10rem'}} disableShrink />
            </Box>
          }
        >
          <PrivacyPolicyDialog />
        </Suspense>
      </Dialog>

      <Dialog maxWidth='lg' fullWidth={true} open={accessibilityOpen} onClose={() => setAccessibilityOpen(false)}>
        <Suspense
          fallback={
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
              <CircularProgress sx={{padding: '10rem'}} disableShrink />
            </Box>
          }
        >
          <AccessibilityDialog />
        </Suspense>
      </Dialog>

      <Dialog maxWidth='lg' fullWidth={true} open={attributionsOpen} onClose={() => setAttributionsOpen(false)}>
        <Suspense
          fallback={
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
              <CircularProgress sx={{padding: '10rem'}} disableShrink />
            </Box>
          }
        >
          <AttributionDialog />
        </Suspense>
      </Dialog>

      <Dialog maxWidth='lg' fullWidth={true} open={changelogOpen} onClose={() => setChangelogOpen(false)}>
        <Suspense
          fallback={
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
              <CircularProgress sx={{padding: '10rem'}} disableShrink />
            </Box>
          }
        >
          <ChangelogDialog />
        </Suspense>
      </Dialog>
    </Box>
  );
}
