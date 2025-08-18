// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {IRootSettings, Root} from '@amcharts/amcharts5/.internal/core/Root';
import {useLayoutEffect, useState} from 'react';

export default function useRoot(
  id: string | HTMLElement,
  settings?: IRootSettings,
  initializer?: (root: Root) => void
): Root | null {
  const [root, setRoot] = useState<Root>();

  useLayoutEffect(() => {
    const newRoot = Root.new(id, settings);
    setRoot(newRoot);

    if (initializer) {
      initializer(newRoot);
    }

    return () => {
      newRoot.dispose();
    };
  }, [id, settings, initializer]);

  return root ?? null;
}
