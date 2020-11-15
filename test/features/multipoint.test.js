import { 
	parseMultiPointRecord
} from '../../src/features/multipoint';

import { 
	Point
} from '../../src/features/point';

test('parseMultiPointRecord - non multi-point record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parseMultiPointRecord(buffer)).toThrow('Invalid Multi-Point Record');
});

test('parseMultiPointRecord', () => {
	const buffer = new Uint32Array([8, 1, 0, 2, 0, 3, 0, 4, 0, 5, 1, 0, 1, 0, 2, 0, 2, 0, 3, 0, 3, 0, 4, 0, 4, 0, 5, 0, 5, 0]);
	const multiPoint = parseMultiPointRecord(buffer);

	expect(multiPoint.bbox).toEqual(new BigInt64Array([1n, 2n, 3n, 4n]));
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