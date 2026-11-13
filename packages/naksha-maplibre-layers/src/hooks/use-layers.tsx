import { defaultMapStyles, useDebounce } from "@biodiv-platform/naksha-commons";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMap } from "react-map-gl/maplibre";

import { GeoserverLayer, NakshaMaplibreLayersProps } from "../interfaces";
import { axDeleteLayer, axToggleLayerPublishing } from "../services/naksha";
import {
  LAYER_STATUS,
  PROPERTY_ID,
  SELECTION_STYLE,
} from "../static/constants";
import { getFeatureBBox } from "../utils/grid";
import { getLayerStyle } from "../utils/naksha";

declare const confirm;

interface LayersContextProps {
  mp: NakshaMaplibreLayersProps;
  updateMP;
  isInfoBarOpen;
  setIsInfoBarOpen;
  layer: {
    mapStyle?;
    setMapStyle;

    maxZoom?;
    setMaxZoom?;

    mapStyles?;
    featuresAtLatLng;
    all: GeoserverLayer[];
    setAll;
    selectedIds: string[];
    setSelectedIds;
    selectedLayers: GeoserverLayer[];

    clearAll;
    toggle;
    updateStyle;
    selectedFeatures;
    selectedFeaturesId;
    setSelectedFeatures;
    togglePublish;
    delete;
    handleSelectStyle;
    selectionStyle;
    setSelectionStyle;

    zoomToExtent;

    gridLegends;
    setGridLegends;
  };
  query: {
    term: string;
    setTerm;
    clickedLngLat;
    setClickedLngLat;
  };
  hover: {
    onHover;
    features;
  };
}

interface LayersProviderProps {
  mp: NakshaMaplibreLayersProps;
  children;
}

const LayersContext = createContext<LayersContextProps>(
  {} as LayersContextProps
);

export const LayersProvider = ({ mp: _mp, children }: LayersProviderProps) => {
  const [mp, setMP] = useState<NakshaMaplibreLayersProps>(_mp);
  const { mapl } = useMap();

  useEffect(() => {
    setMP((prev) => ({ ...prev, ..._mp }));
  }, [_mp]);

  const [queryTerm, setQueryTerm] = useState("");
  const queryTermDebounced = useDebounce(queryTerm, 500);

  const styles =
    mp.mapStyles && mp.mapStyles.length > 0 ? mp.mapStyles : defaultMapStyles;

  const [mapStyle, setMapStyle] = useState(
    (styles[mp?.mapStyle || 0] as any)?.style
  );
  const [maxZoom, setMaxZoom] = useState<number | undefined>(
    (styles[mp?.mapStyle || 0] as any)?.maxZoom
  );
  const [selectionStyle, setSelectionStyle] = useState<string>(
    SELECTION_STYLE.TOP
  );
  const [gridLegends, setGridLegends] = useState({});
  const [isInfoBarOpen, setIsInfoBarOpen] = useState(true);
  const [clickedLngLat, setClickedLngLat] = useState<any>();

  const [layers, setLayers] = useState<GeoserverLayer[]>(_mp.layers || []);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>(
    mp.selectedLayers || []
  );

  useEffect(() => {
    if (
      mp.selectedLayers &&
      mp.selectedLayers.join(",") !== selectedLayerIds.join(",")
    ) {
      setSelectedLayerIds(mp.selectedLayers);
    }
  }, [mp.selectedLayers]);

  const [hoverFeatures, setHoverFeatures] = useState<any>();

  const [selectedFeatures, setSelectedFeatures] = useState<any>();
  const selectedFeaturesId = useMemo(() => {
    const meta = {};

    for (const qr of selectedFeatures || []) {
      meta[qr.sourceLayer] = [
        ...(meta[qr.sourceLayer] || []),
        qr?.properties?.[PROPERTY_ID],
      ];
    }

    return Object.keys(meta).length ? meta : undefined;
  }, [selectedFeatures]);

  const selectedLayers = React.useMemo(() => {
    const unsortedLayers = layers.filter((_layer) =>
      selectedLayerIds.includes(_layer.id)
    );
    const sortedLayers = new Array(selectedLayerIds.length);

    // retrives full layer objects and re-orders according to `selectedLayerIds` order
    for (const layerToSort of unsortedLayers) {
      const idx = selectedLayerIds.findIndex((l) => layerToSort.id === l);
      if (idx > -1) {
        sortedLayers[idx] = layerToSort;
      }
    }

    return sortedLayers;
  }, [layers, selectedLayerIds]);

  const getLayerIndexById = useCallback(
    (layerId) => layers.findIndex((layer) => layer.id === layerId),
    [layers]
  );

  const updateLayerById = useCallback((layerId, updatedLayer) => {
    setLayers((_layers) =>
      _layers.map((l) => (l.id === layerId ? { ...l, ...updatedLayer } : l))
    );
  }, []);

  const toggleVectorLayer = useCallback(
    async (layerIndex, styleIndex, focus) => {
      const layer = layers[layerIndex];
      if (!layer) return;
      const layerData = await getLayerStyle(
        layer,
        styleIndex,
        mp.nakshaApiEndpoint,
        mp.geoserver
      );
      updateLayerById(layer.id, { data: layerData });
      focus &&
        mapl?.fitBounds(layer.bbox as any, { padding: 40, duration: 1000 });
    },
    [layers, mp.nakshaApiEndpoint, mp.geoserver, updateLayerById, mapl]
  );

  const updateLayerStyle = useCallback(
    async (layerId, styleIndex) => {
      const layerIndex = getLayerIndexById(layerId);
      toggleVectorLayer(layerIndex, styleIndex, false);
    },
    [getLayerIndexById, toggleVectorLayer]
  );

  const onMapHover = useCallback(
    async (e) => {
      if (!selectedLayerIds.length || !mapl) return;

      try {
        const lastLayerId = selectedLayerIds[0];

        const feats = mapl.queryRenderedFeatures(e.point, {
          layers: [lastLayerId],
        });

        if (feats.length) {
          const fId = feats[0]?.id || feats[0]?.properties?.[PROPERTY_ID];

          // If same feature of the same layer as earlier don't recompute properties
          if (fId === hoverFeatures?.id && lastLayerId === hoverFeatures?.layerId)
            return;

          const layer = layers[getLayerIndexById(lastLayerId)];
          if (!layer) return;

          const hoverProperties = layer?.data?.summaryColumn?.map((sc) => [
            layer.data?.propertyMap?.[sc] || sc,
            feats[0].properties?.[sc],
          ]);

          setHoverFeatures({
            id: fId,
            layerId: lastLayerId,
            title: layer.title,
            data: hoverProperties || [],
            coordinates: e.lngLat,
            // a layer's own popup content replaces the property table
            content: layer?.onHover?.({
              bbox: getFeatureBBox(feats[0]),
              feature: feats[0],
              layerId: lastLayerId,
            }),
          });
        } else {
          setHoverFeatures((prev) => (prev !== undefined ? undefined : prev));
        }
      } catch (e) {}
    },
    [
      selectedLayerIds,
      mapl,
      hoverFeatures?.id,
      hoverFeatures?.layerId,
      layers,
      getLayerIndexById,
    ]
  );

  const toggleLayer = useCallback(
    async ({
      layerId,
      add,
      styleIndex = 0,
      focus = true,
    }) => {
      if (!add) {
        setSelectedLayerIds((prev) => prev.filter((_lyrId) => layerId !== _lyrId));
        return;
      }

      const layerIndex = getLayerIndexById(layerId);
      const targetLayer = layers[layerIndex];
      const sourceType = targetLayer?.source.type;

      if (sourceType === "grid") {
        setSelectedLayerIds((_slIds) => [
          layerId,
          ..._slIds.filter((lid) => lid !== layerId),
        ]);

        if (focus && targetLayer?.bbox) {
          setTimeout(() => {
            mapl?.fitBounds(targetLayer.bbox as any, {
              padding: 40,
              duration: 1000,
            });
          }, 100);
        }
      } else {
        await toggleVectorLayer(layerIndex, styleIndex, focus);
        setSelectedLayerIds((_slIds) => [
          layerId,
          ..._slIds.filter((lid) => lid !== layerId),
        ]);
      }
    },
    [getLayerIndexById, layers, mapl, toggleVectorLayer]
  );

  const clearAllLayers = useCallback(async () => setSelectedLayerIds([]), []);

  const updateMP = useCallback((key, value) => {
    setMP((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleLayerPublishing = useCallback(
    (layerId, layerStatus) => {
      const isActive = layerStatus === LAYER_STATUS.PENDING;

      axToggleLayerPublishing(
        mp.nakshaEndpointToken,
        mp.nakshaApiEndpoint,
        layerId,
        isActive
      );

      updateLayerById(layerId, {
        layerStatus: isActive ? LAYER_STATUS.ACTIVE : LAYER_STATUS.PENDING,
      });
    },
    [mp.nakshaEndpointToken, mp.nakshaApiEndpoint, updateLayerById]
  );

  const deleteLayer = useCallback(
    async (layerId, message) => {
      if (confirm(message)) {
        axDeleteLayer(mp.nakshaEndpointToken, mp.nakshaApiEndpoint, layerId);
        setLayers((prev) => prev.filter((l) => l.id !== layerId));
      }
    },
    [mp.nakshaEndpointToken, mp.nakshaApiEndpoint]
  );

  const zoomToExtent = useCallback(
    (layerId) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.bbox) {
        mapl?.fitBounds(layer.bbox as any, { padding: 40, duration: 1000 });
      }
    },
    [layers, mapl]
  );

  const getBBoxFromLngLat = useCallback(() => {
    if (!clickedLngLat) return [0, 0, 0, 0];
    return [
      clickedLngLat.lng,
      clickedLngLat.lat,
      clickedLngLat.lng + 0.1,
      clickedLngLat.lat + 0.1,
    ];
  }, [clickedLngLat]);

  const featuresAtLatLng = useCallback(
    (value?) => {
      if (!clickedLngLat || !mapl) return;

      try {
        const finalXY = mapl.project([clickedLngLat.lng, clickedLngLat.lat]);

        let queryFeat: any = mapl.queryRenderedFeatures(finalXY, {
          layers:
            selectionStyle === SELECTION_STYLE.TOP
              ? [selectedLayerIds[0]]
              : selectedLayerIds,
        });

        if ((value || selectionStyle) === SELECTION_STYLE.ALL) {
          const rasterLayerFeat = selectedLayers
            .filter((item) => item.layerType == "RASTER")
            .map((item) => ({
              sourceLayer: item.id,
              layerType: "raster",
              bbox: getBBoxFromLngLat(),
            }));
          queryFeat = [...queryFeat, ...rasterLayerFeat];
        }

        setSelectedFeatures(
          selectedLayers?.[0]?.layerType === "RASTER" &&
            selectionStyle !== SELECTION_STYLE.ALL
            ? selectedLayerIds.length && queryFeat?.length
              ? queryFeat
              : [
                  {
                    sourceLayer: selectedLayerIds[0],
                    layerType: "raster",
                    bbox: getBBoxFromLngLat(),
                  },
                ]
            : queryFeat
        );
      } catch (e) {
        console.error(e);
      }
    },
    [clickedLngLat, mapl, selectionStyle, selectedLayerIds, selectedLayers, getBBoxFromLngLat]
  );

  const handleSelectStyle = useCallback(
    (value: string) => {
      setSelectionStyle(value);
      if (value === SELECTION_STYLE.TOP) {
        featuresAtLatLng(value);
      }
    },
    [featuresAtLatLng]
  );

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (mp.onSelectedLayersChange) {
      mp.onSelectedLayersChange(selectedLayerIds);
    }
  }, [selectedLayerIds]);

  useEffect(() => {
    const timer = setTimeout(featuresAtLatLng, 300);
    return () => clearTimeout(timer);
  }, [clickedLngLat, selectionStyle, selectedLayerIds, featuresAtLatLng]);

  const layerContext = useMemo(
    () => ({
      mapStyle,
      featuresAtLatLng,
      setMapStyle,
      maxZoom,
      setMaxZoom,
      mapStyles: styles,
      all: layers,
      setAll: setLayers,
      selectedIds: selectedLayerIds,
      handleSelectStyle,
      setSelectedIds: setSelectedLayerIds,
      selectedLayers,
      clearAll: clearAllLayers,
      toggle: toggleLayer,
      updateStyle: updateLayerStyle,
      selectedFeatures,
      selectedFeaturesId,
      setSelectedFeatures,
      togglePublish: toggleLayerPublishing,
      delete: deleteLayer,
      selectionStyle,
      setSelectionStyle,
      zoomToExtent,
      gridLegends,
      setGridLegends,
    }),
    [
      mapStyle,
      featuresAtLatLng,
      maxZoom,
      styles,
      layers,
      selectedLayerIds,
      handleSelectStyle,
      selectedLayers,
      clearAllLayers,
      toggleLayer,
      updateLayerStyle,
      selectedFeatures,
      selectedFeaturesId,
      toggleLayerPublishing,
      deleteLayer,
      selectionStyle,
      zoomToExtent,
      gridLegends,
    ]
  );

  const queryContext = useMemo(
    () => ({
      term: queryTermDebounced,
      setTerm: setQueryTerm,
      clickedLngLat,
      setClickedLngLat,
    }),
    [queryTermDebounced, clickedLngLat]
  );

  const hoverContext = useMemo(
    () => ({
      onHover: onMapHover,
      features: hoverFeatures,
    }),
    [onMapHover, hoverFeatures]
  );

  const contextValue = useMemo(
    () => ({
      mp,
      updateMP,
      layer: layerContext,
      query: queryContext,
      isInfoBarOpen,
      setIsInfoBarOpen,
      hover: hoverContext,
    }),
    [mp, updateMP, layerContext, queryContext, isInfoBarOpen, hoverContext]
  );

  return (
    <LayersContext.Provider value={contextValue}>
      {children}
    </LayersContext.Provider>
  );
};

export default function useLayers() {
  return useContext(LayersContext);
}
