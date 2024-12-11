// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {LayerGroup, LayersControl, MapContainer, TileLayer, Rectangle, useMap, Polyline} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {getGridNew, getCellFromPosition} from './inspire';
import {PandemosContext} from '../../data_sockets/PandemosContext';
import {susceptibleStates, infectionStates} from './Constants';
import {useAppSelector} from '../../store/hooks';
import {KeyInfo} from '../../types/pandemos';
import age_group = KeyInfo.age_group;

type MapBounds = [[number, number], [number, number]];
type MapCenter = [number, number];

interface BaseLayerProps {
  mapZoom?: number;
  mapBounds?: MapBounds;
  maxBounds?: MapBounds;
  mapCenter?: MapCenter;
  inspireGrid?: boolean;
  inspireGridLevel?: number;
  setMapZoom: (zoom: number) => void;
  setMapBounds: (bounds: MapBounds) => void;
  setMapCenter: (center: MapCenter) => void;
}

function MapEventsHandler({setMapZoom, setMapBounds, setMapCenter}: BaseLayerProps) {
  const map = useMap();

  useEffect(() => {
    const bounds: MapBounds = [
      [52.15, 10.2],
      [52.5, 10.8],
    ];
    map.setMaxBounds(bounds);

    const handleZoomEnd = () => {
      const zoom = map.getZoom();
      setMapZoom(zoom);
    };

    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      const center = map.getCenter();
      setMapBounds([
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
      ]);
      setMapCenter([center.lat, center.lng]);
    };

    const handleMouseClick = (position: any) => {
      const clickedPosition = position.latlng;
      /* console.log(
        getCellFromPosition([clickedPosition.lat, clickedPosition.lng], getResolutionFromZoom(map.getZoom()))
      ); */
    };

    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMoveEnd);
    map.on('click', handleMouseClick);

    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMoveEnd);
      map.off('click', handleMouseClick);
    };
  }, [map, setMapZoom, setMapBounds, setMapCenter]);

  return null;
}

function getResolutionFromZoom(input: number): number {
  const inputStart = 13;
  const inputEnd = 18;
  const outputStart = 8;
  const outputEnd = 12;

  if (input < inputStart || input > inputEnd) {
    throw new Error('Input value out of range');
  }

  const output = Math.round(outputStart + ((input - inputStart) * (outputEnd - outputStart)) / (inputEnd - inputStart));
  return output;
}

export default function BaseLayer({
  mapZoom = 14,
  mapBounds = [
    [52.15, 10],
    [52.5, 11],
  ],
  mapCenter = [52.26, 10.525],
  setMapZoom,
  setMapBounds,
  setMapCenter,
}: BaseLayerProps): JSX.Element {
  const context = useContext(PandemosContext);
  const selectedTab = useAppSelector((state) => state.userPreference.selectedSidebarTab ?? '1');
  const filter = useAppSelector((state) => state.pandemosFilter);
  const [showTrips, setShowTrips] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(false);

  const gridResolution = useMemo(() => getResolutionFromZoom(mapZoom), [mapZoom]);

  const gridData = useMemo(() => {
    return getGridNew(mapBounds, gridResolution);
  }, [gridResolution, mapBounds]);

  const getLocationPos = useCallback(
    (location: number) => {
      const result = context.locations?.find((loc) => loc.location_id === location);
      return result ? [result.lat, result.lon] : undefined;
    },
    [context.locations]
  );

  const infectedLocations = useMemo(() => {
    if (!showHeatMap) {
      return [];
    }

    const infectedLocations: {pos: number[]; infectionType: number}[] = [];
    context.tripChains?.forEach((tripChain) => {
      tripChain?.forEach((trip) => {
        infectedLocations.push({
          pos: getLocationPos(trip.start_location),
          infectionType: trip.infection_state,
        });
        /*if (index > 0) {
            if (
              infectionStates.includes(trip.infection_state) &&
              trip.infection_state !== tripChain[index - 1].infection_state &&
              susceptibleStates.includes(tripChain[index - 1].infection_state)
            ) {
              infectedLocations.push({
                pos: getLocationPos(trip.start_location),
                infectionType: trip.infection_state,
              });
            }
          }*/
      });
    });
    return infectedLocations;
  }, [context.tripChains, getLocationPos, showHeatMap]);
  const getColorForInfection = (infectionCount: number, maxInfectionCount: number) => {
    const ratio = infectionCount / maxInfectionCount;

    // TODO: Check colour scale
    const r = Math.min(255, Math.floor(ratio * 120 + 100));
    const g = Math.min(255, Math.floor((1 - ratio) * 120 + 100));
    const b = Math.min(255, Math.floor((1 - ratio) * 50));

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Calculate infection count per grid cell
  const infectedCellData = useMemo(() => {
    if (!showHeatMap) {
      return {cellsData: [], maxInfectionCount: 0};
    }

    const cellsData: {bounds: [[number, number], [number, number]]; infectionCount: number}[] = [];

    gridData.rectangles.forEach(([latMin, lonMin, latMax, lonMax]) => {
      const infectionCount = infectedLocations.filter((loc) => {
        return loc.pos[1] >= latMin && loc.pos[1] <= latMax && loc.pos[0] >= lonMin && loc.pos[0] <= lonMax;
      }).length;

      cellsData.push({
        bounds: [
          [latMin, lonMin],
          [latMax, lonMax],
        ],
        infectionCount,
      });
    });

    const maxInfectionCount = Math.max(...cellsData.map((cell) => cell.infectionCount), 0);

    return {cellsData, maxInfectionCount};
  }, [showHeatMap, gridData.rectangles, infectedLocations]);

  const trips = useMemo(() => {
    if (!showTrips) {
      return [];
    }

    const trips: {id: number; pos: [number, number]; color: string}[] = [];

    if (selectedTab === '3') {
      context.filteredTripChains?.forEach((tripChains) => {
        tripChains.forEach((tripChainId) => {
          if (context.tripChains) {
            const tripChain = context.tripChains.get(tripChainId);
            tripChain?.forEach((trip) => {
              let color: string;
              switch (trip.transport_mode) {
                case 0:
                  color = 'green'; // Bike
                  break;
                case 1:
                  color = 'brown'; // Car (Driver)
                  break;
                case 2:
                  color = 'brown'; // Car (Passenger)
                  break;
                case 3:
                  color = 'blue'; // Bus
                  break;
                case 4:
                  color = 'white'; // Walking
                  break;
                case 5:
                  color = 'grey'; // Other
                  break;
                default:
                  color = 'red'; // Unknown
              }
              trips.push({
                id: trip.trip_id,
                pos: [getLocationPos(trip.start_location), getLocationPos(trip.end_location)],
                color: color,
              });
            });
          }
        });
      });
    } else if (selectedTab === '2') {
      context.trips?.forEach((trip) => {
        const duration = trip.end_time - trip.start_time;
        const agent = context.agents?.find((agent) => agent.agent_id === trip.agent_id);
        const start = context.locations?.find((loc) => loc.location_id === trip.start_location);
        const end = context.locations?.find((loc) => loc.location_id === trip.end_location);
        if (
          agent &&
          duration >= (filter.tripDurationMin ?? 0) &&
          duration < (filter.tripDurationMax ?? Number.MAX_SAFE_INTEGER)
        ) {
          if (!filter.ageGroups || filter.ageGroups.length === 0 || filter.ageGroups.includes(agent.age_group)) {
            if (
              !filter.transportationModes ||
              filter.transportationModes.length === 0 ||
              filter.transportationModes.includes(trip.transport_mode)
            ) {
              if (!filter.activities || filter.activities.length === 0 || filter.activities.includes(trip.activity)) {
                if (
                  !filter.originTypes ||
                  filter.originTypes.length === 0 ||
                  filter.originTypes.includes(start?.location_type ?? -1)
                ) {
                  if (
                    !filter.destinationTypes ||
                    filter.destinationTypes.length === 0 ||
                    filter.destinationTypes.includes(end?.location_type ?? -1)
                  ) {
                    if (
                      ((!filter.infectionStates || filter.infectionStates.length === 0) && trip.infection_state > 0) ||
                      filter.infectionStates?.includes(trip.infection_state)
                    ) {
                      let color: string;
                      switch (trip.transport_mode) {
                        case 0:
                          color = 'green'; // Bike
                          break;
                        case 1:
                          color = 'brown'; // Car (Driver)
                          break;
                        case 2:
                          color = 'brown'; // Car (Passenger)
                          break;
                        case 3:
                          color = 'blue'; // Bus
                          break;
                        case 4:
                          color = 'white'; // Walking
                          break;
                        case 5:
                          color = 'grey'; // Other
                          break;
                        default:
                          color = 'red'; // Unknown
                      }
                      trips.push({
                        id: trip.trip_id,
                        pos: [getLocationPos(trip.start_location), getLocationPos(trip.end_location)],
                        color: color,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      });
    }
    return trips;
  }, [
    context.agents,
    context.filteredTripChains,
    context.locations,
    context.tripChains,
    context.trips,
    filter.activities,
    filter.ageGroups,
    filter.destinationTypes,
    filter.infectionStates,
    filter.originTypes,
    filter.transportationModes,
    filter.tripDurationMax,
    filter.tripDurationMin,
    getLocationPos,
    selectedTab,
    showTrips,
  ]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      doubleClickZoom={false}
      dragging={true}
      minZoom={13}
      maxBounds={mapBounds}
      maxBoundsViscosity={1.0}
      style={{height: '100%', zIndex: '1', position: 'relative'}}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <LayersControl position='topright' sortLayers={false}>
        <LayersControl.Overlay checked={showHeatMap} name='Infection Heatmap'>
          <LayerGroup
            eventHandlers={{
              add() {
                setShowHeatMap(true);
              },
              remove() {
                setShowHeatMap(false);
              },
            }}
          >
            {infectedCellData.cellsData.map((rectangle, index) => {
              const fillColor = getColorForInfection(rectangle.infectionCount, infectedCellData.maxInfectionCount);

              return (
                <Rectangle
                  key={index}
                  bounds={rectangle.bounds}
                  pathOptions={{
                    weight: 0,
                    color: 'black',
                    fillColor: fillColor,
                    fillOpacity: 0.5,
                  }}
                />
              );
            })}
          </LayerGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay checked={showTrips} name='Trips'>
          <LayerGroup
            eventHandlers={{
              add() {
                setShowTrips(true);
              },
              remove() {
                setShowTrips(false);
              },
            }}
          >
            {trips
              .map((line) => (
                <Polyline
                  key={line.id}
                  pathOptions={{weight: 1, color: line.color}}
                  positions={line.pos.map((pos) => [pos[1], pos[0]])}
                />
              ))}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>
      <MapEventsHandler setMapZoom={setMapZoom} setMapBounds={setMapBounds} setMapCenter={setMapCenter} />
    </MapContainer>
  );
}
