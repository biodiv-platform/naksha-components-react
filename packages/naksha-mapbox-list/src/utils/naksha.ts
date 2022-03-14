import produce from "immer";

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
  const parsedLayers: any[] = [];

  for (const l of layers) {
    const isAdded = selectedLayers.includes(l.name);
    const _l = {
      ...l,
      id: l.name,
      thumbnail: nakshaApiEndpoint + l.thumbnail,
      source: {
        type: "vector",
        scheme: "tms",
        tiles: [
          `${geoserver.endpoint}/gwc/service/tms/1.0.0/${geoserver.workspace}:${l.name}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`,
        ],
      },
      data: { styles: [] },
      isAdded,
    };

    if (isAdded) {
      // if layer is already added pre-fetch it's initial style
      const _ld = await getLayerStyle(_l, 0, nakshaApiEndpoint, geoserver);
      parsedLayers.push({ ..._l, data: _ld });
    } else {
      parsedLayers.push(_l);
    }
  }

  return parsedLayers;
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
  const nextSl = produce(layer.data, async (_draft: any) => {
    if (_draft.styles.length === 0) {
      const { success, data } = await axGetGeoserverLayerStyleList(
        layer.id,
        nakshaApiEndpoint
      );
      if (success) {
        _draft.layerName = data.layerName;
        _draft.styles = data.styles;
        _draft.summaryColumn = data.summaryColumn;
        _draft.titleColumn = data.titleColumn;
        _draft.propertyMap = Object.fromEntries(
          data.styles.map((o) => [o.styleName, o.styleTitle])
        );
      }
    }
    if (!_draft.styles[styleIndex].colors) {
      _draft.styles[styleIndex].colors = await axGetGeoserverLayerStyle(
        layer.id,
        geoserver?.workspace,
        _draft.styles[styleIndex].styleName,
        nakshaApiEndpoint
      );
    }
    _draft.styleIndex = styleIndex;
  });
  return nextSl;
};
