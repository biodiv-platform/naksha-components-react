import { TranslationProvider } from "@ibp/naksha-commons";
import React from "react";
import { MapProvider } from "react-map-gl";

import localeStrings from "../locales";
import Map from "./components/map";
import { LayersProvider } from "./hooks/use-layers";
import { NakshaMapboxListProps } from "./interfaces";
import { defaultNakshaProps } from "./static/constants";

export const NakshaMapboxList = (props: NakshaMapboxListProps) => {
  const mp = React.useMemo(
    () => ({ ...defaultNakshaProps, ...props }),
    [props]
  );

  return (
    <MapProvider>
      <TranslationProvider localeStrings={localeStrings} lang={mp.lang}>
        <LayersProvider mp={mp}>
          <Map />
        </LayersProvider>
      </TranslationProvider>
    </MapProvider>
  );
};
