// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {LayerGroup, LayersControl, MapContainer, TileLayer, Rectangle, useMap, Polyline} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {getGridNew, getCellFromPosition} from './inspire';
import {PandemosContext} from '../../data_sockets/PandemosContext';
import {susceptibleStates, infectionStates} from './Constants';

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
      [52.248, 10.477],
      [52.273, 10.572],
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
  const inputStart = 14;
  const inputEnd = 18;
  const outputStart = 9;
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
    [52.248, 10.477],
    [52.273, 10.572],
  ],
  mapCenter = [52.26, 10.525],
  inspireGrid = true,
  inspireGridLevel = 10,
  setMapZoom,
  setMapBounds,
  setMapCenter,
}: BaseLayerProps): JSX.Element {
  const context = useContext(PandemosContext);

  const gridResolution = useMemo(() => getResolutionFromZoom(mapZoom), [mapZoom]);

  const gridData = useMemo(() => {
    const bounds: MapBounds = [
      [52.248, 10.477],
      [52.273, 10.572],
    ];
    return getGridNew(mapBounds, gridResolution);
  }, [mapBounds, gridResolution]);

  const getLocationPos = useCallback(
    (location: number) => {
      const result = context.locations?.find((loc) => loc.location_id === location);
      return result ? [result.lat, result.lon] : undefined;
    },
    [context.locations]
  );

  // Calculate infected locations from filtered trip chains
  const infectedLocations = useMemo(() => {
    const infectedLocations: {pos: number[]; infectionType: number}[] = [];
    context.filteredTripChains?.forEach((tripChains) => {
      tripChains.forEach((tripChainId) => {
        if (context.tripChains) {
          const tripChain = context.tripChains.get(tripChainId);
          tripChain?.forEach((trip, index) => {
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
        }
      });
    });
    return infectedLocations;
  }, [context.filteredTripChains, context.tripChains, getLocationPos]);
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
    const cellsData: {bounds: [[number, number], [number, number]]; infectionCount: number}[] = [];

    gridData.rectangles.forEach(([latMin, lonMin, latMax, lonMax]) => {
      const infectionCount = infectedLocations.filter((loc) => {
        return loc.pos[0] >= latMin && loc.pos[0] <= latMax && loc.pos[1] >= lonMin && loc.pos[1] <= lonMax;
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
  }, [infectedLocations, gridData]);

  const trips = useMemo(() => {
    const trips: {pos: [number, number]; color: string}[] = [];
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
              pos: [getLocationPos(trip.start_location), getLocationPos(trip.end_location)],
              color: color,
            });
          });
        }
      });
    });
    return trips;
  }, [context.filteredTripChains, context.tripChains, getLocationPos]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      doubleClickZoom={false}
      dragging={true}
      maxBounds={mapBounds}
      maxBoundsViscosity={1.0}
      style={{height: '100%', zIndex: '1', position: 'relative'}}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <LayersControl position='topright'>
        <LayersControl.Overlay checked name='Infection Heatmap'>
          <LayerGroup>
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
        <LayersControl.Overlay checked name='Trips'>
          <LayerGroup>
            {trips.map((line, index) => (
              <Polyline key={index} pathOptions={{weight: 1, color: line.color}} positions={line.pos} />
            ))}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>
      <MapEventsHandler setMapZoom={setMapZoom} setMapBounds={setMapBounds} setMapCenter={setMapCenter} />
    </MapContainer>
  );
}
