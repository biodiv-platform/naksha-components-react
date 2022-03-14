import { defaultViewState } from "../static/naksha";

/**
 * transforms Mapbox viewstate to Google Maps viewstate
 *
 * @param {object} [vp=defaultViewState] mapbox viewstate
 * @param {number} [zoomOffset=1] auto adjest zoom level for google maps
 * @return {*}
 */
export const mapboxToGmapsViewState = (vp = defaultViewState, zoomOffset = 1) => {
  return {
    center: {
      lat: vp.latitude,
      lng: vp.longitude,
    },
    zoom: vp.zoom + zoomOffset,
  };
};
