import axios from "axios";
import cb from "colorbrewer";

import { compiledMessage } from "../utils/basic";
import { geohashToJSON, getDataBins, getZoomConfig } from "../utils/grid";
import { parseGeoserverLayersXml } from "../utils/naksha";

export const axGetGeoserverLayers = async (
  { endpoint, workspace },
  selectedLayers
) => {
  try {
    const res = await axios.get(
      `${endpoint}/${workspace}/wfs?service=wfs&version=1.1.0&request=GetCapabilities`,
      { responseType: "text" }
    );
    return parseGeoserverLayersXml(
      res.data,
      endpoint,
      workspace,
      selectedLayers
    );
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const axGetGeoserverLayerStyleList = async (id, endpoint) => {
  try {
    const res = await axios.get(`${endpoint}/geoserver/layers/${id}/styles`);
    return res.data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const axGetGeoserverLayerStyle = async (styleName, endpoint) => {
  try {
    const res = await axios.get(
      `${endpoint}/geoserver/styles/${styleName}.json`
    );
    return res.data?.layers?.[0];
  } catch (e) {
    console.error(e);
    return {};
  }
};

export const getGridLayerData = async (
  url,
  bounds,
  zoom,
  binCount = 6,
  colorScheme = "YlOrRd"
) => {
  try {
    const [precision, level, squareSize] = getZoomConfig(zoom);
    const { _ne, _sw } = bounds;
    const endpoint = compiledMessage(url, {
      top: _ne.lat,
      left: _sw.lng,
      bottom: _sw.lat,
      right: _ne.lng,
      precision
    });

    const { data } = await axios.get(endpoint);

    const geojson = geohashToJSON(data, level);
    const bins = getDataBins(data, binCount);
    const stops = bins.map((bin, index) => [
      bin,
      cb[colorScheme][binCount][index]
    ]);
    const paint = {
      "fill-color": {
        property: "count",
        default: "yellow",
        stops
      },
      "fill-outline-color": "rgba(0,0,0,0.2)",
      "fill-opacity": 0.7
    };

    return { success: true, geojson, paint, stops, squareSize };
  } catch (e) {
    console.error(e);
    return { success: false, geojson: {}, paint: {}, stops: [], squareSize: 0 };
  }
};
