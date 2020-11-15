import { 
	parsePointMRecord
} from '../../src/features/pointm';

test('parsePointMRecord - non pointm record', () => {
	const buffer = new Uint32Array([0, 4, 0, 5, 0]);
  	expect(() => parsePointMRecord(buffer)).toThrow('Invalid PointM Record');
});

test('parsePointMRecord', () => {
	const buffer = new Uint32Array([
		21, 						// Shape Type
		1, 0, 2, 0, 3, 0			// x,y,m
	]);

  	const pointM = parsePointMRecord(buffer);

  	expect(pointM.x).toBe(1n);
  	expect(pointM.y).toBe(2n);
  	expect(pointM.m).toBe(3n);
});