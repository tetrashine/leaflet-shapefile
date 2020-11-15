import { 
	parsePointZRecord
} from '../../src/features/pointz';

test('parsePointZRecord - non polylinem record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePointZRecord(buffer)).toThrow('Invalid PointZ Record');
});

test('parsePointZRecord', () => {
	const buffer = new Uint32Array([
		11, 						// Shape Type
		1, 0, 2, 0, 3, 0, 4, 0		// x,y,z,m
	]);

  	const pointZ = parsePointZRecord(buffer);

  	expect(pointZ.x).toBe(1n);
  	expect(pointZ.y).toBe(2n);
  	expect(pointZ.m).toBe(3n);
  	expect(pointZ.z).toBe(4n);
});
