import { defaultMapStyles, useDebounce } from "@ibp/naksha-commons";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMap } from "react-map-gl";

import { GeoserverLayer, NakshaMapboxListProps } from "../interfaces";
import { axDeleteLayer, axToggleLayerPublishing } from "../services/naksha";
import {
  LAYER_STATUS,
  PROPERTY_ID,
  SELECTION_STYLE,
} from "../static/constants";
import { getLayerStyle } from "../utils/naksha";

declare const confirm;

interface LayersContextProps {
  mp: NakshaMapboxListProps;
  updateMP;
  layer: {
    mapStyle?;
    setMapStyle;
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
  mp: NakshaMapboxListProps;
  children;
}

const LayersContext = createContext<LayersContextProps>(
  {} as LayersContextProps
);

export const LayersProvider = ({ mp: _mp, children }: LayersProviderProps) => {
  const [mp, setMP] = useState<NakshaMapboxListProps>(_mp);
  const { mapl } = useMap();

  const [queryTerm, setQueryTerm] = useState("");
  const queryTermDebounced = useDebounce(queryTerm, 500);

  const [mapStyle, setMapStyle] = useState(
    defaultMapStyles[mp?.mapStyle || 0].style
  );
  const [selectionStyle, setSelectionStyle] = useState(SELECTION_STYLE.TOP);
  const [gridLegends, setGridLegends] = useState({});
  const [clickedLngLat, setClickedLngLat] = useState<any>();

  const [layers, setLayers] = useState<GeoserverLayer[]>(_mp.layers || []);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>(
    mp.selectedLayers || []
  );

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

  const getLayerIndexById = (layerId) => {
    return layers.findIndex((layer) => layer.id === layerId);
  };

  const updateLayerById = (layerId, updatedLayer) => {
    setLayers((_layers) =>
      _layers.map((l) => (l.id === layerId ? { ...l, ...updatedLayer } : l))
    );
  };

  const toggleVectorLayer = async (layerIndex, styleIndex, focus) => {
    const layer = layers[layerIndex];
    const layerData = await getLayerStyle(
      layer,
      styleIndex,
      mp.nakshaApiEndpoint,
      mp.geoserver
    );
    updateLayerById(layer.id, { data: layerData });
    focus &&
      mapl?.fitBounds(layer.bbox as any, { padding: 40, duration: 1000 });
  };

  const updateLayerStyle = async (layerId, styleIndex) => {
    const layerIndex = getLayerIndexById(layerId);
    toggleVectorLayer(layerIndex, styleIndex, false);
  };

  const onMapHover = async (e) => {
    if (!selectedLayerIds.length || !mapl) return; // if no layer is selected popup is unncessary

    try {
      const lastLayerId = selectedLayerIds[0];

      const feats = mapl.queryRenderedFeatures(e.point, {
        layers: [lastLayerId],
      });

      if (feats.length) {
        const fId = feats[0]?.id || feats[0]?.properties?.[PROPERTY_ID];

        // If same feature as earlier don't recompute properties
        if (fId === hoverFeatures?.id) return;

        const layer = layers[getLayerIndexById(lastLayerId)];

        const hoverProperties = layer?.data?.summaryColumn.map((sc) => [
          layer.data?.propertyMap?.[sc] || sc,
          feats[0].properties?.[sc],
        ]);

        setHoverFeatures({
          id: fId,
          title: layer.title,
          data: hoverProperties,
        });
      } else {
        setHoverFeatures(undefined);
      }
    } catch (e) { }
  };

  const toggleLayer = async ({
    layerId,
    add,
    styleIndex = 0,
    focus = true,
  }) => {
    if (!add) {
      setSelectedLayerIds(
        selectedLayerIds.filter((_lyrId) => layerId !== _lyrId)
      );
      return;
    }

    const layerIndex = getLayerIndexById(layerId);
    const sourceType = layers[layerIndex]?.source.type;
    await toggleVectorLayer(layerIndex, styleIndex, focus);
    setSelectedLayerIds((_slIds) => [
      layerId,
      ..._slIds.filter((lid) => lid !== layerId),
    ]);
  };

  const clearAllLayers = async () => setSelectedLayerIds([]);

  const updateMP = (key, value) => {
    setMP({ ...mp, [key]: value });
  };

  const toggleLayerPublishing = (layerId, layerStatus) => {
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
  };

  const deleteLayer = async (layerId, message) => {
    if (confirm(message)) {
      axDeleteLayer(mp.nakshaEndpointToken, mp.nakshaApiEndpoint, layerId);
      setLayers(layers.filter((l) => l.id !== layerId));
    }
  };

  const zoomToExtent = (layerId) => {
    const layerIndex = getLayerIndexById(layerId);
    const layer = layers[layerIndex];
    mapl?.fitBounds(layer.bbox as any, { padding: 40, duration: 1000 });
  };

  const getBBoxFromLngLat = () => {
    return [clickedLngLat.lng, clickedLngLat.lat, clickedLngLat.lng + 0.1, clickedLngLat.lat + 0.1];
  }
  const featuresAtLatLng = () => {
    if (!clickedLngLat) return;

    try {
      const finalXY = mapl?.project([clickedLngLat.lng, clickedLngLat.lat]);

      const queryFeat = mapl?.queryRenderedFeatures(finalXY, {
        layers:
          selectionStyle === SELECTION_STYLE.TOP
            ? [selectedLayerIds[0]]
            : selectedLayerIds,
      });

      setSelectedFeatures
      (queryFeat && queryFeat?.length <= 0 ?
         [{sourceLayer:selectedLayerIds[0],layerType:'raster',bbox:getBBoxFromLngLat()}] : queryFeat);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (mp.onSelectedLayersChange) {
      mp.onSelectedLayersChange(selectedLayerIds);
    }
  }, [selectedLayerIds]);

  useEffect(() => {
    // we have no sureway to know that all layers are loaded
    // this will wait for 300ms for layer to be loaded
    // if it takes more then 300 selection will be discarded
    setTimeout(featuresAtLatLng, 300);
  }, [clickedLngLat, selectionStyle, selectedLayerIds]);

  return (
    <LayersContext.Provider
      value={{
        mp,
        updateMP,
        layer: {
          mapStyle,
          setMapStyle,
          all: layers,
          setAll: setLayers,
          selectedIds: selectedLayerIds,
          setSelectedIds: setSelectedLayerIds,
          selectedLayers: selectedLayers,
          clearAll: clearAllLayers,
          toggle: toggleLayer,
          updateStyle: updateLayerStyle,
          selectedFeatures,
          selectedFeaturesId,
          setSelectedFeatures,
          togglePublish: toggleLayerPublishing,
          delete: deleteLayer,
          selectionStyle: selectionStyle,
          setSelectionStyle: setSelectionStyle,

          zoomToExtent,

          gridLegends,
          setGridLegends,
        },
        query: {
          term: queryTermDebounced,
          setTerm: setQueryTerm,
          clickedLngLat,
          setClickedLngLat,
        },
        hover: {
          onHover: onMapHover,
          features: hoverFeatures,
        },
      }}
    >
      {children}
    </LayersContext.Provider>
  );
};

export default function useLayers() {
  return useContext(LayersContext);
}
