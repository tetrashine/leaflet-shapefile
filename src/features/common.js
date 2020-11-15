import { Point } from './point';

export function toGeometry(type, coordinates) {
    return {
        "type": type,
        "coordinates": coordinates,
    };
}

export function latLng(x, y) { return [x, y]; }

export function lngLat(x, y) { return [y, x]; }

export function extractBbox(buffer) {
    return new BigInt64Array(buffer.slice(0, 8).buffer);
}

export function extractPoints(buffer) {
    const numOfPoints = buffer[0];
    const pointsBuffer = new BigInt64Array(buffer.slice(1).buffer);

    const points = [];
    for (let index = 0; index < numOfPoints; index++) {
        points.push(new Point(pointsBuffer[index << 1], pointsBuffer[(index << 1) + 1]));
    }

    return points;
}

export function extractPartsPoints(buffer) {
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

export function extractRangeValues(buffer, numOfPoints) {
    const buf = new BigInt64Array(buffer);
    const min = buf[0];
    const max = buf[1];

    let array = [];
    for (let index = 0; index < numOfPoints; index++) {
        array.push(buf[2 + index]);
    }

    return [[min, max], array];
}