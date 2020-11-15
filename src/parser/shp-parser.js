import { parseNullRecord } from '../features/null';
import { parsePointRecord } from '../features/point';
import { parsePolyLineRecord } from '../features/polyline';
import { parsePolygonRecord } from '../features/polygon';
import { parseMultiPointRecord } from '../features/multipoint';
import { parsePointZRecord } from '../features/pointz';
import { parsePolyLineZRecord } from '../features/polylinez';
import { parsePolygonZRecord } from '../features/polygonz';
import { parseMultiPointZRecord } from '../features/multipointz';
import { parsePointMRecord } from '../features/pointm';
import { parsePolygonMRecord } from '../features/polygonm';
import { parsePolyLineMRecord } from '../features/polylinem';
import { parseMultiPatchRecord } from '../features/multipatch';

import path from 'path-source';

export function read(shp) {
    //if in web env, try to load network file
    //if in node env, try to read file
    //else throw not supported

    // Export the Underscore object for **CommonJS**, with backwards-compatibility
    // for the old `require()` API. If we're not in CommonJS, add `_` to the
    // global object.

    if (typeof shp === 'string') {
        shp = path(shp)
    }

    return shp.then(source => mainFileParser(source));
};

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

export function mainFileParser(source) {

    return source.slice(100).then(buffer => {
        const header = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

        const fileCode = header.getInt32(0, false);
        const fileLenInBytes = header.getInt32(24, false) / 2;
        const shapeType = header.getInt32(32, true);

        if (!validateMainFile(fileCode, shapeType)) { throw new Error('Invalid Main File Header'); }

        const parser = _parser[shapeType];
        const features = [];

        source.slice(fileLenInBytes).then(buffer => {
            let start = 0, headerLength = 8;
            while (start < fileLenInBytes) {
                const header = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                const [recordNum, length] = parseMainFileRecordHeader(header);

                const record = buffer.buffer.slice(buffer.byteOffset + headerLength + start, buffer.byteOffset + headerLength + start + length);
                const feature = parser(new DataView(record, 0, length));

                features.push(feature);
                start += headerLength + length;
            }
        });

        return features;
    });
}

export function validateMainFile(fileCode, shapeType) {
    return fileCode === 9994
        && validShapeType(shapeType);
}

// Description of the Main File Record Headers
//  Position        Field           Value           Type        Byte Order
//  Byte 0          Record Number   Record Number   Integer     Big
//  Byte 4          Content Length  Content Length  Integer     Big

export function parseMainFileRecordHeader(header) {
    const recordNum = header.getInt32(0, false);
    const length = header.getInt32(4, false) * 2;

    return [recordNum, length];
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
    return(typeof _parser[type] !== 'undefined');
}

const _parser = {
    0: parseNullRecord,
    1: parsePointRecord,
    3: parsePolyLineRecord,
    5: parsePolygonRecord,
    8: parseMultiPointRecord,
    11: parsePointZRecord,
    13: parsePolyLineZRecord,
    15: parsePolygonZRecord,
    18: parseMultiPointZRecord,
    21: parsePointMRecord,
    25: parsePolygonMRecord,
    28: parsePolyLineMRecord,
    31: parseMultiPatchRecord,
}

// Description of Index Records
//  Position        Field           Value           Type      Byte Order
//  Byte 0          Offset          Offset          Integer   Big
//  Byte 4          Content Length  Content Length  Integer   Big
export function parseIndexRecords(buffer) {}