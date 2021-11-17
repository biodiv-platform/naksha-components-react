import React from "react";

import { NakshaGmapsDraw } from "../src";

export const NakshaGmapsDrawStory = () => (
  <div style={{ height: "100vh", width: "100vw" }}>
    <NakshaGmapsDraw
      isAutocomplete={true}
      isMultiple={true}
      isImport={true}
      gmapApiAccessToken={process.env.STORYBOOK_GMAP_TOKEN}
      // Restricts autocomplete + customization searches to India
      gmapRegion="IN"
    />
  </div>
);

const meta = {
  title: "@ibp/naksha-gmaps-draw",
  component: NakshaGmapsDrawStory,
};

export default meta;
