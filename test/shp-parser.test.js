import { parsePointRecord, parseMultiPointRecord } from '../src/parser/shp-parser';

test('parsePointRecord', () => {
	const buffer = new Uint32Array([1, 4, 0, 5, 0]);

  	const point = parsePointRecord(buffer);
  	expect(point.x).toBe(4n);
  	expect(point.y).toBe(5n);
});

test('parsePointRecord - non point record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePointRecord(buffer)).toThrow('Invalid Point Record');
});

test('parseMultiPointRecord', () => {
	const buffer = new Uint32Array([8, 1, 0, 2, 0, 3, 0, 4, 0, 5, 1, 0, 1, 0, 2, 0, 2, 0, 3, 0, 3, 0, 4, 0, 4, 0, 5, 0, 5, 0]);
	const multiPoint = parseMultiPointRecord(buffer);

	expect(multiPoint.numOfPoints).toBe(5);

	console.log(multiPoint.points)
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

test('parseMultiPointRecord - non multi-point record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parseMultiPointRecord(buffer)).toThrow('Invalid Multi-Point Record');
});