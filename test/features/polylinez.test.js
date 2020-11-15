import { 
	parsePolyLineZRecord
} from '../../src/features/polylinez';

test('parsePolyLineZRecord - non polylinez record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePolyLineZRecord(buffer)).toThrow('Invalid PolyLineZ Record');
});

test('parsePolyLineZRecord', () => {
	const buffer = new Uint32Array([
		13, 						// Shape Type
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

  	const polyLineZ = parsePolyLineZRecord(buffer);
  	expect(polyLineZ.bbox).toEqual(new BigInt64Array([1n, 2n, 3n, 4n]));
  	expect(polyLineZ.numOfParts).toBe(3);
  	expect(polyLineZ.parts).toEqual(new Uint32Array([0, 2, 4]));
  	expect(polyLineZ.numOfPoints).toBe(8);
  	expect(polyLineZ.zRange).toEqual([1n, 7n]);
  	expect(polyLineZ.mRange).toEqual([1n, 5n]);
  	expect(polyLineZ.points.length).toBe(8);
  	expect(polyLineZ.zArray.length).toBe(8);
  	expect(polyLineZ.mArray.length).toBe(8);
});