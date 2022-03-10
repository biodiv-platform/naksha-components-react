import MapboxDraw from "@mapbox/mapbox-gl-draw";
import React, { useEffect, useState } from "react";
import { emit, useListener } from "react-gbus";
import { useControl } from "react-map-gl";

import DeletePanel from "./delete-panel";

interface DrawControlProps {
  data?;
  onDataChange?;
  isControlled?: boolean;
  isMultiple?: boolean;
  autoFocus;
}

const UPDATE_EVENT = "rmsc-draw-updated";

export default function DrawControl(props: DrawControlProps) {
  const [features, setFeatures] = useState<any[]>(props.data?.features || []);

  useListener(onUpdate, [UPDATE_EVENT]);

  function onUpdate(e) {
    const _newFeatures = [...features, ...e.features];
    const _features = props.isMultiple
      ? _newFeatures
      : [_newFeatures[_newFeatures.length - 1]];

    setFeatures(_features);

    draw.deleteAll();
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

  const onDelete = () => setFeatures([]);

  useEffect(() => {
    props.onDataChange &&
      props.onDataChange({ type: "FeatureCollection", features });
  }, [features]);

  useEffect(() => {
    if (
      props.isControlled &&
      JSON.stringify(features) !== JSON.stringify(props.data?.features)
    ) {
      setFeatures(props.data?.features || []);
    }
  }, [props.data]);

  return <DeletePanel onDelete={onDelete} />;
}
