import React, { useMemo } from "react";
import { Marker } from "react-map-gl";
import useLayers from "../../../hooks/use-layers";

const Marker1: any = Marker;

const MarkersList = () => {
  const { mp } = useLayers();

  const markersMemoized = useMemo(() => mp.markers, [mp.markers]);

  return (
    <>
      {markersMemoized?.map(({ latitude, longitude, colorHex }, index) => (
        <Marker1
          key={index}
          latitude={latitude}
          longitude={longitude}
          offset={[-35, -15]}
        >
          <img
            style={{ cursor: "pointer" }}
            alt="Marker"
            src={`https://a.tiles.mapbox.com/v4/marker/pin-m+${colorHex}.png?access_token=${mp.mapboxAccessToken}`}
          />
        </Marker1>
      ))}
    </>
  );
};

export default MarkersList;
