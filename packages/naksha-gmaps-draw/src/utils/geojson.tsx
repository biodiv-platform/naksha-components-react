import bbox from "@turf/bbox";

import { GMAP_FEATURE_TYPES } from "../static/constants";

/**
 * Used with `<AutoComplete/>` component to convert search result to GeoJSON marker
 *
 * @param {*} place
 * @return {*}
 */
export const placeToGeoJsonFeature = (place) => {
  return {
    type: GMAP_FEATURE_TYPES.POINT,
    properties: {
      id: new Date().getTime(),
      name: place.name,
      formatted_address: place.formatted_address,
    },
    coordinates: Object.values(place.geometry.location.toJSON()).reverse(),
  };
};

/**
 * - converts geometry returned from data object to GeoJSON
 * - the reason for coverting this is so we can provide consistant onChange callback
 * - we *reverse* coordinates to keep compatibility with mapbox
 *
 * @param {*} geometry
 * @return {*}
 */
export const geometryToGeoJsonFeature = (geometry) => {
  const id = new Date().getTime();

  switch (geometry.getType()) {
    case GMAP_FEATURE_TYPES.POINT: {
      return {
        type: GMAP_FEATURE_TYPES.POINT,
        properties: { id },
        coordinates: Object.values(geometry.get().toJSON()).reverse(),
      };
    }

    case GMAP_FEATURE_TYPES.POLYGON: {
      const clist: any[] = [];

      const toLatLng = (c) => clist.push([c.lng(), c.lat()]);
      geometry.forEachLatLng(toLatLng);

      // To make first and last equal
      clist.push(clist[0]);

      return {
        type: GMAP_FEATURE_TYPES.POLYGON,
        properties: { id },
        coordinates: [clist],
      };
    }

    case GMAP_FEATURE_TYPES.RAW: {
      const clist: any[] = geometry.data;

      // To make first and last equal
      clist.push(clist[0]);

      return {
        type: GMAP_FEATURE_TYPES.POLYGON,
        properties: { id },
        coordinates: [clist],
      };
    }

    case GMAP_FEATURE_TYPES.LINESTRING: {
      const clist: any[] = [];

      const toLatLng = (c) => clist.push([c.lng(), c.lat()]);
      geometry.forEachLatLng(toLatLng);

      return {
        type: GMAP_FEATURE_TYPES.LINESTRING,
        properties: { id },
        coordinates: clist,
      };
    }

    default:
      return null;
  }
};

export const toFullGeoJson = (features) => {
  const cleanFeaures = (features || []).filter((o) => o);

  if (cleanFeaures.length === 0) {
    return false;
  }

  const mergedGeoJson = {
    type: "FeatureCollection",
    features: cleanFeaures.map((value) => {
      if (Array.isArray(value) && value.length > 0 && value[0].isGeojson) {
        const feature = value[0];
        return {
          type: "Feature",
          properties: feature.properties || {},
          geometry: feature.geometry || null,
        };
      } else {
        return { type: "Feature", properties: {}, geometry: value };
      }
    }),
  };


  return mergedGeoJson;
};

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
