import cb from "colorbrewer";
import axios from "redaxios";

import { geohashToJSON, getDataBins, getZoomConfig } from "../utils/grid";
import { parseGeoserverLayersXml } from "../utils/naksha";

export const axGetGeoserverLayers = async (
  nakshaEndpointToken,
  nakshaApiEndpoint,
  geoserver,
  selectedLayers
) => {
  try {
    const res = await axios.get(`${nakshaApiEndpoint}/layer/all`, {
      headers: { Authorization: nakshaEndpointToken },
    });
    const finalLayers = await parseGeoserverLayersXml(
      res.data,
      nakshaApiEndpoint,
      geoserver,
      selectedLayers
    );
    return finalLayers;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const axGetGeoserverLayerStyleList = async (id, endpoint) => {
  try {
    const { data } = await axios.get(`${endpoint}/layer/onClick/${id}`);
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export const axGexGetRasterInfoWithLonLat = async (
  endpoint,
  workspace,
  params
) => {
  const RasterInfoParams = {
    service: "WMS",
    version: "1.1.1",
    request: "GetFeatureInfo",
    info_format: "application/json",
    width: 100,
    height: 100,
    x: 50,
    y: 50,
    srs: "EPSG:4326",
  };

  try {
    const res = await axios.get(`${endpoint}/${workspace}/wms`, {
      params: { ...params, ...RasterInfoParams },
    });
    return { success: true, data: res.data };
  } catch (e) {
    console.error(e);
    return { success: false, data: [] };
  }
};

export const axToggleLayerPublishing = async (
  nakshaEndpointToken,
  nakshaApiEndpoint,
  layerId,
  isActive
) => {
  try {
    await axios.put(
      `${nakshaApiEndpoint}/layer/${
        isActive ? "active" : "pending"
      }/${layerId}`,
      {},
      { headers: { Authorization: nakshaEndpointToken } }
    );
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const axDeleteLayer = async (
  nakshaEndpointToken,
  nakshaApiEndpoint,
  layerId
) => {
  try {
    await axios.delete(`${nakshaApiEndpoint}/layer/${layerId}`, {
      headers: { Authorization: nakshaEndpointToken },
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const axGetGeoserverLayerStyle = async (
  layername,
  workspace,
  styleName,
  endpoint
) => {
  try {
    const res = await axios.get(
      `${endpoint}/geoserver/workspaces/${workspace}/styles/${layername}_${styleName}.mbstyle`
    );
    return res.data?.layers?.[0];
  } catch (e) {
    console.error(e);
    return {};
  }
};

export const getGridLayerData = async (
  fetcher,
  bounds,
  zoom,
  binCount = 6,
  colorScheme = "YlOrRd"
) => {
  try {
    const [geoAggegationPrecision, level, squareSize] = getZoomConfig(zoom);
    const { _ne, _sw } = bounds;
    const params = {
      top: _ne.lat,
      left: _sw.lng,
      bottom: _sw.lat,
      right: _ne.lng,
      geoAggegationPrecision,
    };

    const data = await fetcher(params);

    const geojson = geohashToJSON(data, level);
    const bins = getDataBins(data, binCount);
    const stops = bins.map((bin, index) => [
      bin,
      cb[colorScheme][binCount][index],
    ]);
    const paint = {
      "fill-color": {
        property: "count",
        default: "yellow",
        stops,
      },
      "fill-outline-color": "rgba(0,0,0,0.2)",
      "fill-opacity": 0.7,
    };

    return { success: true, geojson, paint, stops, squareSize };
  } catch (e) {
    console.error(e);
    return { success: false, geojson: {}, paint: {}, stops: [], squareSize: 0 };
  }
};

export const axDownloadLayer = async (
  endpoint,
  token,
  layerName,
  layerTitle
) => {
  try {
    await axios.post(
      `${endpoint}/layer/download`,
      { layerName, layerTitle, attributeList: [], filterArray: [] },
      { headers: { Authorization: token } }
    );
  } catch (e) {
    console.error(e);
  }
};
