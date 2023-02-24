# ESID Changelog

## Next Release
**Release Date:** TBD

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
- The app now saves, if the compartments were expanded between sessions.

### Bug fixes
- Found an issue with the persistent cache that crashed the website when a new property is added to the persistent store 
  and added a comment to prevent future errors.

---

## v0.1
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
