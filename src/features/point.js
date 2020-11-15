import { latLng, lngLat, toGeometry } from './common';

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toArray(latFirst=true) {
        const func = latFirst ? latLng : lngLat;
        return func(this.x, this.y);
    }

    toGeometry(latFirst=true) {
        const func = latFirst ? latLng : lngLat;
        return toGeometry("Point", func(this.x, this.y));
    }
}

// Point Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      1          Integer     1           Little
//  Byte 4          X               1          Double      1           Little
//  Byte 12         Y               1          Double      1           Little
export function parsePointRecord(buffer) {
    const shapeType = buffer.getInt32(0, true);
    if (shapeType !== 1) throw new Error('Invalid Point Record');

    const x = buffer.getFloat64(4, true);
    const y = buffer.getFloat64(12, true);
    return new Point(x, y);
}