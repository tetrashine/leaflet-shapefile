import { 
	parsePolygonZRecord
} from '../../src/features/polygonz';

test('parsePolygonZRecord - non polygonz record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePolygonZRecord(buffer)).toThrow('Invalid PolygonZ Record');
});

test('parsePolygonZRecord', () => {
	const buffer = new Uint32Array([
		15, 						// Shape Type
		1, 0, 2, 0, 3, 0, 4, 0, 	// Box
		3, 							// NumParts
		8, 							// NumPoints
		0, 2, 4,					// Parts
		1, 0, 1, 0, 2, 0, 2, 0,		// Points
		3, 0, 3, 0, 4, 0, 4, 0,
		5, 0, 5, 0, 6, 0, 6, 0,
		7, 0, 7, 0, 8, 0, 8, 0,
		1, 0, 7, 0,					// Z Range
		1, 0, 1, 0, 2, 0, 2, 0,		// Z Array
		5, 0, 5, 0, 7, 0, 7, 0,
		1, 0, 						// M Min
		5, 0,						// M Max
		1, 0, 1, 0, 2, 0, 2, 0,		// M Array
		3, 0, 3, 0, 4, 0, 5, 0,
	]);

  	const polygonZ = parsePolygonZRecord(buffer);
  	expect(polygonZ.bbox).toEqual(new BigInt64Array([1n, 2n, 3n, 4n]));
  	expect(polygonZ.numOfParts).toBe(3);
  	expect(polygonZ.parts).toEqual(new Uint32Array([0, 2, 4]));
  	expect(polygonZ.numOfPoints).toBe(8);
  	expect(polygonZ.zRange).toEqual([1n, 7n]);
  	expect(polygonZ.mRange).toEqual([1n, 5n]);
  	expect(polygonZ.points.length).toBe(8);
  	expect(polygonZ.zArray.length).toBe(8);
  	expect(polygonZ.mArray.length).toBe(8);
});