import produce from "immer";

import { GeoserverLayer } from "../interfaces";
import {
  axGetGeoserverLayerStyle,
  axGetGeoserverLayerStyleList,
} from "../services/naksha";

/**
 * pre-processes layers list
 *
 */
export const parseGeoserverLayersXml = (
  layers,
  nakshaApiEndpoint,
  endpoint,
  workspace,
  selectedLayers
): GeoserverLayer[] => {
  const selectedLayersIDs = selectedLayers.map(({ id }) => id);

  return layers.map((l, index) => ({
    ...l,
    index,
    id: l.name,
    thumbnail: nakshaApiEndpoint + l.thumbnail,
    source: {
      type: "vector",
      scheme: "tms",
      tiles: [
        `${endpoint}/gwc/service/tms/1.0.0/${workspace}:${l.name}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`,
      ],
    },
    data: { styles: [] },
    isAdded: selectedLayersIDs.includes(l.name),
  }));
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
