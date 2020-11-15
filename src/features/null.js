export class Null {}

// Null Shape Record Contents
//  Position        Field        Value      Type        Number      Byte Order
//  Byte 0          Shape Type   0          Integer     1           Little
export function parseNullRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 0) throw new Error('Invalid Null Record');

    return new Null();
}