import "maplibre-gl/dist/maplibre-gl.css";

import { NakshaMaplibreLayers } from "@biodiv-platform/naksha-maplibre-layers";

import axios from "axios";
import React from "react";
import { tw } from "twind";

const Popup = (props) => {
  return (
    <div className={tw`max-w-[250px] overflow-auto`}>
      <button onClick={() => alert("Clicked")}>Clicked</button>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
};

const HoverPopup = ({ feature }) => (
  <div key={feature?.properties?.count}>
    {feature?.properties?.count} Observations
  </div>
);

const mapCenter = {
  latitude: 20.7,
  longitude: 79.05,
  bearing: 0,
  pitch: 0,
  zoom: 3.5,
};

const fetchGridData = async (geoProps) => {
  const params = {
    ...geoProps,
    view: "map",
    geoField: "location",
    userGroupList: 14,

    // taxon: 5275,
  };

  const response = await axios.post(
    `http://localhost:8010/proxy/observation-api/api/v1/observation/list/extended_observation/_doc`,
    {},
    { params }
  );
  console.info(
    "Geohash Aggregation Response:",
    response.data.geohashAggregation
  );
  return response.data.geohashAggregation;
};

const handleOnGeoserverLayerClick = (feat) => {
  console.debug("gs_clicked!", feat);
};

const mapStyles = [
  {
    text: "OSM",
    key: "0",
    style:
      "https://unpkg.com/maplibre-gl-styles@0.0.1/styles/osm-mapnik/v8/india.json",
  },
  {
    text: "Satellite",
    key: "1",
    style:
      "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json",
    maxZoom: 15.9,
  },
];

const onObservationGridHover = ({ feature }) => (
  <div>{feature?.properties?.count} Observations</div>
);

export default function NakshaMaplibreListPage() {
  return (
    <div className={tw`h-[100vh] w-[100vw]`}>
      <NakshaMaplibreLayers
        defaultViewState={mapCenter}
        loadToC={true}
        showToC={true}
        managePublishing={true}
        nakshaApiEndpoint="http://localhost:8010/proxy/nakshaIntegrator-api/api"
        // nakshaEndpointToken={process.env.NEXT_PUBLIC_NAKSHA_TOKEN}
        geoserver={{
          endpoint: "http://localhost:8010/proxy/geoserver",
          store: "ibp",
          workspace: "biodiv",
        }}
        mapStyles={mapStyles}
        onLayerDownload={console.log}
        canLayerShare={true}
        selectedLayers={["global-observations"]}
        markers={[
          {
            latitude: 23.241346,
            longitude: 78.046875,
            colorHex: "07BEF1",
          },
        ]}
        layers={[
          {
            id: "global-observations",
            title: "Observations",
            description: "All observations from this portal",
            attribution: "Portal and Contributors",
            tags: ["Global", "Observations"],
            source: { type: "grid", fetcher: fetchGridData },
            onHover: onObservationGridHover,
            data: {
              index: "extended_observation",
              type: "extended_records",
              geoField: "location",
              summaryColumn: ["count"],
              propertyMap: { count: "Count" },
            },
            zoomToFit: true,
          },
        ]}
      />
    </div>
  );
}
