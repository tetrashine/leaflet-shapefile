import { extractBbox, extractPoints, extractRangeValues } from './common';
import { MultiPointM } from './multipointm';

export class MultiPointZ extends MultiPointM {
    constructor(bbox, points, mRange, mArray, zRange, zArray) {
        super(bbox, points, mRange, mArray);
        this.zRange = zRange;
        this.zArray = zArray;
    }
}

// MultiPointZ Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      18         Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumPoints       NumParts   Integer     1           Little
//  Byte 40         Points          Points     Point       NumPoints   Little
//  Byte X          Zmin            Zmin       Double      1           Little
//  Byte X+8        Zmax            Zmax       Double      1           Little
//  Byte X+16       Zarray          Zarray     Double      NumPoints   Little
//  Byte Y*         Mmin            Mmin       Double      1           Little
//  Byte Y+8*       Mmax            Mmax       Double      1           Little
//  Byte Y+16*      Marray          Marray     Double      NumPoints   Little
//  Note: X = 40 + (16 * NumPoints); Y = X + 16 + (8 * NumPoints)
//  * optional
export function parseMultiPointZRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 18) throw new Error('Invalid MultiPointZ Record');

    const bbox = extractBbox(record.slice(1));
    const points = extractPoints(record.slice(9));
    const numOfPoints = points.length;

    const record64 = new BigInt64Array(record.slice(10 + (numOfPoints << 2)).buffer);
    const [zRange, zArray] = extractRangeValues(record64, numOfPoints)
    const [mRange, mArray] = extractRangeValues(record64.slice(2 + numOfPoints).buffer, numOfPoints);

    return new MultiPointZ(bbox, points, mRange, mArray, zRange, zArray);
}