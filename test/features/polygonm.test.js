import { 
	parsePolygonMRecord
} from '../../src/features/polygonm';

test('parsePolygonMRecord - non polylinem record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePolygonMRecord(buffer)).toThrow('Invalid PolygonM Record');
});

test('parsePolygonMRecord', () => {
	const buffer = new Uint32Array([
		25, 						// Shape Type
		1, 0, 2, 0, 3, 0, 4, 0, 	// Box
		2, 							// NumParts
		8, 							// NumPoints
		0, 4,						// Parts
		3, 0, 3, 0, 4, 0, 4, 0,		// Points
		5, 0, 5, 0, 6, 0, 6, 0,
		7, 0, 7, 0, 8, 0, 8, 0,
		9, 0, 9, 0, 10, 0, 10, 0,
		1, 0, 						// Mmin
		5, 0,						// Mmax
		1, 0, 1, 0, 2, 0, 2, 0,		// Marray
		3, 0, 3, 0, 4, 0, 5, 0,
	]);

  	const polygonM = parsePolygonMRecord(buffer);
  	expect(polygonM.bbox).toEqual(new BigInt64Array([1n, 2n, 3n, 4n]));
  	expect(polygonM.numOfParts).toBe(2);
  	expect(polygonM.parts).toEqual(new Uint32Array([0, 4]));
  	expect(polygonM.numOfPoints).toBe(8);
  	expect(polygonM.mRange).toEqual([1n, 5n]);
  	expect(polygonM.points.length).toBe(8);
});