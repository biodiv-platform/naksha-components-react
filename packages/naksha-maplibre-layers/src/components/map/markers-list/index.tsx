import React, { useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";
import useLayers from "../../../hooks/use-layers";

const Marker1: any = Marker;

const MarkersList = () => {
  const { mp } = useLayers();

  const markersMemoized = useMemo(() => mp.markers, [mp.markers]);

  return (
    <>
      {markersMemoized?.map(({ latitude, longitude, colorHex }, index) => (
        <Marker1 key={index} latitude={latitude} longitude={longitude}>
          <img
            style={{ cursor: "pointer" }}
            alt="Marker"
            src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
          />
        </Marker1>
      ))}
    </>
  );
};

export default MarkersList;
