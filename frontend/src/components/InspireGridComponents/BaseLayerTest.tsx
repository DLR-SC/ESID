import React, { useEffect } from 'react';
import { LayerGroup, LayersControl, MapContainer, TileLayer, useMap, Polyline } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { getGrid, getCellFromPosition } from "./inspire";
import { LatLngExpression } from 'leaflet';

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

function MapEventsHandler({
    setMapZoom,
    setMapBounds,
    setMapCenter,
}: BaseLayerProps) {
    const map = useMap();

    const minZoom = map.getBoundsZoom([[52.248, 10.477], [52.273, 10.572]]);
    map.setMinZoom(minZoom);

    useEffect(() => {
        const bounds: MapBounds = [[52.248, 10.477], [52.273, 10.572]];
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
            console.log(getCellFromPosition([clickedPosition.lat, clickedPosition.lng], getResolutionFromZoom(map.getZoom()))); // change level to include level
        }

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
    const outputStart = 10; 
    const outputEnd = 14;  

    if (input < inputStart || input > inputEnd) {
        throw new Error("Input value out of range");
    }


    const output = Math.round(outputStart + ((input - inputStart) * (outputEnd - outputStart)) / (inputEnd - inputStart));
    return output;
}


export default function BaseLayer({
    mapZoom = 14,
    mapBounds = [[52.248, 10.477], [52.273, 10.572]],
    mapCenter = [52.260, 10.525],
    inspireGrid = true,
    inspireGridLevel = 10,
    setMapZoom,
    setMapBounds,
    setMapCenter,
}: BaseLayerProps): JSX.Element {

    let multiPolyline: LatLngExpression[][] = [];
    inspireGridLevel = getResolutionFromZoom(mapZoom);

    if (inspireGrid) {
        const gridData = getGrid(mapBounds, inspireGridLevel);
        const latitudes = gridData.latitudes.map(line =>
            line.map(coord => [coord[1], coord[0]]) as LatLngExpression[]
        );
        const longitudes = gridData.longitudes.map(line =>
            line.map(coord => [coord[1], coord[0]]) as LatLngExpression[]
        );

        multiPolyline = [...latitudes, ...longitudes];
    }

    return (
        <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            dragging={true}
            maxBounds={[[52.248, 10.477], [52.273, 10.572]]}
            maxBoundsViscosity={1.0}
            style={{ height: "100%", zIndex: '1', position: "relative" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayersControl position="topright">
                <LayersControl.Overlay checked name="InspireGridOverlay">
                    <LayerGroup>
                        {multiPolyline.map((polyline, index) => (
                            <Polyline key={index} pathOptions={{ weight: 0.5 }} positions={polyline} />
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>

            <MapEventsHandler
                setMapZoom={setMapZoom}
                setMapBounds={setMapBounds}
                setMapCenter={setMapCenter}
            />
        </MapContainer>
    );
}
