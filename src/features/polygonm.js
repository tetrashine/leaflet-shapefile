import { extractBbox, extractPartsPoints, extractRangeValues } from './common';
import { Polygon } from './polygon';

export class PolygonM extends Polygon {
    constructor(bbox, parts, points, mRange, mArray) {
        super(bbox, parts, points);
        this.mRange = mRange;
        this.mArray = mArray;
    }
}

// PolygonM Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      25         Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumParts        NumParts   Integer     1           Little
//  Byte 40         NumPoints       NumPoints  Point       NumPoints   Little
//  Byte 44         Parts           Parts      Point       NumPoints   Little
//  Byte X*         Points          Points     Point       NumPoints   Little
//  Byte Y*         Mmin            Mmin       Double      1           Little
//  Byte Y+8*       Mmax            Mmax       Double      1           Little
//  Byte Y+16*      Marray          Marray     Double      1           Little
//  Note: X = 40 + (4 * NumParts); Y = X + (16 * NumPoints)
//  * optional
export function parsePolygonMRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 25) throw new Error('Invalid PolygonM Record');

    const bbox = extractBbox(record.slice(1));
    const [parts, points] = extractPartsPoints(record.slice(9));
    const numOfParts = parts.length;
    const numOfPoints = points.length;
    const [mRange, mArray] = extractRangeValues(record.slice(13 + (numOfPoints << 2)).buffer, numOfPoints);

    return new PolygonM(bbox, parts, points, mRange, mArray);
}