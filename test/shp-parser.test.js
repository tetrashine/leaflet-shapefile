import { 
	parsePointRecord, parseMultiPointRecord, parsePolyLineRecord, parsePolygonRecord,
	parsePointMRecord, parseMultiPointMRecord,
} from '../src/parser/shp-parser';

test('parsePointRecord - non point record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePointRecord(buffer)).toThrow('Invalid Point Record');
});

test('parsePointRecord', () => {
	const buffer = new Uint32Array([1, 4, 0, 5, 0]);

  	const point = parsePointRecord(buffer);
  	expect(point.x).toBe(4n);
  	expect(point.y).toBe(5n);
});

test('parseMultiPointRecord - non multi-point record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parseMultiPointRecord(buffer)).toThrow('Invalid Multi-Point Record');
});

test('parseMultiPointRecord', () => {
	const buffer = new Uint32Array([8, 1, 0, 2, 0, 3, 0, 4, 0, 5, 1, 0, 1, 0, 2, 0, 2, 0, 3, 0, 3, 0, 4, 0, 4, 0, 5, 0, 5, 0]);
	const multiPoint = parseMultiPointRecord(buffer);

	expect(multiPoint.numOfPoints).toBe(5);
	expect(multiPoint.points[0].x).toBe(1n);
	expect(multiPoint.points[0].y).toBe(1n);
	expect(multiPoint.points[1].x).toBe(2n);
	expect(multiPoint.points[1].y).toBe(2n);
	expect(multiPoint.points[2].x).toBe(3n);
	expect(multiPoint.points[2].y).toBe(3n);
	expect(multiPoint.points[3].x).toBe(4n);
	expect(multiPoint.points[3].y).toBe(4n);
	expect(multiPoint.points[4].x).toBe(5n);
	expect(multiPoint.points[4].y).toBe(5n);
});

test('parsePolyLineRecord - non polyline record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePolyLineRecord(buffer)).toThrow('Invalid PolyLine Record');
});

test('parsePolyLineRecord', () => {
	const buffer = new Uint32Array([
		3, 							// Shape Type
		1, 0, 2, 0, 3, 0, 4, 0, 	// Box
		3, 							// NumParts
		12, 						// NumPoints
		3, 4, 5, 					// Parts
		1, 0, 1, 0, 2, 0, 2, 0,		// Points
		3, 0, 3, 0, 4, 0, 4, 0,
		5, 0, 5, 0, 6, 0, 6, 0,
		7, 0, 7, 0, 8, 0, 8, 0,
		9, 0, 9, 0, 10, 0, 10, 0,
		11, 0, 11, 0, 12, 0, 12, 0,
	]);

  	const polyLine = parsePolyLineRecord(buffer);

  	expect(polyLine.bbox.length).toBe(4);
  	expect(polyLine.numOfParts).toBe(3);
  	expect(polyLine.numOfPoints).toBe(12);
  	expect(polyLine.parts.length).toBe(3);
  	expect(polyLine.parts).toEqual(new Uint32Array([3, 4, 5]));
  	expect(polyLine.points.length).toBe(12);
});

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

test('parsePointMRecord - non pointm record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePointMRecord(buffer)).toThrow('Invalid PointM Record');
});

test('parsePointMRecord', () => {
	const buffer = new Uint32Array([
		21, 						// Shape Type
		1, 0, 2, 0, 3, 0			// x,y,m
	]);

  	const pointM = parsePointMRecord(buffer);

  	expect(pointM.x).toBe(1n);
  	expect(pointM.y).toBe(2n);
  	expect(pointM.m).toBe(3n);
});

test('parseMultiPointMRecord - non multipointm record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parseMultiPointMRecord(buffer)).toThrow('Invalid MultiPointM Record');
});

test('parseMultiPointMRecord', () => {
	const buffer = new Uint32Array([
		21, 						// Shape Type
		1, 0, 2, 0, 3, 0, 4, 0, 	// Box
		8, 							// NumPoints
		1, 0, 1, 0, 2, 0, 2, 0,		// Points
		3, 0, 3, 0, 4, 0, 4, 0,
		5, 0, 5, 0, 6, 0, 6, 0,
		7, 0, 7, 0, 8, 0, 8, 0,
		1, 0, 						// Mmin
		5, 0,						// Mmax
		1, 0, 1, 0, 2, 0, 2, 0,		// Marray
		3, 0, 3, 0, 4, 0, 5, 0,
	]);

  	const multiPointM = parseMultiPointMRecord(buffer);
  	expect(multiPointM.bbox).toEqual(new BigInt64Array([1n, 2n, 3n, 4n]));
  	expect(multiPointM.numOfPoints).toBe(8);
  	expect(multiPointM.mRange).toEqual([1n, 5n]);
  	expect(multiPointM.points.length).toBe(8);
});