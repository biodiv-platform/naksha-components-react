import bbox from "@turf/bbox";

/**
 * Calculates bounds for all features
 *
 * @param {*} geojson
 * @return {*}
 */
export const calculateBounds = (geojson) => {
  const b = bbox(geojson);

  return {
    east: b[2],
    north: b[3],
    south: b[1],
    west: b[0],
  };
};
