import React from "react";

import { LayersProvider } from "./hooks/use-layers";
import { ExtendedMarkerProps, NakshaMapboxListProps } from "./interfaces";
import Map from "./map";
import { defaultNakshaProps } from "./static/constants";

function NakshaMapboxList(props: NakshaMapboxListProps) {
  return (
    <LayersProvider {...defaultNakshaProps} {...props}>
      <Map />
    </LayersProvider>
  );
}

export type { ExtendedMarkerProps };
export { defaultNakshaProps, NakshaMapboxList };
