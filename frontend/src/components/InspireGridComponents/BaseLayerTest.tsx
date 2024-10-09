import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {LayerGroup, LayersControl, MapContainer, TileLayer, useMap, Polyline} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {getGrid, getCellFromPosition} from './inspire';
import {LatLngExpression} from 'leaflet';
import {PandemosContext} from '../../data_sockets/PandemosContext';

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

  const minZoom = map.getBoundsZoom([
    [52.248, 10.477],
    [52.273, 10.572],
  ]);
  map.setMinZoom(minZoom);

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
      console.log(bounds);
      setMapCenter([center.lat, center.lng]);
    };

    const handleMouseClick = (position: any) => {
      const clickedPosition = position.latlng;
      console.log(
        getCellFromPosition([clickedPosition.lat, clickedPosition.lng], getResolutionFromZoom(map.getZoom())),
      ); // change level to include level
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
  let multiPolyline: LatLngExpression[][] = [];
  inspireGridLevel = getResolutionFromZoom(mapZoom);
  const context = useContext(PandemosContext);

  const getLocationPos = useCallback(
    (location: number) => {
      const result = context.locations.find((loc) => loc.location_id === location);
      return result ? [result.lat, result.lon] : undefined;
    },
    [context.locations],
  );

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

  if (inspireGrid) {
    const gridData = getGrid(mapBounds, inspireGridLevel);
    const latitudes = gridData.latitudes.map((line) => line.map((coord) => [coord[1], coord[0]]) as LatLngExpression[]);
    const longitudes = gridData.longitudes.map(
      (line) => line.map((coord) => [coord[1], coord[0]]) as LatLngExpression[],
    );

    multiPolyline = [...latitudes, ...longitudes];
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      doubleClickZoom={false}
      dragging={true}
      maxBounds={[
        [52.248, 10.477],
        [52.273, 10.572],
      ]}
      maxBoundsViscosity={1.0}
      style={{height: '100%', zIndex: '1', position: 'relative'}}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <LayersControl position='topright'>
        <LayersControl.Overlay checked name='InspireGridOverlay'>
          <LayerGroup>
            {multiPolyline.map((polyline, index) => (
              <Polyline key={index} pathOptions={{weight: 1}} positions={polyline} />
            ))}
          </LayerGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name='InspireGridOverlay'>
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
};
