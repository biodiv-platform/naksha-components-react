import { defaultViewState } from "@biodiv-platform/naksha-commons";
import React, { useEffect, useMemo, useState } from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  Popup,
  ScaleControl,
} from "react-map-gl/maplibre";
import { config } from "maplibre-gl";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import { getFeatureBBox } from "../../utils/grid";
import InfoBar from "../infobar";
import Sidebar from "../sidebar";
import { initMaplibreWorker } from "../../utils/setup-maplibre";
import { MapLayer } from "./layers";
import MarkersList from "./markers-list";
import HoverPopup from "./popup";
import ResetViewControl from "./reset-view-control";

const NavControl: any = NavigationControl;

/** How long the attribution stays open before folding behind its (i) button */
const ATTRIBUTION_VISIBLE_MS = 5000;
const Pop: any = Popup;

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

  // popup pinned by clicking a feature of a layer that has `onClick`
  const [clickPopup, setClickPopup] = useState<any>();

  useEffect(() => setClickPopup(undefined), [layer.selectedIds.join(",")]);

  const onMapClick = React.useCallback(
    (e) => {
      const topLayer = layer.selectedLayers[0];

      if (!topLayer?.onClick) {
        query.setClickedLngLat(e.lngLat);
        return;
      }

      const feature = e.target.queryRenderedFeatures(e.point, {
        layers: [topLayer.id],
      })[0];
      setClickPopup(
        feature && {
          lngLat: e.lngLat,
          content: topLayer.onClick({
            bbox: getFeatureBBox(feature),
            feature,
            layerId: topLayer.id,
          }),
        }
      );
    },
    [layer.selectedLayers, query]
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

  // MapLibre opens its compact attribution once the map's credits are known (sometimes only after
  // a slow source has loaded) and folds it on the first drag. Also fold it ATTRIBUTION_VISIBLE_MS
  // after it has opened, unless the user has used the (i) button: the credit is seen first, then
  // tucked away, as the OSM attribution guidelines allow.
  const foldRef = React.useRef<{
    timer?: ReturnType<typeof setTimeout>;
    observer?: MutationObserver;
  }>({});

  const onMapLoad = React.useCallback(
    (e) => {
      if (!mp.collapseAttribution) return;

      const attribution = e.target
        .getContainer()
        .querySelector(".maplibregl-ctrl-attrib");
      if (!attribution) return;

      let userToggled = false;
      // capture runs before MapLibre's own click handler toggles the attribution
      attribution
        .querySelector(".maplibregl-ctrl-attrib-button")
        ?.addEventListener(
          "click",
          () => {
            userToggled = true;
          },
          { capture: true, once: true }
        );

      const isOpen = () =>
        attribution.classList.contains("maplibregl-compact-show");
      const foldLater = () => {
        foldRef.current.timer = setTimeout(() => {
          if (!userToggled)
            attribution.classList.remove("maplibregl-compact-show");
        }, ATTRIBUTION_VISIBLE_MS);
      };

      if (isOpen()) {
        foldLater();
        return;
      }
      // not open yet: wait for MapLibre to open it. The observer only reads, then stops.
      const observer = new MutationObserver(() => {
        if (!isOpen()) return;
        observer.disconnect();
        foldLater();
      });
      observer.observe(attribution, {
        attributes: true,
        attributeFilter: ["class"],
      });
      foldRef.current.observer = observer;
    },
    [mp.collapseAttribution]
  );

  useEffect(
    () => () => {
      const { timer } = foldRef.current;
      if (timer) clearTimeout(timer);
      foldRef.current.observer?.disconnect();
    },
    []
  );

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
        attributionControl={
          mp.collapseAttribution ? { compact: true } : undefined
        }
        onLoad={onMapLoad}
      >
        {/* bottom controls stack upwards, so the first added sits lowest */}
        {mp.showScaleControl && <ScaleControl position="bottom-right" />}
        {mp.showResetControl && (
          <ResetViewControl viewState={viewState} position="bottom-right" />
        )}
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

        {clickPopup ? (
          <Pop
            latitude={clickPopup.lngLat.lat}
            longitude={clickPopup.lngLat.lng}
            closeOnClick={false}
            onClose={() => setClickPopup(undefined)}
            maxWidth="320px"
          >
            {clickPopup.content}
          </Pop>
        ) : (
          <HoverPopup key="popup" />
        )}
      </MapGL>
    </div>
  );
}
