import { 
	parsePointRecord, Point
} from '../../src/features/point';

import { getDataViewFromArray } from '../index'

test('parsePointRecord - non point record', () => {
	const dataView = getDataViewFromArray([0, 4, 5], [false, true, true]);
  	expect(() => parsePointRecord(dataView)).toThrow('Invalid Point Record');
});

test('parsePointRecord', () => {
	const dataView = getDataViewFromArray([1, 4, 5], [false, true, true]);

  	const point = parsePointRecord(dataView);
  	expect(point.x).toBe(4);
  	expect(point.y).toBe(5);
});

test('Point.toGeoJson()', () => {
	const point = new Point(1,2);
	const geojson = point.toGeometry();

	expect(geojson.type).toBe('Point');
	expect(geojson.coordinates).toEqual([1,2]);

	const reverseGeojson = point.toGeometry(false);

	expect(reverseGeojson.type).toBe('Point');
	expect(reverseGeojson.coordinates).toEqual([2,1]);
});