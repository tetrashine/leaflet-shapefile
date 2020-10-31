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

class Null {}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class MultiPoint {
    constructor(bbox, points) {
        this.bbox = bbox;
        this.numOfPoints = points.length;
        this.points = points;
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
}

class Polygon extends PolyLine {}

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

// MultiPoint Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      8          Integer     1           Little
//  Byte 4          Box             Box        Double      4           Little
//  Byte 36         NumPoints       NumPoints  Integer     1           Little
//  Byte 40         Points          Points     Point       NumPoints   Little
export function parseMultiPointRecord(buffer) {
    const record = new Uint32Array(buffer);
    if (record[0] !== 8) throw new Error('Invalid Multi-Point Record');

    const bbox = new BigInt64Array(record.slice(1, 9).buffer);
    const numOfPoints = record[9];;
    const pointsBuffer = new BigInt64Array(record.slice(10).buffer);

    let points = [];
    for (let index = 0; index < numOfPoints; index++) {
        points.push(new Point(pointsBuffer[index << 1], pointsBuffer[(index << 1) + 1]));
    }

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

    const bbox = new BigInt64Array(record.slice(1, 9).buffer);
    const numOfParts = record[9];
    const numOfPoints = record[10];

    const parts = new Uint32Array(record.slice(11, 11 + numOfParts).buffer);
    const pointsBuffer = new BigInt64Array(record.slice(11 + numOfParts).buffer);

    let points = [];
    for (let index = 0; index < numOfPoints; index++) {
        points.push(new Point(pointsBuffer[index << 1], pointsBuffer[(index << 1) + 1]));
    }

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

    const bbox = new BigInt64Array(record.slice(1, 9).buffer);
    const numOfParts = record[9];
    const numOfPoints = record[10];

    const parts = new Uint32Array(record.slice(11, 11 + numOfParts).buffer);
    const pointsBuffer = new BigInt64Array(record.slice(11 + numOfParts).buffer);

    let points = [];
    for (let index = 0; index < numOfPoints; index++) {
        points.push(new Point(pointsBuffer[index << 1], pointsBuffer[(index << 1) + 1]));
    }

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

    const bbox = new BigInt64Array(record.slice(1, 9).buffer);
    const numOfPoints = record[9];
    const pointsBuffer = new BigInt64Array(record.slice(10).buffer);

    let points = [];
    for (let index = 0; index < numOfPoints; index++) {
        points.push(new Point(pointsBuffer[index << 1], pointsBuffer[(index << 1) + 1]));
    }

    const m = new BigInt64Array(record.slice(10 + (numOfPoints << 2)).buffer);
    const mMin = m[0];
    const mMax = m[1];

    let mArray = [];
    for (let index = 0; index < numOfPoints; index++) {
        mArray.push(m[1 + index]);
    }    

    return new MultiPointM(bbox, points, [mMin, mMax], mArray);
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

    const bbox = new BigInt64Array(record.slice(1, 9).buffer);
    const numOfParts = record[9];
    const numOfPoints = record[10];

    const parts = [record[11], record[12]];
    const pointsBuffer = new BigInt64Array(record.slice(13).buffer);

    let points = [];
    for (let index = 0; index < numOfPoints; index++) {
        points.push(new Point(pointsBuffer[index << 1], pointsBuffer[(index << 1) + 1]));
    }

    const m = new BigInt64Array(record.slice(13 + (numOfPoints << 2)).buffer);
    const mMin = m[0];
    const mMax = m[1];

    let mArray = [];
    for (let index = 0; index < numOfPoints; index++) {
        mArray.push(m[1 + index]);
    }

    return new PolyLineM(bbox, parts, points, [mMin, mMax], mArray);
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

    const bbox = new BigInt64Array(record.slice(1, 9).buffer);
    const numOfParts = record[9];
    const numOfPoints = record[10];

    const parts = [record[11], record[12]];
    const pointsBuffer = new BigInt64Array(record.slice(13).buffer);

    let points = [];
    for (let index = 0; index < numOfPoints; index++) {
        points.push(new Point(pointsBuffer[index << 1], pointsBuffer[(index << 1) + 1]));
    }

    const m = new BigInt64Array(record.slice(13 + (numOfPoints << 2)).buffer);
    const mMin = m[0];
    const mMax = m[1];

    let mArray = [];
    for (let index = 0; index < numOfPoints; index++) {
        mArray.push(m[1 + index]);
    } 

    return new PolygonM(bbox, parts, points, [mMin, mMax], mArray);
}

// PointZ Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      11         Integer     1           Little
//  Byte 4          X               X          Double      1           Little
//  Byte 12         Y               Y          Double      1           Little
//  Byte 20         Measure         M          Double      1           Little
export function parsePointZRecord(record) {}

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
export function parseMultiPointZRecord(record) {}

// PolyLineZ Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      18         Integer     1           Little
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
export function parsePolyLineZRecord(record) {}

// PolygonZ Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      18         Integer     1           Little
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
export function parsePolygonZRecord(record) {}

// MultiPatch Record Contents
//  Position        Field           Value      Type        Number      Byte Order
//  Byte 0          Shape Type      15         Integer     1           Little
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
export function parseMultiPatchRecord(record) {}

// Description of Index Records
//  Position        Field           Value           Type      Byte Order
//  Byte 0          Offset          Offset          Integer   Big
//  Byte 4          Content Length  Content Length  Integer   Big
export function parseIndexRecords(buffer) {}