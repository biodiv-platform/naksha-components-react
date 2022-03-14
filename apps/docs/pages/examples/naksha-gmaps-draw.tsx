import { NakshaGmapsDraw } from "@ibp/naksha-gmaps-draw";
import React from "react";

export default function NakshaGmapsDrawPage() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <NakshaGmapsDraw
        isAutocomplete={true}
        isMultiple={true}
        isImport={true}
        gmapAccessToken={process.env.STORYBOOK_GMAP_TOKEN}
        // Restricts autocomplete + customization searches to India
        gmapRegion="IN"
      />
    </div>
  );
}
