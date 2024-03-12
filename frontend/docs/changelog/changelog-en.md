<!--
SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
SPDX-License-Identifier: CC-BY-4.0
-->

# ESID Changelog

## vX.X.X-alpha

**Release Date:** TBD

### New Features

- The changelog can now be viewed shown using the burger menu in the top right corner.
- The language can now be switched in the top bar between German and English.
- A new card for case data was added:
  - On selecting the card the case data will be displayed on the rest of the application correspondingly.
  - It is now also possible to view case data without any scenario activated.
- Next to the list of infection states, there is now an info box for each infection state. Currently, all states have the same information.
- The reference day is now editable. A line is being drawn to the chart to show the connection.
- The zoom control of the map now has an additional button to reset the view to the initial overview

### Improvements

- Added a label to the scenario start day.
- All numbers now show as integers only.
- The group filter editor will now ask for confirmation to discard changes, when the user selects a new group filter or closes the dialog without saving.
- All texts are now available in English and German.
- Some improvements to page load speed have been made.
- If a new feature gets rolled out, the browser cache will no longer prevent the users from seeing it.
- The DLR logo was replaced by the LOKI logo and the size was reduced.
- The line chart module is upgraded from AmCharts 4 to 5 for better performance.
- The selected infection state is now also highlighted in the scenario cards.
- The DLR logo in the tab bar was replaced with the ESID logo.
- The LOKI logo now leads to the LOKI-Pandemics, instead of the DLR website.
- It is now possible to set the date to any day containing data.
- "Case Data" was renamed to "Estimated Cases" and new translations for new infection states were added.
- The text size in tooltips was adjusted to improve readability.
- Only four aggregated compartments are displayed.
- Internal build system was replaced by Vite, which improves website performance.

### Bug fixes

- An error was fixed, which prevented the text in the search bar to be translated on an initial site visit.
- Fixed an error, where districts with missing values weren't shown.
- Fixed an error, which crashed the website when the data was updated.
- Fixed an error, which crashed the website when a scenario was removed from the database.

---

## v0.2.0-alpha

**Release Date:** 27.02.2023

### New Features

- Group Filters
  - There is a new button below the '+' card on the top right called 'Groups'.
  - This opens the group filter editor. Here you can create, toggle, edit and delete customizable groups.
    - Example of a group filter: "All people of any gender aged 35 or less"
    - Example of a group filter: "All people of any gender aged 35 or more"
    - Example of a group filter: "All males of any age"
  - The scenario cards now show the active group filters as an collapsible addon to the right.
  - The line chart displays the group filters with a different line style.

### Improvements

- All numbers on scenario cards now show as integers only.
- The cards are now bigger, so it is less likely for text to overflow.
- The app now saves, if the infection states were expanded between sessions.
- The selected district is now highlighted with an outline on the district map.

### Bug fixes

- Found an issue with the persistent cache that crashed the website when a new property is added to the persistent store
  and added a comment to prevent future errors.

---

## v0.1.0-alpha

**Release Date:** 01.01.2023

### New Features

- Scenario Cards
  - selectable compartments
  - selectable scenarios
  - cards displaying scenario values, rate of change compared to case data of start date, and trend arrow indicating positive or negative changes
  - additional compartments after main 4 are hidden behind an expand button
- Line Chart
  - selectable Date with indicator for selected date
  - zoomable x-axis
  - uncertainty (25th - 75th percentile) of selected scenario shown by semitransparent area fill
  - tooltip showing case data, scenario data, and 25th & 75th percentile values for selected scenario
- District Map
  - selectable districts
  - tooltip showing district type, name, and selected compartment value
  - search bar for districts with typing suggestions
  - heat legend
    - selection dialog for heatmap presets
    - toggle between fixed and dynamic range based on data
- Buttons to increment decrement selected day and play button to cycle through scenario days continuously, button to switch to full screen view
- Navigation menu with information about imprint, privacy policy, accessibility, and attribution
