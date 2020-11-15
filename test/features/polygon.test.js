import { 
	parsePolygonRecord, Polygon
} from '../../src/features/polygon';

import { 
	Point
} from '../../src/features/point';

test('parsePolygonRecord - non polygon record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePolygonRecord(buffer)).toThrow('Invalid Polygon Record');
});

test('parsePolygonRecord', () => {
	const buffer = new Uint32Array([
		5, 							// Shape Type
		1, 0, 2, 0, 3, 0, 4, 0, 	// Box
		3, 							// NumParts
		12, 						// NumPoints
		0, 4, 9, 					// Parts
		1, 0, 1, 0, 2, 0, 2, 0,		// Points
		3, 0, 3, 0, 4, 0, 4, 0,
		5, 0, 5, 0, 6, 0, 6, 0,
		7, 0, 7, 0, 8, 0, 8, 0,
		9, 0, 9, 0, 10, 0, 10, 0,
		11, 0, 11, 0, 12, 0, 12, 0,
	]);

  	const polygon = parsePolygonRecord(buffer);

  	expect(polygon.bbox.length).toBe(4);
  	expect(polygon.numOfParts).toBe(3);
  	expect(polygon.numOfPoints).toBe(12);
  	expect(polygon.parts.length).toBe(3);
  	expect(polygon.parts).toEqual(new Uint32Array([0, 4, 9]));
  	expect(polygon.points.length).toBe(12);
});

test('Polygon.toGeoJson()', () => {
	const polygon = new Polygon([1,2,3,4], [0,5], [
		new Point(1,1), new Point(2,2), new Point(3,3), new Point(4,4), new Point(1,1),
		new Point(5,5), new Point(8,8), new Point(7,7), new Point(6,6), new Point(5,5)
	]);
	const geojson = polygon.toGeometry();

	expect(geojson.type).toBe('Polygon');
	expect(geojson.coordinates).toEqual([
		[[1,1], [2,2], [3,3], [4,4], [1,1]],
		[[5,5], [8,8], [7,7], [6,6], [5,5]],
	]);

	const polygon2 = new Polygon([1,2,3,4], [0], [
		new Point(1,1), new Point(2,2), new Point(3,3), new Point(4,4), new Point(1,1),
	]);
	const geojson2 = polygon2.toGeometry();

	expect(geojson2.type).toBe('Polygon');
	expect(geojson2.coordinates).toEqual([
		[[1,1], [2,2], [3,3], [4,4], [1,1]],
	]);
});