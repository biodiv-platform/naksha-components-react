import { TranslationProvider } from "@ibp/naksha-commons";
import React from "react";
import { MapProvider } from "react-map-gl";
import { setup } from "twind";

import localeStrings from "../locales";
import Map from "./components/map";
import { LayersProvider } from "./hooks/use-layers";
import { NakshaMapboxListProps } from "./interfaces";
import { defaultNakshaProps } from "./static/constants";

setup({ preflight: false });

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
