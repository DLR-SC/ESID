// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';

import changelogDE from '../../../../docs/changelog/changelog-de.md?url';
import changelogEN from '../../../../docs/changelog/changelog-en.md?url';

/**
 * This component displays the change log.
 */
export default function ChangelogDialog(): JSX.Element {
  const {i18n} = useTranslation();
  const theme = useTheme();

  const [md, setMD] = useState<string>('');

  useEffect(() => {
    let changelogSrc = changelogEN;
    if (i18n.language.startsWith('de')) {
      changelogSrc = changelogDE;
    }

    void fetch(changelogSrc)
      .then((response) => response.text())
      .then((text) => setMD(text))
      .catch((reason) => console.error(reason));
  }, [i18n, setMD]);

  return (
    <Box
      sx={{
        padding: theme.spacing(4),
        background: theme.palette.background.paper,
      }}
    >
      <ReactMarkdown>{md}</ReactMarkdown>
    </Box>
  );
}
