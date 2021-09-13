import { Box } from "@chakra-ui/react";
import { defaultMapStyles, updateWorldViewRef } from "@ibp/naksha-commons";
import React, { useEffect, useState } from "react";
import { emit, useListener } from "react-gbus";
import MapGL from "react-map-gl";

import useDebounce from "../hooks/use-debounce";
import useLayerManager from "../hooks/use-layer-manager";
import { useLayers } from "../hooks/use-layers";
import InfoBar from "./infobar";
import Legend from "./legend";
import MarkersList from "./markers-list";
import Navigation from "./navigation";
import Popup from "./popup";
import Sidebar from "./sidebar";

export default function Map() {
  const {
    mapRef,
    loadToC,
    mapboxApiAccessToken,
    viewPort,
    setViewPort,
    baseLayer,
    layers,
    infobarData,
    clickPopup,
    setClickPopup,
    hoverPopup,
    setHoverPopup,
  } = useLayers();

  const { reloadLayers, onMapClick, onMapHover, renderHLData } =
    useLayerManager();

  const [isReady, setIsReady] = useState<boolean>();
  const debouncedViewPort = useDebounce(viewPort, 500);

  useListener(() => setIsReady(true), ["STYLE_UPDATED"]);

  const onLoad = () => {
    // Will be called once on initial load
    // Note: there's chance that style is loaded on `style.loaded` but not ready to apply admin boundries
    mapRef?.current.getMap().once("idle", () => {
      updateWorldViewRef(mapRef);
      emit("STYLE_UPDATED");
    });

    // Will be called on everytime map reloads / style updates
    mapRef?.current.getMap().on("style.load", () => {
      updateWorldViewRef(mapRef);
      emit("STYLE_UPDATED");
    });
  };

  useEffect(() => {
    isReady && reloadLayers();
  }, [layers?.length, isReady]);

  useEffect(() => {
    isReady && reloadLayers(true);
  }, [debouncedViewPort]);

  useEffect(() => {
    renderHLData();
  }, [infobarData]);

  return (
    <Box boxSize="100%" position="relative">
      <MapGL
        {...viewPort}
        width="100%"
        height="100%"
        mapStyle={baseLayer && defaultMapStyles[baseLayer].style}
        onLoad={onLoad}
        ref={mapRef}
        getCursor={() => "default"}
        onViewportChange={setViewPort}
        mapboxApiAccessToken={mapboxApiAccessToken}
        onClick={onMapClick}
        onHover={onMapHover}
      >
        <Navigation onViewportChange={setViewPort} />
        <Legend />
        {clickPopup && <Popup data={clickPopup} set={setClickPopup} />}
        {!clickPopup && hoverPopup && (
          <Popup data={hoverPopup} set={setHoverPopup} closeButton={false} />
        )}
        <MarkersList />
      </MapGL>
      {loadToC && <Sidebar />}
      {infobarData?.length && <InfoBar key={infobarData[0]?.layer?.id} />}
    </Box>
  );
}
