// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import ManageGroup from './ManageGroupMenu';
import React, {useState} from 'react';
import {GroupCategory, GroupSubcategory} from 'store/services/groupApi';
import {GroupFilter} from 'types/group';
import {Dictionary} from 'util/util';
import {Localization} from 'types/localization';

export interface FilterContainerProps {
  /** A dictionary of group filters.*/
  groupFilters: Dictionary<GroupFilter>;

  /** An array of group category.*/
  groupCategories: GroupCategory[];

  /** An array of group subcategory.*/
  groupSubCategories: GroupSubcategory[];

  /** A function that allows setting the unsavedChanges state so that if the user adds a filter, the new filter will be visible */
  setUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;

  /** A function that allows setting the groupFilter state so that if the user adds a filter, the new filter will be visible */
  setGroupFilters: React.Dispatch<React.SetStateAction<Dictionary<GroupFilter>>>;

  /** An object containing localization information (translation & number formattation).*/
  localization?: Localization;
}

/**
 * This component renders the container for the manage filter menu.
 */
export default function FilterContainer({
  groupFilters,
  setGroupFilters,
  groupCategories,
  groupSubCategories,
  setUnsavedChanges,
  localization = {formatNumber: (value: number) => value.toString(), customLang: 'global', overrides: {}},
}: FilterContainerProps) {
  const [groupEditorUnsavedChanges, setGroupEditorUnsavedChanges] = useState(false);

  const handleGroupEditorUnsavedChanges = (hasChanges: boolean) => {
    setGroupEditorUnsavedChanges(hasChanges);
    setUnsavedChanges(hasChanges); // Pass unsaved changes to LineChartSettings
  };
  return (
    <>
      <ManageGroup
        groupFilters={groupFilters}
        setGroupFilters={setGroupFilters}
        groupCategories={groupCategories}
        groupSubCategories={groupSubCategories}
        unsavedChangesCallback={handleGroupEditorUnsavedChanges}
        onCloseRequest={() => {
          if (groupEditorUnsavedChanges) {
            setUnsavedChanges(true);
          } else {
            setUnsavedChanges(false);
          }
        }}
        localization={localization}
      />
    </>
  );
}
