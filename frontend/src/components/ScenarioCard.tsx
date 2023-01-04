import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Button, Collapse, IconButton, List, ListItem, ListItemText, Tooltip, Typography } from "@mui/material";
import { useAppSelector } from "store/hooks";
import { useGetSingleSimulationEntryQuery } from "store/services/scenarioApi";
import { Dictionary } from "../util/util";
import { useTranslation } from "react-i18next";
import { NumberFormatter } from "../util/hooks";
import { CheckBox, CheckBoxOutlineBlank, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useGetMultipleFilterDataQuery } from "../store/services/groupApi";
import { ScrollSyncPane } from "react-scroll-sync";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

/**
 * React Component to render individual Scenario Card
 * @prop {ScenarioCardProps} props - The props for the component.
 * @returns {JSX.Element} JSX Element to render the scenario card.
 */
export default function ScenarioCard(props: ScenarioCardProps): JSX.Element {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const { formatNumber } = NumberFormatter(i18n.language, 1, 0);

  const [compartmentValues, setCompartmentValues] = useState<Dictionary<number> | null>(null);

  const compartments = useAppSelector((state) => state.scenarioList.compartments);
  const node = useAppSelector((state) => state.dataSelection.district?.ags);
  const day = useAppSelector((state) => state.dataSelection.date);

  const { data } = useGetSingleSimulationEntryQuery(
    {
      id: props.scenario.id,
      node: node,
      day: day ?? "",
      groups: ["total"]
    },
    { skip: !day }
  );


  const [hover, setHover] = useState<boolean>(false);

  useEffect(() => {
    if (data && data.results.length > 0) {
      setCompartmentValues(data.results[0].compartments);
    }
  }, [data]);

  const getCompartmentValue = (compartment: string): string => {
    if (compartmentValues && compartment in compartmentValues) {
      return formatNumber(compartmentValues[compartment]);
    }
    return t("no-data");
  };

  const getCompartmentRate = (compartment: string): string => {
    if (
      compartmentValues &&
      compartment in compartmentValues &&
      props.startValues &&
      compartment in props.startValues
    ) {
      const value = compartmentValues[compartment];
      const startValue = props.startValues[compartment];
      const result = Math.round(100 * (value / startValue) - 100);
      if (isFinite(result)) {
        const sign = result === 0 ? "\u00B1" : result > 0 ? "+" : "-";
        return sign + Math.abs(result).toFixed() + "%";
      }
    }

    return "\u2012";
  };

  const TrendArrow = (props: { compartment: string }): JSX.Element => {
    const compartment = props.compartment;
    // Shows downwards green arrows if getCompartmentRate < 0%.
    if (parseFloat(getCompartmentRate(compartment)) < 0) {
      return <ArrowDropDownIcon color={"success"} fontSize={"medium"} sx={{ display: "block" }} />;
    }
    // Shows upwards red arrows if getCompartmentRate > 3%. If there is no RKI value for that compartment i.e., getCompartmentRate is Null, then it will check the getCompartmentValue (scenario values only) which will always be positive.
    else if (
      parseFloat(getCompartmentRate(compartment)) > 3 ||
      (parseFloat(getCompartmentValue(compartment)) > 0 && getCompartmentRate(compartment) === "\u2012")
    ) {
      return <ArrowDropUpIcon color={"error"} fontSize={"medium"} sx={{ display: "block" }} />;
    }
    // Shows grey arrows (stagnation) if getCompartmentRate is between 0 and 3 % or if there is no RKI value.
    else {
      return <ArrowRightIcon color={"action"} fontSize={"medium"} sx={{ display: "block" }} />;
    }
  };

  return (
    <Box
      id={`scenario-card-root-${props.scenario.id}`}
      sx={{
        display: "flex",
        flexDirection: "row",
        color: props.color,
        width: "min-content",
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3)
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 0,
          flexGrow: 0,
          flexShrink: 0,
          width: "200px",
          boxSizing: "border-box",
          marginX: "2px",
          marginY: theme.spacing(2),
          marginBottom: 0
        }}
        onMouseLeave={() => setHover(false)}
      >
        {/*hover-state*/}
        <Box
          id={`scenario-card-settings-list-${props.scenario.id}`}
          sx={{
            position: "absolute",
            zIndex: -2,
            width: "calc(100% + 12px)",
            height: "100%",
            marginTop: "-6px",
            marginLeft: "-6px",
            borderRadius: "9px", //matching the radius of the box shadow
            background: hexToRGB(props.color, 0.4),
            display: hover ? "flex" : "none",
            alignItems: "flex-end"
          }}
        >
          <Tooltip
            title={props.active ? t("scenario.deactivate").toString() : t("scenario.activate").toString()}
            arrow={true}
          >
            <IconButton
              color={"primary"}
              onClick={() => props.onToggle()}
              aria-label={props.active ? t("scenario.deactivate") : t("scenario.activate")}
            >
              {props.active ? <CheckBox /> : <CheckBoxOutlineBlank />}
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          id={`scenario-card-main-card-${props.scenario.id}`}
          sx={{
            position: "relative",
            zIndex: 0,
            boxSizing: "border-box",
            height: "min-content",
            padding: theme.spacing(2),
            border: `2px solid ${props.color}`,
            borderRadius: "3px",
            background: theme.palette.background.paper,
            color: props.color,
            boxShadow: props.selected && !hover ? `0px 0px 0px 6px ${hexToRGB(props.color, 0.4)}` : "none",
            transition: "transform 0.5s",
            transformStyle: "preserve-3d",
            transform: !props.active ? "rotateY(180deg)" : "none"
          }}
          onClick={props.active ? () => props.onClick() : () => true}
          onMouseEnter={() => setHover(true)}
        >
          {/*back*/}
          <Box
            id={`scenario-card-back-${props.scenario.id}`}
            sx={{
              position: "absolute",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              margin: "6px"
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                height: "3rem",
                marginLeft: theme.spacing(2)
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  height: "min-content",
                  fontWeight: "bold",
                  fontSize: "13pt"
                }}
              >
                {props.scenario.label}
              </Typography>
            </Box>
          </Box>
          {/*front*/}
          <Box
            id={`scenario-card-front-${props.scenario.id}`}
            sx={{
              transform: "rotateY(0deg)", //firefox ignores backface-visibility if the object is not rotated
              backfaceVisibility: "hidden",
              margin: "6px"
            }}
          >
            <Box
              id={`scenario-card-title-container-${props.scenario.id}`}
              sx={{
                display: "flex",
                alignItems: "flex-end",
                height: "3rem",
                marginBottom: theme.spacing(1)
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  height: "min-content",
                  fontWeight: "bold",
                  fontSize: "13pt"
                }}
              >
                {props.scenario.label}
              </Typography>
            </Box>
            <ScrollSyncPane group="compartments">
              <List
                id={`scenario-card-compartment-list-${props.scenario.id}`}
                className="hide-scrollbar"
                dense={true}
                disablePadding={true}
                sx={{
                  maxHeight: props.expandProperties ? "248px" : "auto",
                  overflowX: "hidden",
                  overflowY: "auto"
                }}
              >
                {compartments.map((compartment, i) => (
                  // hide compartment if expandProperties false and index > 4
                  // highlight compartment if selectedProperty === compartment
                  <ListItem
                    key={compartment}
                    sx={{
                      display: props.expandProperties || i < 4 ? "flex" : "none",
                      color:
                        props.selectedProperty === compartment
                          ? theme.palette.text.primary
                          : theme.palette.text.disabled,
                      padding: theme.spacing(1),
                      margin: theme.spacing(0),
                      marginTop: theme.spacing(1),
                      borderTop: "2px solid transparent",
                      borderBottom: "2px solid transparent"
                    }}
                  >
                    <ListItemText
                      primary={getCompartmentValue(compartment)}
                      // disable child typography overriding this
                      disableTypography={true}
                      sx={{
                        typography: "listElement",
                        textAlign: "right",
                        flexBasis: "55%"
                      }}
                    />
                    <ListItemText
                      primary={getCompartmentRate(compartment)}
                      // disable child typography overriding this
                      disableTypography={true}
                      sx={{
                        typography: "listElement",
                        fontWeight: "bold",
                        textAlign: "right",
                        flexBasis: "45%"
                      }}
                    />
                    <TrendArrow compartment={compartment} />
                  </ListItem>
                ))}
              </List>
            </ScrollSyncPane>
          </Box>
        </Box>
      </Box>
      <ActivateFilters id={props.scenario.id} selectedProperty={props.selectedProperty}
                       expanded={props.expandProperties} active={props.active} color={props.color} />
    </Box>
  );
}


function ActivateFilters(props: {
  id: number;
  selectedProperty: string;
  expanded: boolean;
  active: boolean;
  color: string;
}): JSX.Element | null {
  const theme = useTheme();
  const filterList = useAppSelector((state) => state.dataSelection.filter);

  const [folded, fold] = useState(true);

  if (!props.active || !filterList) {
    return null;
  }

  const filterArray = Object.values(filterList);
  for (let i = 0; i < filterArray.length; i++) {
    if (filterArray[i].toggle) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            marginY: theme.spacing(2),
            marginLeft: "-3px",
            padding: "1px",
            height: "min-content",
            border: `1px solid ${props.color}`,
            borderRadius: "3px",
            background: theme.palette.background.paper
          }}
        >
          <Button
            sx={{
              width: "26px",
              minWidth: "26px",
              borderRight: `1px solid ${theme.palette.divider}`
            }}
            onClick={() => fold(!folded)}
          >
            {folded ? <ChevronLeft /> : <ChevronRight />}
          </Button>
          <Collapse in={folded} orientation="horizontal">
            <FilterInfo id={props.id} selectedProperty={props.selectedProperty} expanded={props.expanded} />
          </Collapse>
        </Box>
      );
    }
  }

  return null;
}

function FilterInfo(props: {
  id: number;
  selectedProperty: string;
  expanded: boolean;
}): JSX.Element | null {
  const theme = useTheme();

  const day = useAppSelector((state) => state.dataSelection.date);
  const node = useAppSelector((state) => state.dataSelection.district?.ags);

  const filterList = useAppSelector((state) => state.dataSelection.filter);

  const { data: filterData } = useGetMultipleFilterDataQuery(
    filterList && day
      ? Object.values(filterList)
        .filter((filter) => filter.toggle)
        .map((filter) => {
          return {
            id: props.id,
            node: node,
            day: day,
            filter: filter
          };
        })
      : []
  );

  if (filterList && Object.values(filterList).length > 0 && filterData && Object.values(filterList)[0].name) {
    return (
      <Box
        id={`scenario-card-${props.id}-group-filter-list`}
        sx={{
          display: "flex",
          flexDirection: "row"
        }}
      >
        {Object.keys(filterData).map((filterName, i) => {
          return (
            <Box
              id={`scenario-card-${props.id}-group-filter-root-${i}`}
              key={filterName}
              sx={{
                padding: theme.spacing(2),
                margin: "6px",
                alignContent: "center",
                borderLeft: i == 0 ? null : `1px solid`,
                borderColor: i == 0 ? null : "divider"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  height: "3rem",
                  marginBottom: theme.spacing(1)
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    height: "min-content",
                    fontWeight: "bold",
                    fontSize: "13pt"
                  }}
                >
                  {filterName}
                </Typography>
              </Box>
              <FilterCompartmentValues id={props.id} selectedProperty={props.selectedProperty}
                                       expanded={props.expanded} filterName={filterName}
                                       filterIndex={i} />
            </Box>
          );
        })}
      </Box>
    );
  } else {
    return null;
  }
}

function FilterCompartmentValues(props: {
  filterName: string;
  filterIndex: number;
  id: number;
  selectedProperty: string;
  expanded: boolean
}): JSX.Element | null {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const { formatNumber } = NumberFormatter(i18n.language, 1, 0);

  const filterList = useAppSelector((state) => state.dataSelection.filter);
  const day = useAppSelector((state) => state.dataSelection.date);
  const node = useAppSelector((state) => state.dataSelection.district?.ags);
  const compartments = useAppSelector((state) => state.scenarioList.compartments);

  const { data: filterData } = useGetMultipleFilterDataQuery(
    filterList && day
      ? Object.values(filterList)
        .filter((filter) => filter.toggle)
        .map((filter) => {
          return {
            id: props.id,
            node: node,
            day: day,
            filter: filter
          };
        })
      : []
  );

  const groupCompartmentsRef = useRef<Array<HTMLUListElement | null>>([]);

  //ref Array Size
  useEffect(() => {
    if (filterList) {
      groupCompartmentsRef.current.slice(0, Object.values(filterList).length);
    }
  }, [filterList]);

  const getGroupValue = (filterName: string, compartment: string): string => {
    if (!filterData || !filterData[filterName]) {
      return t("no-data");
    }

    const filterResults = filterData[filterName].results;
    if (filterResults.length === 0 || !(compartment in filterResults[0].compartments)) {
      return t("no-data");
    }

    return formatNumber(filterResults[0].compartments[compartment]);
  };

  if (filterData && filterData[props.filterName]) {
    return (
      <ScrollSyncPane group="compartments">
        <List
          id={`scenario-card-${props.id}-group-filter-compartment-list-${props.filterIndex}`}
          className="hide-scrollbar"
          ref={(el) => (groupCompartmentsRef.current[props.filterIndex] = el)}
          dense={true}
          disablePadding={true}
          sx={{
            maxHeight: props.expanded ? "248px" : "auto",
            overflowX: "hidden",
            overflowY: "auto"
          }}
        >
          {compartments.map((compartment, i) => {
            return (
              // hide compartment if expandProperties false and index > 4
              // highlight compartment if selectedProperty === compartment
              <ListItem
                key={compartment}
                sx={{
                  display: props.expanded || i < 4 ? "flex" : "none",
                  color:
                    props.selectedProperty === compartment
                      ? theme.palette.text.primary
                      : theme.palette.text.disabled,
                  alignContent: "center",
                  padding: theme.spacing(1),
                  margin: theme.spacing(0),
                  marginTop: theme.spacing(1),
                  borderTop: "2px solid transparent",
                  borderBottom: "2px solid transparent"
                }}
              >
                <ListItemText
                  primary={getGroupValue(props.filterName, compartment)}
                  // disable child typography overriding this
                  disableTypography={true}
                  sx={{
                    typography: "listElement",
                    textAlign: "right",
                    minWidth: "88px"
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </ScrollSyncPane>
    );
  } else {
    return null;
  }
}


/** Type definition for the ScenarioCard props */
interface ScenarioCardProps {
  /** The scenario this card is displaying. */
  scenario: {
    /** The identifier for the scenario. */
    id: number;

    /** The label for the scenario displayed to the user. */
    label: string;
  };

  /** The key for this scenario (index from the map function for the scenario list). */
  key: number;

  /** Boolean value whether the scenario is the selected scenario. */
  selected: boolean;

  /** Boolean value whether the scenario is active (not flipped). */
  active: boolean;

  /** The color of the card. */
  color: string;

  /** The compartment name of the currently selected compartment, or empty string if none is selected. */
  selectedProperty: string;

  /** Boolean value whether the properties list is expanded or only the first four are shown. */
  expandProperties: boolean;

  startValues: Dictionary<number> | null;

  /** The function that is executed when the scenario card is clicked. */
  onClick: () => void;

  /** The function that is executed when the disable toggle is clicked. */
  onToggle: () => void;
}

function hexToRGB(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r.toString() + ", " + g.toString() + ", " + b.toString() + ", " + alpha.toString() + ")";
  } else {
    return "rgb(" + r.toString() + ", " + g.toString() + ", " + b.toString() + ")";
  }
}
