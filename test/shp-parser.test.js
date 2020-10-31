import { 
	parsePointRecord, parseMultiPointRecord, parsePolyLineRecord
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
});
