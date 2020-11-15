import { extractBbox, extractPoints, toGeometry } from './common';

export class MultiPoint {
    constructor(bbox, points) {
        this.bbox = bbox;
        this.numOfPoints = points.length;
        this.points = points;
    }

    toGeometry(latFirst=true) {
        return toGeometry(
            "MultiPoint", 
            this.points.map(pt => pt.toArray(latFirst)),
        );
    }
}

// MultiPoint Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      8          Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumPoints       NumPoints  Integer     1           Little
//  Byte 40         Points          Points     Point       NumPoints   Little
export function parseMultiPointRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 8) throw new Error('Invalid Multi-Point Record');

    const bbox = extractBbox(record.slice(1));
    const points = extractPoints(record.slice(9));

    return new MultiPoint(bbox, points);
}