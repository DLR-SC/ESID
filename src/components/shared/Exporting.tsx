// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useLayoutEffect, useState} from 'react';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';
import {Exporting} from '@amcharts/amcharts5/.internal/plugins/exporting/Exporting';
import {IExportingSettings} from '@amcharts/amcharts5/.internal/plugins/exporting/Exporting';

export default function useExporting(
  root: Root | null,
  settings: IExportingSettings,
  initializer?: (exporting: Exporting) => void
): Exporting | null {
  const [exporting, setExporting] = useState<Exporting>();

  useLayoutEffect(() => {
    if (!root) {
      return;
    }

    const newExporting = Exporting.new(root, settings);
    setExporting(newExporting);

    if (initializer) {
      initializer(newExporting);
    }

    return () => {
      newExporting.dispose();
    };
  }, [root, settings, initializer]);

  return exporting || null;
}
