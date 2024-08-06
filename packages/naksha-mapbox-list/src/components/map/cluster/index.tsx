import React from "react";
import { Source, Layer } from "react-map-gl";

const ClusterLayer = ({ data }) => {
  return (
    <Source
      id="points"
      type="geojson"
      data={data}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
    >
      <Layer
        id="clusters"
        type="circle"
        source="points"
        filter={["has", "point_count"]}
        paint={{
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#008cff",
            50,
            "#ffbf00",
            100,
            "#ff0000",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
        }}
      />
      <Layer
        id="cluster-count"
        type="symbol"
        source="points"
        filter={["has", "point_count"]}
        layout={{
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        }}
      />
      <Layer
        id="unclustered-point"
        type="circle"
        source="points"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-color": "red",
          "circle-radius": 10,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        }}
      />
    </Source>
  );
};

export default ClusterLayer;
