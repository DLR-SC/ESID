// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useState, useMemo} from 'react';
import {describe, test, afterEach} from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';
import i18n from '../../../util/i18nForTests';
import {I18nextProvider} from 'react-i18next';
import SearchBar from 'components/Sidebar/MapComponents/SearchBar';
import userEvent from '@testing-library/user-event';
import {GeoJsonProperties} from 'geojson';

const SearchBarTest = () => {
  const geoData = [
    {
      RS: '12345',
      GEN: 'Test District',
      BEZ: 'Test Type',
    },
    {
      RS: '09771',
      GEN: 'Aichach-Friedberg',
      BEZ: 'LK',
    },
    {
      RS: '00000',
      GEN: 'germany',
      BEZ: '',
    },
    {
      RS: '05315103',
      GEN: 'Köln - Altstadt/Nord (Innenstadt)',
      BEZ: 'ST',
    },
  ];

  const defaultValue = useMemo(
    () => ({
      RS: '00000',
      GEN: 'germany',
      BEZ: '',
      id: -1,
    }),
    []
  );

  const [selectedArea, setSelectedArea] = useState<GeoJsonProperties>(defaultValue);

  return (
    <SearchBar
      data={geoData}
      sortProperty={'GEN'}
      optionLabel={(option) => `${option!.GEN}${option!.BEZ ? ` (BEZ.${option!.BEZ})` : ''}`}
      autoCompleteValue={{
        RS: selectedArea!['RS' as keyof GeoJsonProperties] as string,
        GEN: selectedArea!['GEN' as keyof GeoJsonProperties] as string,
        BEZ: selectedArea!['BEZ' as keyof GeoJsonProperties] as string,
      }}
      onChange={(_event, option) => {
        if (option) {
          setSelectedArea(option);
        }
      }}
      placeholder={`${selectedArea!['GEN' as keyof GeoJsonProperties]}${selectedArea!['BEZ' as keyof GeoJsonProperties] ? ` (BEZ.${selectedArea!['BEZ' as keyof GeoJsonProperties]})` : ''}`}
      optionEqualProperty='RS'
      valueEqualProperty='RS'
    />
  );
};

describe('Searchbar', () => {
  test('countyList loaded correctly', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SearchBarTest />
      </I18nextProvider>
    );

    const searchbar = await screen.findByPlaceholderText('germany');

    await userEvent.click(searchbar);

    await screen.findByText('A');
    await screen.findByText('Aichach-Friedberg (BEZ.LK)');
    await screen.findByText('g');
    await screen.findByText('germany');
    await screen.findByText('T');
    await screen.findByText('Test District (BEZ.Test Type)');
  });

  test('select district by dropdown selection partial name (autocomplete)', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SearchBarTest />
      </I18nextProvider>
    );

    await userEvent.type(screen.getByPlaceholderText('germany'), 'Aic{Enter}');

    await screen.findByDisplayValue('Aichach-Friedberg (BEZ.LK)');
  });

  test('select district by dropdown selection with keyboard (Arrow-Down)', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SearchBarTest />
      </I18nextProvider>
    );

    await userEvent.type(screen.getByPlaceholderText('germany'), '{ArrowDown}{Enter}');

    /* [CDtemp-begin] */
    await screen.findByDisplayValue('Köln - Altstadt/Nord (Innenstadt) (BEZ.ST)');
    // [CDtemp] await screen.findByDisplayValue('Test District (BEZ.Test Type)');
    // [CDtemp] expect(Store.getState().dataSelection.district).toStrictEqual({
    // [CDtemp]   ags: '12345',
    // [CDtemp]   name: 'Test District',
    // [CDtemp]   type: 'Test Type',
    // [CDtemp] });
  });

  afterEach(() => {
    cleanup();
  });
});
