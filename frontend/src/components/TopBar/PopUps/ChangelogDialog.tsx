import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import ReactMarkdown from "react-markdown";

/**
 * This component displays the change log.
 */
export default function ChangelogDialog(): JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  const [md, setMD] = useState<string>("");

  useEffect(() => {
    void fetch(t("topBar.menu.changelog-path"))
      .then((response) => response.text())
      .then((text) => setMD(text))
      .catch(reason => console.error(reason));
  }, [t, setMD]);

  return (
    <Box
      sx={{
        padding: theme.spacing(4),
        background: theme.palette.background.paper
      }}
    >
      <ReactMarkdown>{md}</ReactMarkdown>
    </Box>
  );
}
