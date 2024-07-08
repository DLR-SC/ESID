// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {useState, useLayoutEffect} from 'react';
import * as am5map from '@amcharts/amcharts5/map';
import {Root} from '@amcharts/amcharts5/.internal/core/Root';

export default function useZoomControl(
  root: Root | null,
  settings: am5map.IZoomControlSettings,
  initializer?: (zoom: am5map.ZoomControl) => void
): am5map.ZoomControl | null {
  const [zoom, setZoom] = useState<am5map.ZoomControl>();

  useLayoutEffect(() => {
    if (!root) {
      return;
    }

    const newZoom = am5map.ZoomControl.new(root, settings);

    if (initializer) {
      initializer(newZoom);
    }

    setZoom(newZoom);

    return () => {
      newZoom.removeAll();
      newZoom.dispose();
    };
  }, [root, settings, initializer]);

  return zoom ?? null;
}
