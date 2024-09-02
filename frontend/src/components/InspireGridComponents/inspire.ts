import {cellSize, factorPerZone, latitudeSpacing} from './Constants';
import {degreesToUnit, getLongitudinalFactorAndZone, range, unitToDegrees} from './Utils';
import {InspireGridCell} from './Types';

export function getGrid(bounds: [[number, number], [number, number]], level: number) {
  const scalingFactorLat = latitudeSpacing[level] / 3600;
  const scalingFactorLong = (2 * latitudeSpacing[level]) / 3600; // BS is in Zone 2

  const latMin: number = bounds[0][0];
  const lonMin: number = bounds[0][1];
  const latMax: number = bounds[1][0];
  const lonMax: number = bounds[1][1];

  console.log(bounds);

  const latMinNew: number = latMin - (latMin % scalingFactorLat);
  const latMaxNew: number = latMax - (latMax % scalingFactorLat);
  const lonMinNew: number = lonMin - (lonMin % scalingFactorLong);
  const lonMaxNew: number = lonMax - (lonMax % scalingFactorLong) + scalingFactorLong;

  return {
    latitudes: latitudeCoordinates(latMinNew, latMaxNew, lonMinNew, lonMaxNew, level),
    longitudes: longitudeCoordinates(latMinNew, latMaxNew, lonMinNew, lonMaxNew, level),
  };
}

function latitudeCoordinates(latMin: number, latMax: number, lonMin: number, lonMax: number, level: number) {
  const linesLat = [];

  for (let lat = latMin; lat <= latMax + latitudeSpacing[level] / 3600; lat += latitudeSpacing[level] / 3600) {
    const {factor} = getLongitudinalFactorAndZone(lat);
    const lonSpacing = (factor * latitudeSpacing[level]) / 3600;

    const latLine: Array<[number, number]> = [];
    const lonRange = range(lonMin, lonMax, lonSpacing);

    for (const lon of lonRange) {
      latLine.push([lon, lat]);
    }
    linesLat.push(latLine);
  }

  return linesLat;
}

function longitudeCoordinates(latMin: number, latMax: number, lonMin: number, lonMax: number, level: number) {
  const linesLong = [];
  const lonSpacing = latitudeSpacing[level] / 3600;

  for (let lat = latMin; lat <= latMax + lonSpacing; lat += lonSpacing) {
    const lonRange = range(lonMin, lonMax, lonSpacing);
    for (const lon of lonRange) {
      linesLong.push([
        [lon, lat],
        [lon, lat + lonSpacing],
      ]);
    }
  }

  return linesLong;
}

export function getCellFromPosition(position: [number, number], level: number): InspireGridCell {
  const [pointLat, pointLon] = position;

  const {factor, zone} = getLongitudinalFactorAndZone(pointLat);

  const unit = cellSize[level].unit;
  const value = cellSize[level].value;
  const latDirection = pointLat >= 0 ? 'N' : 'S';
  const lonDirection = pointLon >= 0 ? 'E' : 'W';
  const latId = Math.round(degreesToUnit(Math.abs(pointLat), unit, value));
  const lonId = Math.round(degreesToUnit(Math.abs(pointLon), unit, value * factor));

  const minLat = unitToDegrees(latId, unit, value) * (latDirection === 'N' ? 1 : -1);
  const minLon = unitToDegrees(lonId, unit, value) * (lonDirection === 'E' ? 1 : -1) * factor;

  const latIncrement = latitudeSpacing[level] / 3600;
  const maxLat = minLat + latIncrement * (latDirection === 'N' ? 1 : -1);
  const maxLon = (minLon + latIncrement * factor) * (lonDirection === 'E' ? 1 : -1);

  return {
    id: `Grid_ETRS89-GRS80_z${zone}_${value}${unit}_${latDirection}${latId}_${lonDirection}${lonId}`,
    bounds: {
      min: {lat: minLat, lon: minLon},
      max: {lat: maxLat, lon: maxLon},
    },
    zone: zone,
    level: level,
  };
}

export function cellBoundsFromId(cellIdentifier: string): Array<Array<number>> | null {
  const regex = /^Grid_ETRS89-GRS80_z(\d+)_(\d+[A-Z]+)_([NS])(\d+\.*\d*)_([EW])(\d+\.*\d*)$/;
  const match = RegExp(regex).exec(cellIdentifier);

  if (match) {
    const [, zone, resStr, latDirection, latValue, lonDirection, lonValue] = match;

    const unit = RegExp(/\D+/).exec(resStr)[0];
    const value = parseInt(resStr);
    const factor = factorPerZone[zone];

    const minLat = unitToDegrees(parseFloat(latValue), unit, value) * (latDirection === 'N' ? 1 : -1);
    const minLon = unitToDegrees(parseFloat(lonValue), unit, value) * (lonDirection === 'E' ? 1 : -1) * factor;

    let resolution: string | null = null;

    for (const key in cellSize) {
      if (cellSize[key].value + cellSize[key].unit === resStr) {
        resolution = key;
        break;
      }
    }

    const latIncrement = latitudeSpacing[resolution] / 3600;
    const maxLat = minLat + latIncrement * (latDirection === 'N' ? 1 : -1);
    const maxLon = (minLon + latIncrement * parseInt(factor)) * (lonDirection === 'E' ? 1 : -1);

    return [
      [minLat, minLon],
      [maxLat, maxLon],
    ];
  }

  return null;
}
