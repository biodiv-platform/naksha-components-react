import { defaultViewState } from "@biodiv-platform/naksha-commons";
import React, { useMemo, useState } from "react";
import MapGL, { NavigationControl } from "react-map-gl";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import InfoBar from "../infobar";
import Sidebar from "../sidebar";
import { MapLayer } from "./layers";
import MarkersList from "./markers-list";
import HoverPopup from "./popup";

const NavControl: any = NavigationControl;

export default function Map() {
  const { mp, layer, hover, query } = useLayers();

  const [coordinates, setCoordinates] = useState<any>();
  const viewState = useMemo(
    () => mp.defaultViewState || defaultViewState,
    [mp.defaultViewState]
  );

  const onMapClick = (e) => query.setClickedLngLat(e.lngLat);

  const handleOnMouseMove = (event) => {
    setCoordinates(event.lngLat);
    hover.onHover(event);
  };

  return (
    <div className={tw`h-full w-full relative bg-gray-100`}>
      {mp.loadToC && <Sidebar />}
      {layer.selectedFeatures?.length > 0 && <InfoBar />}
      <MapGL
        id="mapl"
        cursor="default"
        initialViewState={viewState}
        mapboxAccessToken={mp.mapboxAccessToken}
        style={{ width: "100%", height: "100%" }}
        mapStyle={layer.mapStyle}
        onClick={onMapClick}
        onMouseMove={handleOnMouseMove}
      >
        <NavControl
          position="bottom-right"
          showZoom={true}
          showCompass={true}
        />
        <MarkersList />
        {layer.selectedLayers.map((_l, index) => {
          const beforeId = index > 0 ? layer.selectedIds[index - 1] : undefined;

          return <MapLayer key={_l.id} layer={_l} beforeId={beforeId} />;
        })}

        <HoverPopup key="popup" coordinates={coordinates} />
      </MapGL>
    </div>
  );
}
