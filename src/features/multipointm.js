import { extractBbox, extractPoints, extractRangeValues } from './common';
import { MultiPoint } from './multipoint';

export class MultiPointM extends MultiPoint {
    constructor(bbox, points, mRange, mArray) {
        super(bbox, points);
        this.mRange = mRange;
        this.mArray = mArray;
    }
}

// MultiPointM Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      28         Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumPoints       NumPoints  Integer     1           Little
//  Byte 40         Points          Points     Point       NumPoints   Little
//  Byte X*         Mmin            Mmin       Double      1           Little
//  Byte X+8*       Mmax            Mmax       Double      1           Little
//  Byte X+16*      Narray          Marray     Double      NumPoints   Little
export function parseMultiPointMRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 21) throw new Error('Invalid MultiPointM Record');

    const bbox = extractBbox(record.slice(1));
    const points = extractPoints(record.slice(9));
    const numOfPoints = points.length;
    const [mRange, mArray] = extractRangeValues(record.slice(10 + (numOfPoints << 2)).buffer, numOfPoints);

    return new MultiPointM(bbox, points, mRange, mArray);
}