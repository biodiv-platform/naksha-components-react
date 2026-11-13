import {
  axGetGeoserverLayerStyle,
  axGetGeoserverLayerStyleList,
} from "../services/naksha";

/**
 * pre-processes layers list
 *
 */
export const parseGeoserverLayersXml = async (
  layers,
  nakshaApiEndpoint,
  geoserver,
  selectedLayers
) => {
  return Promise.all(
    (layers || []).map(async (l) => {
      const isAdded = selectedLayers?.includes(l.name);
      const isRaster = l.layerType?.toLowerCase() === "raster";
      const _l = {
        ...l,
        id: l.name,
        thumbnail: nakshaApiEndpoint + l.thumbnail,
        source: {
          type: isRaster ? "raster" : "vector",
          scheme: "tms",
          tiles: [
            `${geoserver.endpoint}/gwc/service/tms/1.0.0/${geoserver.workspace}:${l.name}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`,
          ],
        },
        data: { styles: [] },
        isAdded,
      };

      if (isAdded && !isRaster) {
        // if layer is already added pre-fetch its initial style in parallel
        const _ld = await getLayerStyle(_l, 0, nakshaApiEndpoint, geoserver);
        return { ..._l, data: _ld };
      }
      return _l;
    })
  );
};

/**
 * Gets geoserver vector based layer styles 💅 and caches it so won't be loaded again
 *
 * @param {GeoserverLayer} layer
 * @param {*} styleIndex
 * @param {*} nakshaApiEndpoint
 * @param {*} geoserver
 * @returns
 */
export const getLayerStyle = async (
  layer,
  styleIndex,
  nakshaApiEndpoint,
  geoserver
) => {
  const currentData = layer.data || { styles: [] };
  let layerName = currentData.layerName;
  let styles = currentData.styles ? [...currentData.styles] : [];
  let summaryColumn = currentData.summaryColumn;
  let titleColumn = currentData.titleColumn;
  let propertyMap = currentData.propertyMap;

  if (styles.length === 0) {
    const { success, data } = await axGetGeoserverLayerStyleList(
      layer.id,
      nakshaApiEndpoint
    );
    if (success && data) {
      layerName = data.layerName;
      styles = (data.styles || []).map((s: any) => ({ ...s }));
      summaryColumn = data.summaryColumn;
      titleColumn = data.titleColumn;
      propertyMap = Object.fromEntries(
        (data.styles || []).map((o: any) => [o.styleName, o.styleTitle])
      );
    }
  }

  // styles returns empty array for raster file
  if (styles[styleIndex] && !styles[styleIndex]?.colors) {
    const colors = await axGetGeoserverLayerStyle(
      layer.id,
      geoserver?.workspace,
      styles[styleIndex].styleName,
      nakshaApiEndpoint
    );
    styles[styleIndex] = {
      ...styles[styleIndex],
      colors,
    };
  }

  return {
    ...currentData,
    layerName,
    styles,
    summaryColumn,
    titleColumn,
    propertyMap,
    styleIndex,
  };
};
