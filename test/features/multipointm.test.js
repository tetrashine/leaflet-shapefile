import { 
	parseMultiPointMRecord
} from '../../src/features/multipointm';

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