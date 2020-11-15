import { 
	parsePolyLineRecord
} from '../../src/features/polyline';

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