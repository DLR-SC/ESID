import * as fs from 'fs';
import {GeoJSON, MultiPolygon, Polygon, Position} from 'geojson';

function get_polygon_centroid(pts: Position[]): [Position, number] {
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first[0] != last[0] || first[1] != last[1]) pts.push(first);
  let twicearea = 0,
    x = 0,
    y = 0,
    nPts = pts.length,
    p1,
    p2,
    f;
  for (let i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = pts[i];
    p2 = pts[j];
    f = (p1[1] - first[1]) * (p2[0] - first[0]) - (p2[1] - first[1]) * (p1[0] - first[0]);
    twicearea += f;
    x += (p1[0] + p2[0] - 2 * first[0]) * f;
    y += (p1[1] + p2[1] - 2 * first[1]) * f;
  }
  f = twicearea * 3;
  return [[x / f + first[0], y / f + first[1]] as Position, twicearea / 2];
}

function get_multi_polygon_centroid(multiPoly: Position[][][]): Position {
  let centroid: Position = [];
  let centroids: Position[] = [];
  let areas: number[] = [];
  let areaSum = 0;
  multiPoly.forEach((poly) => {
    //calculate centroid and area (weight) of one polygon
    const [centroid, area] = get_polygon_centroid(poly[0]);
    centroids.push(centroid);
    const index = areas.push(area);
    //subtract area if polygon has holes
    for (let i = 1; i < poly.length; i++) {
      areas[index] -= get_polygon_centroid(poly[i])[1];
    }
  });

  //calculate weighted average of all centroids
  for (let i = 0; i < centroids.length; i++) {
    if (i == 0) {
      centroid[0] = centroids[i][0] * areas[i];
      centroid[1] = centroids[i][1] * areas[i];
    } else {
      centroid[0] = centroid[0] + centroids[i][0] * areas[i];
      centroid[1] = centroid[1] + centroids[i][1] * areas[i];
    }
    areaSum += areas[i];
  }
  centroid[0] = centroid[0] / areaSum;
  centroid[1] = centroid[1] / areaSum;
  return centroid;
}

fs.readFile('public/assets/lk_germany_reduced.geojson', function (err, data) {
  if (err) {
    return console.error(err);
  }
  const geodata: GeoJSON.FeatureCollection = JSON.parse(data.toString());

  geodata.features.forEach((feature) => {
    let centroid: Position = [];
    if (feature.geometry.type === 'Polygon') {
      const polygon = feature.geometry as Polygon;
      centroid = get_polygon_centroid(polygon.coordinates[0])[0]; //ignoring holes in district TODO?
    } else if (feature.geometry.type === 'MultiPolygon') {
      const multiPoly = feature.geometry as MultiPolygon;
      centroid = get_multi_polygon_centroid(multiPoly.coordinates);
    } else {
      console.error('unsupported feature type, only Polygon and MultiPolygon are supported');
    }

    //add centroid to properties
    if (feature.properties) {
      feature.properties['centroid'] = centroid;
    } else {
      console.error('district has no properties');
    }

    fs.writeFile('public/assets/germany_with_centroids.json', JSON.stringify(geodata), (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
});
