import React from "react";

import ClusterLayer from "./clusterLayer";
import InfoCard from "./infoCard";

const Cluster = ({ mapRef, hoveredMarker, hoveredMarkerData }) => {
  return (
    <>
      <ClusterLayer mapRef={mapRef} />

      {hoveredMarker?.properties?.id &&
        hoveredMarkerData[hoveredMarker?.properties?.id] && (
          <InfoCard
            coordinates={hoveredMarker?.lngLat}
            data={hoveredMarkerData[hoveredMarker?.properties?.id]}
          />
        )}
    </>
  );
};

export default Cluster;
