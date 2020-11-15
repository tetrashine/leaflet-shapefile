import { 
	parseMultiPatchRecord
} from '../../src/features/multipatch';

test('parseMultiPatchRecord - non multipatch record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parseMultiPatchRecord(buffer)).toThrow('Invalid MultiPatch Record');
});

test('parseMultiPatchRecord', () => {
	const buffer = new Uint32Array([
		31, 						// Shape Type
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

  	const multiPatch = parseMultiPatchRecord(buffer);
  	expect(multiPatch.bbox).toEqual(new BigInt64Array([1n, 2n, 3n, 4n]));
  	expect(multiPatch.numOfParts).toBe(3);
  	expect(multiPatch.parts).toEqual(new Uint32Array([0, 2, 4]));
  	expect(multiPatch.numOfPoints).toBe(8);
  	expect(multiPatch.zRange).toEqual([1n, 7n]);
  	expect(multiPatch.mRange).toEqual([1n, 5n]);
  	expect(multiPatch.points.length).toBe(8);
  	expect(multiPatch.zArray.length).toBe(8);
  	expect(multiPatch.mArray.length).toBe(8);
});