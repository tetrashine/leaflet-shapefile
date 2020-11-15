import { extractBbox, extractPartsPoints, toGeometry } from './common';

export class PolyLine {
    constructor(bbox, parts, points) {
        this.bbox = bbox;
        this.numOfParts = parts.length;
        this.numOfPoints = points.length;
        this.parts = parts;
        this.points = points;
    }

    toGeometry(latFirst=true) {
        return toGeometry(
            "LineString", 
            this.points.map(pt => pt.toArray(latFirst)),
        );
    }
}

// PolyLine Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      3          Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumParts        NumParts   Integer     1           Little
//  Byte 40         NumPoints       NumPoints  Integer     1           Little
//  Byte 44         Parts           Parts      Integer     NumParts    Little
//  Byte X          Points          Points     Point       NumPoints   Little
export function parsePolyLineRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 3) throw new Error('Invalid PolyLine Record');

    const bbox = extractBbox(record.slice(1));
    const [parts, points] = extractPartsPoints(record.slice(9));

    return new PolyLine(bbox, parts, points);
}