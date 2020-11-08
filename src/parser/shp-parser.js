// Organization of the Main File
//  File Header
//  Record Header, Record Content
//  Record Header, Record Content
//  ...
//  Record Header, Record Content
//
// Description of the Main File Header
//  Position        Field           Value       Type        Byte Order
//  Byte 0          File Code       9994        Integer     Big
//  Byte 4          Unused          0           Integer     Big
//  Byte 8          Unused          0           Integer     Big
//  Byte 12         Unused          0           Integer     Big
//  Byte 16         Unused          0           Integer     Big
//  Byte 20         Unused          0           Integer     Big
//  Byte 24         File Length     File Length Integer     Big
//  Byte 28         Version         1000        Integer     Little
//  Byte 32         Shape Type      Shape Type  Integer     Little
//  Byte 36         Bounding Box    Xmin        Double      Little
//  Byte 44         Bounding Box    Ymin        Double      Little
//  Byte 52         Bounding Box    Xmax        Double      Little
//  Byte 60*        Bounding Box    Ymax        Double      Little
//  Byte 68*        Bounding Box    Zmin        Double      Little
//  Byte 76*        Bounding Box    Zmax        Double      Little
//  Byte 84*        Bounding Box    Mmin        Double      Little
//  Byte 92*        Bounding Box    Mmax        Double      Little
//
// * Unused, with value 0.0, if not Measured or Z type



// Description of the Main File Record Headers
//  Position        Field           Value           Type        Byte Order
//  Byte 0          Record Number   Record Number   Integer     Big
//  Byte 4          Content Length  Content Length  Integer     Big

export function mainFileParser(buffer) {
    if (!validate(buffer)) { throw new Error('Invalid Main File Header'); }

    const view = new Uint32Array(buffer);
}

export function validateMainFile(buffer) {
    const view = new Uint32Array(buffer);
    const length = view.length;
    const fileCode = view[0];
    const shapeType = view[8];

    return fileCode === 9994
        && validShapeType(shapeType)
        && length == 25;
}

// Value        Shape Type          Binary
// 0            Null Shape          0000 0000
// 1            Point               0000 0001
// 3            PolyLine            0000 0011
// 5            Polygon             0000 0101
// 8            MultiPoint          0000 1000
// 11           PointZ              0000 1011
// 13           PolyLineZ           0000 1101
// 15           PolygonZ            0000 1111
// 18           MultiPointZ         0001 0010
// 21           PointM              0001 0101
// 23           PolyLineM           0001 0111
// 25           PolygonM            0001 1001
// 28           MultiPointM         0001 1100
// 31           MultiPatch          0001 1111

export function validShapeType(type) {
    return (type == 0) 
        || (type == 1) 
        || (type == 3)
        || (type == 5)
        || (type == 8)
        || (type == 11)
        || (type == 13)
        || (type == 15)
        || (type == 18)
        || (type == 21)
        || (type == 23)
        || (type == 25)
        || (type == 28)
        || (type == 31);
}

function toGeometry(type, coordinates) {
    return {
        "type": type,
        "coordinates": coordinates,
    };
}

function latLng(x, y) { return [x, y]; }

function lngLat(x, y) { return [y, x]; }

class Null {}

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

class MultiPoint {
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

class PolyLine {
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

class PointM extends Point {
    constructor(x, y, m) {
        super(x, y);
        this.m = m;
    }
}

class MultiPointM extends MultiPoint {
    constructor(bbox, points, mRange, mArray) {
        super(bbox, points);
        this.mRange = mRange;
        this.mArray = mArray;
    }
}

class PolyLineM extends PolyLine {
    constructor(bbox, parts, points, mRange, mArray) {
        super(bbox, parts, points);
        this.mRange = mRange;
        this.mArray = mArray;
    }
}

class PolygonM extends Polygon {
    constructor(bbox, parts, points, mRange, mArray) {
        super(bbox, parts, points);
        this.mRange = mRange;
        this.mArray = mArray;
    }
}

class PointZ extends PointM {
    constructor(x, y, m, z) {
        super(x, y, m);
        this.z = z;
    }
}

class MultiPointZ extends MultiPointM {
    constructor(bbox, points, mRange, mArray, zRange, zArray) {
        super(bbox, points, mRange, mArray);
        this.zRange = zRange;
        this.zArray = zArray;
    }
}

class PolyLineZ extends PolyLineM {
    constructor(bbox, parts, points, mRange, mArray, zRange, zArray) {
        super(bbox, parts, points, mRange, mArray)
        this.zRange = zRange;
        this.zArray = zArray;
    }
}

class PolygonZ extends PolygonM {
    constructor(bbox, parts, points, mRange, mArray, zRange, zArray) {
        super(bbox, parts, points, mRange, mArray);
        this.zRange = zRange;
        this.zArray = zArray;
    }
}

class MultiPatch extends PolygonZ {}

// Null Shape Record Contents
//  Position        Field        Value      Type        Number      Byte Order
//  Byte 0          Shape Type   0          Integer     1           Little
export function parseNullRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 0) throw new Error('Invalid Null Record');

    return new Null();
}

// Point Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      1          Integer     1           Little
//  Byte 4          X               1          Double      1           Little
//  Byte 12         Y               1          Double      1           Little
export function parsePointRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 1) throw new Error('Invalid Point Record');

    const record64 = new BigInt64Array(record.slice(1).buffer);
    return new Point(record64[0], record64[1]);
}

function extractBbox(buffer) {
    return new BigInt64Array(buffer.slice(0, 8).buffer);
}

function extractPoints(buffer) {
    const numOfPoints = buffer[0];
    const pointsBuffer = new BigInt64Array(buffer.slice(1).buffer);

    const points = [];
    for (let index = 0; index < numOfPoints; index++) {
        points.push(new Point(pointsBuffer[index << 1], pointsBuffer[(index << 1) + 1]));
    }

    return points;
}

function extractPartsPoints(buffer) {
    const numOfParts = buffer[0];
    const numOfPoints = buffer[1];
    const parts = new Uint32Array(buffer.slice(2, 2 + numOfParts).buffer);

    const pointsBuffer = new BigInt64Array(buffer.slice(2 + numOfParts).buffer);
    const points = [];
    for (let index = 0; index < numOfPoints; index++) {
        points.push(new Point(pointsBuffer[index << 1], pointsBuffer[(index << 1) + 1]));
    }

    return [parts, points];
}

function extractRangeValues(buffer, numOfPoints) {
    const buf = new BigInt64Array(buffer);
    const min = buf[0];
    const max = buf[1];

    let array = [];
    for (let index = 0; index < numOfPoints; index++) {
        array.push(buf[2 + index]);
    }

    return [[min, max], array];
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

// PolyLineM Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      28         Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumParts        NumParts   Integer     1           Little
//  Byte 40         NumPoints       NumPoints  Point       NumPoints   Little
//  Byte 44         Parts           Parts      Point       NumPoints   Little
//  Byte X*         Points          Points     Point       NumPoints   Little
//  Byte Y*         Mmin            Mmin       Double      1           Little
//  Byte Y+8*       Mmax            Mmax       Double      1           Little
//  Byte Y+16*      Marray          Marray     Double      1           Little
export function parsePolyLineMRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 28) throw new Error('Invalid PolyLineM Record');

    const bbox = extractBbox(record.slice(1));
    const [parts, points] = extractPartsPoints(record.slice(9));
    const numOfParts = parts.length;
    const numOfPoints = points.length;
    const [mRange, mArray] = extractRangeValues(record.slice(13 + (numOfPoints << 2)).buffer, numOfPoints);

    return new PolyLineM(bbox, parts, points, mRange, mArray);
}

// PolygonM Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      25         Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumParts        NumParts   Integer     1           Little
//  Byte 40         NumPoints       NumPoints  Point       NumPoints   Little
//  Byte 44         Parts           Parts      Point       NumPoints   Little
//  Byte X*         Points          Points     Point       NumPoints   Little
//  Byte Y*         Mmin            Mmin       Double      1           Little
//  Byte Y+8*       Mmax            Mmax       Double      1           Little
//  Byte Y+16*      Marray          Marray     Double      1           Little
//  Note: X = 40 + (4 * NumParts); Y = X + (16 * NumPoints)
//  * optional
export function parsePolygonMRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 25) throw new Error('Invalid PolygonM Record');

    const bbox = extractBbox(record.slice(1));
    const [parts, points] = extractPartsPoints(record.slice(9));
    const numOfParts = parts.length;
    const numOfPoints = points.length;
    const [mRange, mArray] = extractRangeValues(record.slice(13 + (numOfPoints << 2)).buffer, numOfPoints);

    return new PolygonM(bbox, parts, points, mRange, mArray);
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

// PolyLineZ Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      13         Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumParts        NumParts   Integer     1           Little
//  Byte 40         NumPoints       NumPoints  Integer     1           Little
//  Byte 44         Parts           Parts      Integer     NumParts    Little
//  Byte X          Points          Points     Point       NumPoints   Little
//  Byte Y          Zmin            Zmin       Double      1           Little
//  Byte Y+8        Zmax            Zmax       Double      1           Little
//  Byte Y+16       Zarray          Zarray     Double      NumPoints   Little
//  Byte Z*         Mmin            Mmin       Double      1           Little
//  Byte Z+8*       Mmax            Mmax       Double      1           Little
//  Byte Z+16*      Marray          Marray     Double      NumPoints   Little
//  Note: X = 40 + (16 * NumPoints); Y = X + 16 + (8 * NumPoints)
//  * optional
export function parsePolyLineZRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 13) throw new Error('Invalid PolyLineZ Record');

    const bbox = extractBbox(record.slice(1));
    const [parts, points] = extractPartsPoints(record.slice(9));
    const numOfParts = parts.length;
    const numOfPoints = points.length;

    const record64 = new BigInt64Array(record.slice(11 + numOfParts + (numOfPoints << 2)).buffer);
    const [zRange, zArray] = extractRangeValues(record64, numOfPoints)
    const [mRange, mArray] = extractRangeValues(record64.slice(2 + numOfPoints).buffer, numOfPoints);

    return new PolyLineZ(bbox, parts, points, mRange, mArray, zRange, zArray);
}

// PolygonZ Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      15         Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumParts        NumParts   Integer     1           Little
//  Byte 40         NumPoints       NumPoints  Integer     1           Little
//  Byte 44         Parts           Parts      Integer     NumParts    Little
//  Byte X          Points          Points     Point       NumPoints   Little
//  Byte Y          Zmin            Zmin       Double      1           Little
//  Byte Y+8        Zmax            Zmax       Double      1           Little
//  Byte Y+16       Zarray          Zarray     Double      NumPoints   Little
//  Byte Z*         Mmin            Mmin       Double      1           Little
//  Byte Z+8*       Mmax            Mmax       Double      1           Little
//  Byte Z+16*      Marray          Marray     Double      NumPoints   Little
//  Note: X = 40 + (16 * NumPoints); Y = X + 16 + (8 * NumPoints)
//  * optional
export function parsePolygonZRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 15) throw new Error('Invalid PolygonZ Record');

    const bbox = extractBbox(record.slice(1));
    const [parts, points] = extractPartsPoints(record.slice(9));
    const numOfParts = parts.length;
    const numOfPoints = points.length;

    const record64 = new BigInt64Array(record.slice(11 + numOfParts + (numOfPoints << 2)).buffer);
    const [zRange, zArray] = extractRangeValues(record64, numOfPoints);
    const [mRange, mArray] = extractRangeValues(record64.slice(2 + numOfPoints).buffer, numOfPoints);

    return new PolygonZ(bbox, parts, points, mRange, mArray, zRange, zArray);
}

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

// Description of Index Records
//  Position        Field           Value           Type      Byte Order
//  Byte 0          Offset          Offset          Integer   Big
//  Byte 4          Content Length  Content Length  Integer   Big
export function parseIndexRecords(buffer) {}