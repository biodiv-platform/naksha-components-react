import { defaultViewPort } from "@ibp/naksha-commons";
import React from "react";

import { NakshaMapboxDraw } from "../src";

const onFeaturesChange = (features) => {
  console.log("features", features);
};

export const ExampleStory = () => (
  <NakshaMapboxDraw
    defaultViewPort={defaultViewPort}
    mapboxApiAccessToken={process.env.STORYBOOK_MAPBOX_TOKEN || "pk.xyz"}
    defaultFeatures={[]}
    onFeaturesChange={onFeaturesChange}
    isControlled={true}
    isReadOnly={false}
    isMultiple={false}
  />
);

const meta = {
  title: "@ibp/naksha-mapbox-draw",
  component: NakshaMapboxDraw,
};

export default meta;
