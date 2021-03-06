import { extractBbox, extractPartsPoints, extractRangeValues } from './common';
import { PolygonZ } from './polygonz';

export class MultiPatch extends PolygonZ {}

// MultiPatch Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      31         Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumParts        NumParts   Integer     1           Little
//  Byte 40         NumPoints       NumPoints  Integer     1           Little
//  Byte 44         Parts           Parts      Integer     NumParts    Little
//  Byte W          PartTypes       PartTypes  Integer     NumParts    Little
//  Byte X          Points          Points     Point       NumPoints   Little
//  Byte Y          Zmin            Zmin       Double      1           Little
//  Byte Y+8        Zmax            Zmax       Double      1           Little
//  Byte Y+16       Zarray          Zarray     Double      NumPoints   Little
//  Byte Z*         Mmin            Mmin       Double      1           Little
//  Byte Z+8*       Mmax            Mmax       Double      1           Little
//  Byte Z+16*      Marray          Marray     Double      NumPoints   Little
//  Note: W = 44 + (4*NumParts), X = W + (4 * NumParts), 
//  Y = X + (16 * NumPoints), Z = Y + 16 + (8 * NumPoints)
//  * optional
export function parseMultiPatchRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 31) throw new Error('Invalid MultiPatch Record');

    const bbox = extractBbox(record.slice(1));
    const [parts, points] = extractPartsPoints(record.slice(9));
    const numOfParts = parts.length;
    const numOfPoints = points.length;

    const record64 = new BigInt64Array(record.slice(11 + numOfParts + (numOfPoints << 2)).buffer);
    const [zRange, zArray] = extractRangeValues(record64, numOfPoints);
    const [mRange, mArray] = extractRangeValues(record64.slice(2 + numOfPoints).buffer, numOfPoints);

    return new MultiPatch(bbox, parts, points, mRange, mArray, zRange, zArray);
}