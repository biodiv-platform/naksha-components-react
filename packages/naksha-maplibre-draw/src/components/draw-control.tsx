import React from "react";
import { emit, useListener } from "react-gbus";
import { useControl } from "react-map-gl/maplibre";

import DeletePanel from "./delete-panel";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";

interface DrawControlProps {
  features?: any[];
  setFeatures?: (f: any[]) => void;
  isControlled?: boolean;
  isMultiple?: boolean;
}

const UPDATE_EVENT = "rmsc-draw-updated";

export default function DrawControl(props: DrawControlProps) {
  useListener(onUpdate, [UPDATE_EVENT]);

  function onUpdate(e: any) {
    if (!terradrawControl) return;

    const allFeatures = terradrawControl.getFeatures().features;

    const _features = props.isMultiple
      ? allFeatures
      : [allFeatures[allFeatures.length - 1]];

    props.setFeatures?.(_features);
  }

  const terradrawControl = useControl(
    ({ map }) => {
      const ctrl = new MaplibreTerradrawControl({
        modes: ["point", "linestring", "polygon"],
        open: true,
      });

      map.on("terradraw.create", (e) => {
        // Clear previous if only single feature allowed
        if (!props.isMultiple) {
          (ctrl as any).terradraw.clear();
        }
        // Switch to select mode to disable drawing after creation
        ctrl.getTerraDrawInstance().setMode("select");
        emit(UPDATE_EVENT, e);
      });

      map.on("terradraw.update", (e) => emit(UPDATE_EVENT, e));
      map.on("terradraw.delete", (e) => emit(UPDATE_EVENT, e));

      return ctrl;
    },
    () => {},
    { position: "top-left" }
  );

  const onDelete = () => {
    (terradrawControl as any).terradraw.clear();
    props.setFeatures?.([]);
  };

  return <DeletePanel onDelete={onDelete} />;
}
