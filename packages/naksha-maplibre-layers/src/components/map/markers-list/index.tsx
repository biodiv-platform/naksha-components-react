import React, { useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";
import useLayers from "../../../hooks/use-layers";

const Marker1: any = Marker;

const MarkersList = () => {
  const { mp } = useLayers();

  const markersMemoized = useMemo(() => mp.markers, [mp.markers]);

  return (
    <>
      {markersMemoized?.map(
        ({ latitude, longitude, colorHex, anchor = "bottom", iconUrl }, index) => (
          <Marker1
            key={index}
            latitude={latitude}
            longitude={longitude}
            anchor={anchor}
            subpixelPositioning={true}
          >
            <img
              style={{
                cursor: "pointer",
                display: "block",
                width: "25px",
                height: "41px",
              }}
              width={25}
              height={41}
              alt="Marker"
              src={
                iconUrl ||
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
              }
            />
          </Marker1>
        )
      )}
    </>
  );
};

export default MarkersList;
