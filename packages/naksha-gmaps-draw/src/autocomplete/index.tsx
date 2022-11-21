import { GMAPS_AUTOCOMPLETE_FIELDS } from "@biodiv-platform/naksha-commons";
import { Autocomplete } from "@react-google-maps/api";
import React, { useState } from "react";

import { placeToGeoJsonFeature } from "../utils/geojson";

export default function NakshaAutocomplete({
  InputComponent,
  addFeature,
  gmapRegion,
}) {
  const [ac, setAc] = useState<any>();

  const onLoad = (autocomplete) => {
    setAc(autocomplete);
  };

  const onPlaceChanged = () => {
    const feature = placeToGeoJsonFeature(ac?.getPlace());
    addFeature(feature);
  };

  return (
    <Autocomplete
      onLoad={onLoad}
      fields={GMAPS_AUTOCOMPLETE_FIELDS}
      onPlaceChanged={onPlaceChanged}
      options={
        gmapRegion ? { componentRestrictions: { country: gmapRegion } } : {}
      }
      children={InputComponent}
    />
  );
}
