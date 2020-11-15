import { 
	parseMultiPointZRecord
} from '../../src/features/multipointz';

test('parseMultiPointZRecord - non multipointz record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parseMultiPointZRecord(buffer)).toThrow('Invalid MultiPointZ Record');
});

test('parseMultiPointZRecord', () => {
	const buffer = new Uint32Array([
		18, 						// Shape Type
		1, 0, 2, 0, 3, 0, 4, 0, 	// Box
		8, 							// NumPoints
		1, 0, 1, 0, 2, 0, 2, 0,		// Points
		3, 0, 3, 0, 4, 0, 4, 0,
		5, 0, 5, 0, 6, 0, 6, 0,
		7, 0, 7, 0, 8, 0, 8, 0,
		0, 0, 7, 0,					// Z Range
		1, 0, 1, 0, 2, 0, 2, 0,		// Z Array
		5, 0, 5, 0, 7, 0, 7, 0,
		1, 0, 						// M Min
		5, 0,						// M Max
		1, 0, 1, 0, 2, 0, 2, 0,		// M Array
		3, 0, 3, 0, 4, 0, 5, 0,
	]);

  	const multiPointZ = parseMultiPointZRecord(buffer);
  	expect(multiPointZ.bbox).toEqual(new BigInt64Array([1n, 2n, 3n, 4n]));
  	expect(multiPointZ.numOfPoints).toBe(8);
  	expect(multiPointZ.zRange).toEqual([0n, 7n]);
  	expect(multiPointZ.mRange).toEqual([1n, 5n]);
  	expect(multiPointZ.points.length).toBe(8);
  	expect(multiPointZ.zArray.length).toBe(8);
  	expect(multiPointZ.mArray.length).toBe(8);
});