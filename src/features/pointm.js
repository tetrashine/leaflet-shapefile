import { Point } from './point';

export class PointM extends Point {
    constructor(x, y, m) {
        super(x, y);
        this.m = m;
    }
}

// PointM Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      21         Integer     1           Little
//  Byte 4          X               X          Double      4           Little
//  Byte 12         Y               Y          Integer     1           Little
//  Byte 20         M               M          Double      1           Little
export function parsePointMRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 21) throw new Error('Invalid PointM Record');

    const record64 = new BigInt64Array(record.slice(1).buffer);
    return new PointM(record64[0], record64[1], record64[2]);
}