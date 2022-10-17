const hagrid = require('@saehrimnir/hagrid');
const geojsonWithCentroid = require('../public/assets/germany_with_centroids.json');
const fs = require('fs');
const {yellow} = require('@mui/material/colors');
const ASPECT_RATIO = 1.5625;
const centroids = geojsonWithCentroid.features.map((feature) => {
  return feature.properties.centroid;
});
const result = hagrid.gridify_hilbert(centroids, {level: 5, keep_aspect_ratio: false});
const dgrid = hagrid.gridify_dgrid(centroids, {aspect_ratio: ASPECT_RATIO});

printCSV(result, 'result');
printCSV(dgrid, 'dgrid');
printGeoJson(result, geojsonWithCentroid, 'hilbert');
printGeoJson(dgrid, geojsonWithCentroid, 'dgrid');
printJson(result, geojsonWithCentroid, 'hilbert');
printJson(dgrid, geojsonWithCentroid, 'dgrid');

// printDistancesCSV(result, jsonData, 'hilbertDistances');
function printCSV(data, filename) {
  let resultCSV = '';
  data.forEach((row) => {
    row.forEach((v, i) => {
      resultCSV += v;
      if (i < row.length - 1) {
        resultCSV += ';';
      }
    });
    resultCSV += '\n';
  });
  resultCSV = resultCSV.replace(/\./gi, ',');
  fs.writeFile('./public/assets/' + filename + '.csv', resultCSV, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

function printGeoJson(data, geoJson, filename) {
  geoJson.features.forEach((feature, index) => {
    const cord1 = data[index];
    const cord2 = [data[index][0] + 1, data[index][1]];
    const cord3 = [data[index][0] + 1, data[index][1] + 1];
    const cord4 = [data[index][0], data[index][1] + 1];
    feature.geometry = {type: 'Polygon', coordinates: [[cord1, cord4, cord3, cord2, cord1]]};
  });
  fs.writeFile('./public/assets/' + filename + '.geojson', JSON.stringify(geoJson), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

function printJson(data, geoJson, filename) {
  const width = Math.sqrt(data.length / ASPECT_RATIO);
  const result = [];
  const temp = [];
  data.forEach((v, i) => {
    const p = geoJson.features[i].properties;
    temp.push({position: v, RS: p.RS, GEN: p.GEN, BEZ: p.BEZ});
  });
  temp.sort((a, b) => {
    return b.position[1] - a.position[1];
  });

  for (let i = 0; i < data.length; i += width) {
    result.push(
      temp.slice(i, i + width).sort((a, b) => {
        return a.position[0] - b.position[0];
      })
    );
  }

  temp.s;
  fs.writeFile('./public/assets/' + filename + '.json', JSON.stringify(result), (err) => {
    if (err) {
      console.error(err);
    }
  });
}
