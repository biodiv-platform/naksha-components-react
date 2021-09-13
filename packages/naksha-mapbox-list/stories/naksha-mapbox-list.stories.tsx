import { Box } from "@chakra-ui/react";
import React from "react";
import axios from "redaxios";

import { defaultNakshaProps, NakshaMapboxList } from "../src";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Popup = (props) => {
  return (
    <Box maxH="250px" overflow="auto" fontSize="sm">
      <button onClick={() => alert("Clicked")}>Clicked</button>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HoverPopup = ({ feature }) => {
  return <div>{feature?.properties?.count} Observations</div>;
};

const handleOnDownload = async (layer) => {
  console.debug(layer);
  return { success: true, data: "xyz" };
};

const fetchGridData = async (geoProps) => {
  const params = {
    ...geoProps,
    view: "map",
    geoField: "location",
    taxon: 5275,
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

export const NakshaMapboxListStory = () => (
  <NakshaMapboxList
    viewPort={defaultNakshaProps.viewPort}
    loadToC={true}
    showToC={true}
    managePublishing={true}
    nakshaEndpointToken={process.env.STORYBOOK_NAKSHA_TOKEN || "ey.xyz"}
    mapboxApiAccessToken={process.env.STORYBOOK_MAPBOX_TOKEN || "pk.xyz"}
    nakshaApiEndpoint="http://localhost:8010/proxy/naksha-api/api"
    geoserver={{
      endpoint: "http://localhost:8010/proxy/geoserver",
      store: "naksha",
      workspace: "biodiv",
      onClick: handleOnGeoserverLayerClick,
    }}
    onLayerDownload={handleOnDownload}
    layers={[
      {
        id: "global-observations",
        title: "Global Observations",
        isAdded: true,
        source: { type: "grid", fetcher: fetchGridData },
        onClick: Popup,
        onHover: HoverPopup,
        data: {
          index: "extended_observation",
          type: "extended_records",
          geoField: "location",
        },
      },
    ]}
    // markers={object("Markers", [
    //   { latitude: 21, longitude: 77, colorHex: "E53E3E" }
    // ])}
  />
);

const meta = {
  title: "@ibp/naksha-mapbox-list",
  component: NakshaMapboxList,
};

export default meta;
