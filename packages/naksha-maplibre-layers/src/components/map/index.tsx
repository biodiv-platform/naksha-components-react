import { defaultViewState } from "@biodiv-platform/naksha-commons";
import React, { useEffect, useMemo, useState } from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
} from "react-map-gl/maplibre";
import { config } from "maplibre-gl";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import InfoBar from "../infobar";
import Sidebar from "../sidebar";
import { initMaplibreWorker } from "../../utils/setup-maplibre";
import { MapLayer } from "./layers";
import MarkersList from "./markers-list";
import HoverPopup from "./popup";

const NavControl: any = NavigationControl;

export default function Map() {
  const { mp, layer, hover, query } = useLayers();

  const [workerUrl, setWorkerUrl] = useState<string | undefined>(
    mp.workerUrl ||
      (typeof window !== "undefined"
        ? config.WORKER_URL || "/maplibre-gl-worker.mjs"
        : undefined)
  );

  useEffect(() => {
    initMaplibreWorker(mp.workerUrl).then(setWorkerUrl);
  }, [mp.workerUrl]);

  const viewState = useMemo(
    () => mp.defaultViewState || defaultViewState,
    [mp.defaultViewState]
  );

  const onMapClick = React.useCallback(
    (e) => query.setClickedLngLat(e.lngLat),
    [query]
  );

  const rafRef = React.useRef<number | null>(null);

  const handleOnMouseMove = React.useCallback(
    (event) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        hover.onHover(event);
      });
    },
    [hover]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className={tw`h-full w-full relative bg-gray-100`}>
      {mp.loadToC && <Sidebar />}
      {layer.selectedFeatures?.length > 0 && <InfoBar />}
      <MapGL
        id="mapl"
        workerUrl={workerUrl}
        cursor="default"
        initialViewState={viewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={layer.mapStyle}
        maxZoom={layer.maxZoom}
        onClick={onMapClick}
        onMouseMove={handleOnMouseMove}
      >
        <NavControl
          position="bottom-right"
          showZoom={true}
          showCompass={true}
        />

        {mp.showFullscreenControl && (
          <FullscreenControl position="bottom-right" />
        )}
        <MarkersList />
        {layer.selectedLayers.map((_l, index) => {
          const beforeId = index > 0 ? layer.selectedIds[index - 1] : undefined;

          return <MapLayer key={_l.id} layer={_l} beforeId={beforeId} />;
        })}

        <HoverPopup key="popup" />
      </MapGL>
    </div>
  );
}
