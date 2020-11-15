import { PointM } from './pointm';

export class PointZ extends PointM {
    constructor(x, y, m, z) {
        super(x, y, m);
        this.z = z;
    }
}

// PointZ Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      11         Integer     1           Little
//  Byte 4          X               X          Double      1           Little
//  Byte 12         Y               Y          Double      1           Little
//  Byte 20         Measure         M          Double      1           Little
export function parsePointZRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 11) throw new Error('Invalid PointZ Record');

    const record64 = new BigInt64Array(record.slice(1).buffer);
    return new PointZ(record64[0], record64[1], record64[2], record64[3]);
}