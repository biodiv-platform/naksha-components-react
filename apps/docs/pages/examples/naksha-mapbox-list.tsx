import "mapbox-gl/dist/mapbox-gl.css";

import { NakshaMapboxList } from "@ibp/naksha-mapbox-list";
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

const fetchGridData = async (geoProps) => {
  const params = {
    ...geoProps,
    view: "map",
    geoField: "location",
    // taxon: 5275,
  };

  const response = await axios.post(
    `http://localhost:8010/proxy/observation-api/api/v1/observation/list/extended_observation/_doc`,
    {},
    { params }
  );
  return response.data.geohashAggregation;
};

const handleOnGeoserverLayerClick = (feat) => {
  console.debug("gs_clicked!", feat);
};

export default function NakshaMapboxListPage() {
  return (
    <div className={tw`h-[100vh] w-[100vw]`}>
      <NakshaMapboxList
        loadToC={true}
        showToC={true}
        managePublishing={true}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        nakshaApiEndpoint="http://localhost:8010/proxy/naksha-api/api"
        nakshaEndpointToken={process.env.NEXT_PUBLIC_NAKSHA_TOKEN}
        geoserver={{
          endpoint: "http://localhost:8010/proxy/geoserver",
          store: "naksha",
          workspace: "biodiv",
        }}
        onLayerDownload={console.log}
        canLayerShare={true}
        // selectedLayers={[
        //   "global-observations",
        //   "lyr_3_agar_soil",
        //   "lyr_1_agar_geology",
        // ]}
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
            title: "Global Observations",
            source: { type: "grid", fetcher: fetchGridData },
            onClick: Popup,
            onHover: HoverPopup,
            data: {
              index: "extended_observation",
              type: "extended_records",
              geoField: "location",
              summaryColumn: ["count"],
              propertyMap: { count: "Count" },
            },
          },
        ]}
      />
    </div>
  );
}
