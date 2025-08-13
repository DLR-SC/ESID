// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {createContext, useCallback, useContext, useState} from 'react';
import {Exporting} from '@amcharts/amcharts5/.internal/plugins/exporting/Exporting';

type ExportRegistry = Record<string, Exporting>;

interface ExportContextAPI {
  register: (name: string, exporting: Exporting) => void;
  unregister: (name: string) => void;
  get: (name: string) => Exporting | null;
}

export const ExportContext = createContext<ExportContextAPI | null>(null);

export default function ExportingRegistry({children}: {children: React.ReactNode}): JSX.Element {
  const [exporting, setExporting] = useState<ExportRegistry>({});

  const register = useCallback((name: string, exporting: Exporting) => {
    setExporting((prev) => ({...prev, [name]: exporting}));
  }, []);

  const unregister = useCallback((name: string) => {
    setExporting((prev) => {
      const {[name]: _, ...rest} = prev;
      return rest;
    });
  }, []);

  const get = useCallback((name: string) => exporting[name] ?? null, [exporting]);

  return <ExportContext.Provider value={{register, unregister, get}}>{children}</ExportContext.Provider>;
}

export function useExportingRegistry(): ExportContextAPI {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error('useExportingRegistry must be used within a ExportContext');
  }
  return context;
}
