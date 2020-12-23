import { WebMercatorViewport } from "@math.gl/web-mercator";
import bbox from "@turf/bbox";
import produce from "immer";
import { debounce } from "ts-debounce";

import { GeoserverLayer } from "../interfaces/naksha";
import {
  axDownloadLayer,
  axGetGeoserverLayers,
  axGetGeoserverLayerStyle,
  axGetGeoserverLayerStyleList,
  axPublishLayer,
  getGridLayerData
} from "../services/naksha";
import {
  FEATURE_PROP,
  HL,
  LAYER_PREFIX,
  LAYER_PREFIX_GRID
} from "../static/constants";
import { useLayers } from "./use-layers";

export default function useLayerManager() {
  const {
    setLayers,
    geoserver,
    nakshaEndpointToken,
    nakshaApiEndpoint,
    mapRef,
    layers,
    viewPort,
    setViewPort,
    infobarData,
    setInfobarData,
    selectedLayers,
    setLegend,
    setClickPopup,
    setHoverPopup,
    onLayerDownload
  } = useLayers();

  /**
   * On clicking handler for map
   * - highlights features on vector layers
   * - triggers callback for grid layer and renders on click element if passed
   *
   * @param {*} e
   */
  const onMapClick = e => {
    const hlLayers = [];

    setClickPopup(null);

    e?.features?.forEach(featureRaw => {
      const feat = featureRaw.toJSON();

      if (feat.layer.id.startsWith(LAYER_PREFIX)) {
        const featureId = feat.properties[FEATURE_PROP];

        let hlLayer = {
          ...feat.layer,
          id: `${HL.PREFIX}${feat.layer.id}-${featureId}`,
          filter: ["in", FEATURE_PROP, featureId]
        };

        hlLayer = produce(hlLayer, _draft => {
          const hlStyle = HL.PAINT[feat.geometry.type] || {};
          _draft.paint = { ...hlLayer.paint, ...hlStyle };
        });

        hlLayers.push({
          layer: hlLayer,
          properties: feat.properties
        });
      } else if (feat.layer.id.startsWith(LAYER_PREFIX_GRID)) {
        onMapEventGrid(e.lngLat, feat, setClickPopup);
      }
    });

    setInfobarData(hlLayers);
  };

  const onMapHover = e => {
    let noFeature = true;

    e?.features?.forEach(featureRaw => {
      const feat = featureRaw.toJSON();
      if (feat.layer.id.startsWith(LAYER_PREFIX_GRID)) {
        onMapEventGrid(e.lngLat, feat, setHoverPopup, "onHover");
        noFeature = false;
      }
      if (feat.layer.id.startsWith(LAYER_PREFIX)) {
        onMapEventVector(e.lngLat, feat, setHoverPopup);
        noFeature = false;
      }
    });
    if (noFeature) {
      setHoverPopup(null);
    }
  };

  const onMapEventGrid = (lngLat, feature, set, eventProp = "onClick") => {
    const layer = layers.find(
      l => `${LAYER_PREFIX_GRID}${l.id}` === feature.layer.id
    );
    set({
      element: layer[eventProp],
      bbox: bbox(feature),
      feature,
      lngLat,
      layerId: layer.id
    });
  };

  const onMapEventVector = (lngLat, feature, set) => {
    const layer = layers.find(l => l.id === feature.layer.id);

    const data = layer?.data?.summaryColumn.map(column => [
      layer?.data?.propertyMap[column],
      feature.properties[column]
    ]);

    set({
      element: 1,
      bbox: bbox(feature),
      feature: data,
      lngLat,
      layerId: layer.title
    });
  };

  /**
   * Removes Highlighted layers
   *
   */
  const removeHighlightedLayers = (): void => {
    const map = mapRef.current.getMap();
    map.getStyle().layers.forEach(({ id }) => {
      if (id.startsWith(HL.PREFIX)) {
        map.removeLayer(id);
      }
    });
  };

  /**
   * Renders highlighted data
   *
   */
  const renderHLData = () => {
    const map = mapRef?.current?.getMap();

    if (!map?.isStyleLoaded()) {
      return;
    }

    removeHighlightedLayers();

    infobarData.forEach(({ layer }) => {
      map.addLayer(layer);
    });
  };

  /**
   * Reloads layers if specified grid only it will reload grid based layers only
   * 🤔 why grid only?
   * because grid layers needs to reload geohash data from geoserver on viewport change
   *
   * @param {boolean} [gridOnly=false]
   */
  const reloadLayers = debounce((gridOnly = false) => {
    layers.forEach(layer => {
      const gridFlag = gridOnly
        ? layer.id.startsWith(LAYER_PREFIX_GRID)
        : false;
      if (layer.isAdded || gridFlag) {
        toggleLayer(layer.id, true, layer?.data?.styleIndex, false);
      }
    });
    mapRef?.current?.getMap()?.once("idle", renderHLData);
  }, 1000);

  /**
   * Gets geoserver vector based layer styles 💅 and caches it so won't be loaded again
   *
   * @param {GeoserverLayer} layer
   * @param {*} styleIndex
   * @returns
   */
  const getLayerStyle = async (layer: GeoserverLayer, styleIndex) => {
    const nextSl = produce(layer.data, async _draft => {
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
            data.styles.map(o => [o.styleName, o.styleTitle])
          );
        }
      }
      if (!_draft.styles[styleIndex].colors) {
        _draft.styles[styleIndex].colors = await axGetGeoserverLayerStyle(
          layer.id,
          geoserver.workspace,
          _draft.styles[styleIndex].styleName,
          nakshaApiEndpoint
        );
      }
      _draft.styleIndex = styleIndex;
    });
    return nextSl;
  };

  /**
   * navigates map to provided bounding box
   * this is basically useful when you render any layer from
   * geoserver 🌐 and zoom 🔎 to that
   *
   * @param {*} bbox array of bbox coordinates
   * @param {boolean} updateBbox if passed false this function will do nothing
   */
  const updateToBBox = (bbox, updateBbox: boolean) => {
    if (updateBbox) {
      const viewportx = new WebMercatorViewport(viewPort as any);
      const { longitude, latitude, zoom } = viewportx.fitBounds(bbox);
      setViewPort(o => ({
        ...o,
        longitude,
        latitude,
        zoom: zoom - 0.2
      }));
    }
  };

  /**
   * 🚨 don't call this function directly call `toggleLayer()` instead
   * Toggles 🔀 geoserver vector type layer
   *
   * @param {string} id layer id from geoserver
   * @param {number} layerIndex index of layer in layers array
   * @param {boolean} [add=true] weather to add or remove layer
   * @param {number} [styleIndex=0] index of style defaults to first style
   * @param {boolean} [updateBbox=true] weather to zoom to that layer once loaded or not
   */
  const toggleLayerVector = async (
    id: string,
    layerIndex: number,
    add = true,
    styleIndex = 0,
    updateBbox = true
  ) => {
    const map = mapRef.current.getMap();
    const layer = layers[layerIndex];
    const layerMeta = await getLayerStyle(layer, styleIndex);

    setLayers(_draft => {
      if (add) {
        _draft[layerIndex].data = layerMeta;
      }
      _draft[layerIndex].isAdded = add;
    });

    if (add) {
      if (!map.getSource(id)) {
        map.addSource(id, layer.source);
      }
      removeLayer(map, id);
      map.addLayer(layerMeta.styles[styleIndex].colors);
      updateToBBox(layer.bbox, updateBbox);
    } else {
      const t = infobarData.filter(
        ({ layer }) => !layer.id.startsWith(HL.PREFIX + id)
      );
      setInfobarData(t);

      removeLayer(map, id);
    }
  };

  /**
   * 🚨 don't call this function directly call `toggleLayer()` instead
   * Toggles 🔀 geohash grid layer
   *
   * @param {string} id layer id from geoserver
   * @param {number} layerIndex index of layer in layers array
   * @param {boolean} [add=true] weather to add or remove layer
   */
  const toggleGridLayer = async (
    id: string,
    layerIndex: number,
    add = true
  ) => {
    const map = mapRef.current.getMap();
    const prefixedId = `${LAYER_PREFIX_GRID}${id}`;

    if (add) {
      const layer = layers[layerIndex];
      const source = map.getSource(prefixedId);
      const mapLayer = map.getLayer(prefixedId);

      const {
        success,
        geojson,
        paint,
        stops,
        squareSize
      } = await getGridLayerData(
        layer.source.endpoint,
        map.getBounds(),
        viewPort.zoom,
        layer.data
      );

      if (success) {
        if (source) {
          source.setData(geojson);
        } else {
          map.addSource(prefixedId, {
            type: "geojson",
            data: geojson
          });
        }
        if (mapLayer) {
          Object.entries(paint).forEach(([k, v]) => {
            map.setPaintProperty(prefixedId, k, v);
          });
        } else {
          map.addLayer({
            id: prefixedId,
            source: prefixedId,
            type: "fill",
            paint
          });
        }
        setLegend({ visible: true, stops, squareSize });
      }
    } else {
      removeLayer(map, prefixedId);
      setLegend({});
    }

    setLayers(_draft => {
      _draft[layerIndex].isAdded = add;
    });
  };

  /**
   * Helper function to remove layer if exists used by `toggleLayerVector()`
   *
   * @param {*} map Mapbox map instance
   * @param {string} id Layer ID
   */
  const removeLayer = (map, id: string) => {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  };

  /**
   * Toggle any kind of layer supported by this library
   *
   * @param {string} id Layer ID
   * @param {boolean} [add=true] weather to add or remove layer
   * @param {number} [styleIndex=0] style index defaults to zero
   * @param {boolean} [updateBbox=true] weather to zoom to that layer once loaded or not
   */
  const toggleLayer = async (
    id: string,
    add = true,
    styleIndex = 0,
    updateBbox = true
  ) => {
    try {
      const layerIndex = layers.findIndex(o => o.id === id);
      switch (layers[layerIndex].source.type) {
        case "vector":
          await toggleLayerVector(id, layerIndex, add, styleIndex, updateBbox);
          break;

        case "grid":
          await toggleGridLayer(id, layerIndex, add);
          break;

        default:
          console.debug("😐 Invalid Source Type");
          break;
      }
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Lists all geoserver layers of given workspace and stores into layers array
   *
   */
  const getGeoserverLayers = async () => {
    const layersData = await axGetGeoserverLayers(
      nakshaEndpointToken,
      nakshaApiEndpoint,
      geoserver,
      selectedLayers
    );
    setLayers(_draft => {
      _draft.push(...layersData);
    });
  };

  const handleOnLayerDownload = async layerId => {
    const { success, data } = await onLayerDownload(layerId);
    if (success) {
      axDownloadLayer(nakshaApiEndpoint, data, layerId);
    }
  };

  const publishLayer = async layerId => {
    await axPublishLayer(nakshaEndpointToken, nakshaApiEndpoint, layerId);
  };

  return {
    getGeoserverLayers,
    onMapClick,
    onMapHover,
    reloadLayers,
    renderHLData,
    toggleLayer,
    publishLayer,
    handleOnLayerDownload,
    onMapEventVector
  };
}
