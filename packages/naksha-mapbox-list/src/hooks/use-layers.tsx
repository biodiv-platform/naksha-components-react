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
    toggle;
    updateStyle;
    selectedFeatures;
    selectedFeaturesId;
    setSelectedFeatures;
    togglePublish;
    delete;
    selectionStyle;
    setSelectionStyle;
  };
  query: {
    term: string;
    setTerm;
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

  useEffect(() => {
    if (mp.onSelectedLayersChange) {
      mp.onSelectedLayersChange(selectedLayerIds);
    }
  }, [selectedLayerIds]);

  const getLayerIndexById = (layerId) => {
    return layers.findIndex((layer) => layer.id === layerId);
  };

  const updateLayerById = (layerId, updatedLayer) => {
    return setLayers(
      layers.map((l) => (l.id === layerId ? { ...l, ...updatedLayer } : l))
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
    focus && mapl.fitBounds(layer.bbox as any, { padding: 40, duration: 1000 });
  };

  const updateLayerStyle = async (layerId, styleIndex) => {
    const layerIndex = getLayerIndexById(layerId);
    toggleVectorLayer(layerIndex, styleIndex, false);
  };

  const onMapHover = async (e) => {
    if (!selectedLayerIds.length) return; // if no layer is selected popup is unncessary

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

    if (sourceType === "vector") {
      await toggleVectorLayer(layerIndex, styleIndex, focus);
    } else {
      console.error(`unknown layer type: ${sourceType}`);
    }

    setSelectedLayerIds((_slIds) => [
      layerId,
      ..._slIds.filter((lid) => lid !== layerId),
    ]);
  };

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
          toggle: toggleLayer,
          updateStyle: updateLayerStyle,
          selectedFeatures,
          selectedFeaturesId,
          setSelectedFeatures,
          togglePublish: toggleLayerPublishing,
          delete: deleteLayer,
          selectionStyle: selectionStyle,
          setSelectionStyle: setSelectionStyle,
        },
        query: {
          term: queryTermDebounced,
          setTerm: setQueryTerm,
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
