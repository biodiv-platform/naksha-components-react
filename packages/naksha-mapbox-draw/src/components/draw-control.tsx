import MapboxDraw from "@mapbox/mapbox-gl-draw";
import React, { useEffect, useState } from "react";
import { emit, useListener } from "react-gbus";
import { useControl } from "react-map-gl";

import DeletePanel from "./delete-panel";

interface DrawControlProps {
  features?;
  setFeatures?;
  isControlled?: boolean;
  isMultiple?: boolean;
}

const UPDATE_EVENT = "rmsc-draw-updated";

export default function DrawControl(props: DrawControlProps) {
  useListener(onUpdate, [UPDATE_EVENT]);

  function onUpdate(e) {
    const _newFeatures = [...props.features, ...e.features];
    const _features = props.isMultiple
      ? _newFeatures
      : [_newFeatures[_newFeatures.length - 1]];

    draw.deleteAll();
    props.setFeatures(_features);
  }

  const draw = useControl(
    ({ map }) => {
      map.on("draw.create", (e) => emit(UPDATE_EVENT, e));
      map.on("draw.update", (e) => emit(UPDATE_EVENT, e));
      return new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          line_string: true,
          point: true,
        },
      });
    },
    () => {},
    { position: "top-left" }
  );

  const onDelete = () => props.setFeatures([]);

  return <DeletePanel onDelete={onDelete} />;
}
