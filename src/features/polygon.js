import { extractBbox, extractPartsPoints, toGeometry } from './common';
import { PolyLine } from './polyline';

export class Polygon extends PolyLine {
    toGeometry(latFirst=true) {
        const arr = new Array(this.numOfParts);

        if (this.numOfParts > 0) {
            for (let index = 0; index < this.numOfParts; index++) {
                arr[index] = this.points
                    .slice(this.parts[index], this.parts[index + 1])
                    .map(pt => pt.toArray(latFirst));
            }
        } else {
            arr.push(this.points.map(pt => pt.toArray(latFirst)));
        }
        
        return toGeometry("Polygon", arr);
    }
}

// Polygon Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      5          Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumParts        NumParts   Integer     1           Little
//  Byte 40         NumPoints       NumPoints  Integer     1           Little
//  Byte 44         Parts           Parts      Integer     NumParts    Little
//  Byte X          Points          Points     Point       NumPoints   Little
export function parsePolygonRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 5) throw new Error('Invalid Polygon Record');

    const bbox = extractBbox(record.slice(1));
    const [parts, points] = extractPartsPoints(record.slice(9));

    return new Polygon(bbox, parts, points);
}