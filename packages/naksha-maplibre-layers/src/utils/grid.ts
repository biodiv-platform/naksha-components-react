import BoundingBox from "boundingbox";
import { GeoHash } from "geohash";

import { PROPERTY_ID } from "../static/constants";

/**
 * Takes zoom level of map and returns Precision, Level and Square Size (in kms)
 *
 * @param {*} zoom
 * @returns {number[]}
 */
export const getZoomConfig = (zoom): number[] => {
  if (zoom < 6) return [4, 1, 39.2];
  else if (zoom < 7) return [5, 0, 19.6];
  else if (zoom < 8) return [5, 1, 9.8];
  else if (zoom < 9) return [5, -1, 4.9];
  else if (zoom < 10) return [6, 0, 2.45];
  else if (zoom < 11) return [6, 1, 1.225];
  else if (zoom < 12) return [7, 0, 0.612];
  else if (zoom < 13) return [7, 1, 0.306];
  else if (zoom < 14) return [7, -1, 0.153];
  else if (zoom < 15) return [8, 0, 0.077];
  return [8, 1, 0.039];
};

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

const aggregateGeohashKey = (key, level, binSize?) => {
  binSize = binSize || 16 / 2 ** ((1 - key.length) & 1) / 4 ** level;
  const keyExceptLast = key.slice(0, -1);
  const binnedCharAt = ~~(BASE32.indexOf(key.slice(-1)) / binSize);
  return [
    keyExceptLast + BASE32[binSize * binnedCharAt],
    keyExceptLast + BASE32[binSize * (binnedCharAt + 1) - 1],
  ];
};

/**
 * A grid cell's value is either a count or an object of numbers that has a `count`
 * (e.g. `{ count: 12, ibp: 8, gbif: 4 }`); both become feature properties
 */
const toCellProperties = (value): { [key: string]: number } =>
  typeof value === "number" ? { count: value } : value;

/** Adds every number in `properties` to `total` */
const addCellProperties = (total, properties) => {
  for (const [key, value] of Object.entries(properties)) {
    total[key] = (total[key] || 0) + (value as number);
  }
  return total;
};

const processRectangles = function (data, level) {
  var counts = new Map();
  var bins = new Map();
  const features: any[] = [];

  for (const [hash, value] of Object.entries(data)) {
    const [kStart, kEnd] = aggregateGeohashKey(hash, level);
    bins.set(kStart, kEnd);
    counts.set(
      kStart,
      addCellProperties(counts.get(kStart) || {}, toCellProperties(value))
    );
  }

  counts.forEach((properties, hash) => {
    const bboxStart = GeoHash.decodeGeoHash(hash);
    const bboxEnd = GeoHash.decodeGeoHash(bins.get(hash));
    const feature = new BoundingBox({
      minlat: bboxStart.latitude[0],
      minlon: bboxStart.longitude[0],
      maxlat: bboxEnd.latitude[1],
      maxlon: bboxEnd.longitude[1],
    }).toGeoJSON();
    features.push({
      ...feature,
      properties: { ...properties, [PROPERTY_ID]: hash },
    });
  });

  return features;
};

const processSquares = (data) => {
  const features: any = [];

  for (const [hash, value] of Object.entries(data)) {
    const bbox = GeoHash.decodeGeoHash(hash);
    const feature = new BoundingBox({
      minlat: bbox.latitude[0],
      minlon: bbox.longitude[0],
      maxlat: bbox.latitude[1],
      maxlon: bbox.longitude[1],
    }).toGeoJSON();
    features.push({
      ...feature,
      properties: { ...toCellProperties(value), [PROPERTY_ID]: hash },
    });
  }

  return features;
};

/**
 * Converts {geohash: count} or {geohash: {count, ...}} to geojson
 *
 * @param {*} data
 * @param {number} level
 * @returns
 */
export const geohashToJSON = (data, level: number) => ({
  type: "FeatureCollection",
  features:
    Object.keys(data).length === 0
      ? []
      : level === -1
        ? processSquares(data)
        : processRectangles(data, level),
});

export const getDataBins = (data: { [key: string]: any }, binCount: number) => {
  const sortedData = Object.values(data)
    .map((value) => toCellProperties(value).count)
    .sort((a, b) => a - b);
  const cutoff = Math.floor(sortedData.length / binCount);
  const tBins = new Array(binCount - 1)
    .fill(0)
    .map((_, index) => sortedData[cutoff * (index + 1)]);
  tBins.push(sortedData[sortedData.length - 1]);
  return tBins;
};

/** [minLon, minLat, maxLon, maxLat] of a GeoJSON feature */
export const getFeatureBBox = (feature) => {
  const points: number[][] = [];
  const collect = (coords) =>
    typeof coords[0] === "number"
      ? points.push(coords)
      : coords.forEach(collect);
  collect(feature?.geometry?.coordinates || []);
  if (!points.length) return undefined;

  const lons = points.map(([lon]) => lon);
  const lats = points.map(([, lat]) => lat);
  return [
    Math.min(...lons),
    Math.min(...lats),
    Math.max(...lons),
    Math.max(...lats),
  ];
};
