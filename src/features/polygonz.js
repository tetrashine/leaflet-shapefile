import { extractBbox, extractPartsPoints, extractRangeValues } from './common';
import { PolygonM } from './polygonm';

export class PolygonZ extends PolygonM {
    constructor(bbox, parts, points, mRange, mArray, zRange, zArray) {
        super(bbox, parts, points, mRange, mArray);
        this.zRange = zRange;
        this.zArray = zArray;
    }
}

// PolygonZ Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      15         Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumParts        NumParts   Integer     1           Little
//  Byte 40         NumPoints       NumPoints  Integer     1           Little
//  Byte 44         Parts           Parts      Integer     NumParts    Little
//  Byte X          Points          Points     Point       NumPoints   Little
//  Byte Y          Zmin            Zmin       Double      1           Little
//  Byte Y+8        Zmax            Zmax       Double      1           Little
//  Byte Y+16       Zarray          Zarray     Double      NumPoints   Little
//  Byte Z*         Mmin            Mmin       Double      1           Little
//  Byte Z+8*       Mmax            Mmax       Double      1           Little
//  Byte Z+16*      Marray          Marray     Double      NumPoints   Little
//  Note: X = 40 + (16 * NumPoints); Y = X + 16 + (8 * NumPoints)
//  * optional
export function parsePolygonZRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 15) throw new Error('Invalid PolygonZ Record');

    const bbox = extractBbox(record.slice(1));
    const [parts, points] = extractPartsPoints(record.slice(9));
    const numOfParts = parts.length;
    const numOfPoints = points.length;

    const record64 = new BigInt64Array(record.slice(11 + numOfParts + (numOfPoints << 2)).buffer);
    const [zRange, zArray] = extractRangeValues(record64, numOfPoints);
    const [mRange, mArray] = extractRangeValues(record64.slice(2 + numOfPoints).buffer, numOfPoints);

    return new PolygonZ(bbox, parts, points, mRange, mArray, zRange, zArray);
}