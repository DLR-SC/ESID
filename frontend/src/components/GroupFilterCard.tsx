import { useTheme } from "@mui/material/styles";
import { useAppSelector } from "../store/hooks";
import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Collapse from "@mui/material/Collapse";
import { useGetMultipleGroupFilterDataQuery } from "../store/services/groupApi";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { NumberFormatter } from "../util/hooks";
import { ScrollSyncPane } from "react-scroll-sync";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

interface GroupFilterCardProps {
  /** The scenario id. */
  id: number;

  /** The currently selected infection state. */
  selectedProperty: string;

  /** If the list of infection states is expanded. */
  expanded: boolean;

  /** If the scenario is active. */
  active: boolean;

  /** The scenario color. */
  color: string;
}

/**
 * This component is placed on the right side of the scenario cards, if at least one group filter is active. It contains
 * a button to open and close the card appendage for the active group filters.
 */
export function GroupFilterCard(props: GroupFilterCardProps): JSX.Element | null {
  const theme = useTheme();
  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);

  const [folded, fold] = useState(true);

  if (!props.active || !groupFilterList) {
    return null;
  }

  const groupFilterArray = Object.values(groupFilterList);
  for (let i = 0; i < groupFilterArray.length; i++) {
    if (groupFilterArray[i].toggle) {
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
            <GroupFilterCardContainer id={props.id} selectedProperty={props.selectedProperty}
                                              expanded={props.expanded} />
          </Collapse>
        </Box>
      );
    }
  }

  return null;
}

interface GroupFilterCardContainerProps {
  /** The scenario id. */
  id: number;

  /** The currently selected infection state. */
  selectedProperty: string;

  /** If the list of infection states is currently expanded. */
  expanded: boolean;
}

/**
 * This is responsible for displaying the different active group filters. Each active group filter is a column with a
 * title and the compartment values below.
 */
function GroupFilterCardContainer(props: GroupFilterCardContainerProps): JSX.Element | null {
  const theme = useTheme();

  const day = useAppSelector((state) => state.dataSelection.date);
  const node = useAppSelector((state) => state.dataSelection.district?.ags);

  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);

  const { data: groupFilterData } = useGetMultipleGroupFilterDataQuery(
    groupFilterList && day
      ? Object.values(groupFilterList)
        .filter((groupFilter) => groupFilter.toggle)
        .map((groupFilter) => {
          return {
            id: props.id,
            node: node,
            day: day,
            groupFilter: groupFilter
          };
        })
      : []
  );

  if (
    groupFilterList &&
    Object.values(groupFilterList).length > 0 &&
    groupFilterData &&
    Object.values(groupFilterList)[0].name
  ) {
    return (
      <Box
        id={`scenario-card-${props.id}-group-filter-list`}
        sx={{
          display: "flex",
          flexDirection: "row"
        }}
      >
        {Object.keys(groupFilterData).map((groupFilterName, i) => {
          return (
            <Box
              id={`scenario-card-${props.id}-group-filter-root-${i}`}
              key={groupFilterName}
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
                  {groupFilterName}
                </Typography>
              </Box>
              <GroupFilterCardCompartmentValues
                id={props.id}
                selectedProperty={props.selectedProperty}
                expanded={props.expanded}
                groupFilterName={groupFilterName}
                groupFilterIndex={i}
              />
            </Box>
          );
        })}
      </Box>
    );
  } else {
    return null;
  }
}

interface GroupFilterCardCompartmentValuesProps {
  /** The name of this group filter. */
  groupFilterName: string;

  /** The index in the list of group filters. */
  groupFilterIndex: number;

  /** The scenario card id. */
  id: number;

  /** The currently selected infection state. */
  selectedProperty: string;

  /** If the list of infection states is currently expanded. */
  expanded: boolean;
}

/**
 * This component renders all compartment values of a group filter in one column.
 */
function GroupFilterCardCompartmentValues(props: GroupFilterCardCompartmentValuesProps): JSX.Element | null {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const { formatNumber } = NumberFormatter(i18n.language, 1, 0);

  const groupFilterList = useAppSelector((state) => state.dataSelection.groupFilters);
  const day = useAppSelector((state) => state.dataSelection.date);
  const node = useAppSelector((state) => state.dataSelection.district?.ags);
  const compartments = useAppSelector((state) => state.scenarioList.compartments);

  const { data: groupFilterData } = useGetMultipleGroupFilterDataQuery(
    groupFilterList && day
      ? Object.values(groupFilterList)
        .filter((groupFilter) => groupFilter.toggle)
        .map((groupFilter) => {
          return {
            id: props.id,
            node: node,
            day: day,
            groupFilter: groupFilter
          };
        })
      : []
  );

  const groupCompartmentsRef = useRef<Array<HTMLUListElement | null>>([]);

  useEffect(() => {
    if (groupFilterList) {
      groupCompartmentsRef.current.slice(0, Object.values(groupFilterList).length);
    }
  }, [groupFilterList]);

  const getGroupValue = (groupFilterName: string, compartment: string): string => {
    if (!groupFilterData || !groupFilterData[groupFilterName]) {
      return t("no-data");
    }

    const groupFilterResults = groupFilterData[groupFilterName].results;
    if (groupFilterResults.length === 0 || !(compartment in groupFilterResults[0].compartments)) {
      return t("no-data");
    }

    return formatNumber(groupFilterResults[0].compartments[compartment]);
  };

  if (groupFilterData && groupFilterData[props.groupFilterName]) {
    return (
      <ScrollSyncPane group="compartments">
        <List
          id={`scenario-card-${props.id}-group-filter-compartment-list-${props.groupFilterIndex}`}
          className="hide-scrollbar"
          ref={(el) => (groupCompartmentsRef.current[props.groupFilterIndex] = el)}
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
                    props.selectedProperty === compartment ? theme.palette.text.primary : theme.palette.text.disabled,
                  alignContent: "center",
                  padding: theme.spacing(1),
                  margin: theme.spacing(0),
                  marginTop: theme.spacing(1),
                  borderTop: "2px solid transparent",
                  borderBottom: "2px solid transparent"
                }}
              >
                <ListItemText
                  primary={getGroupValue(props.groupFilterName, compartment)}
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