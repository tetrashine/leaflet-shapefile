var shp = require('../dist/shp');

shp.read('examples/files/points.shp').then(features => console.log(features));