import clsx from "clsx";
import React from "react";
import { Popup } from "react-map-gl/maplibre";
import { tw } from "twind";

import useLayers from "../../../hooks/use-layers";

const Pop: any = Popup;

export default function HoverPopup({ coordinates }) {
  const { hover } = useLayers();

  if (!coordinates?.lat || !hover.features) return null;

  // a layer's own content (onHover) replaces the property table
  if (hover.features.content) {
    return (
      <Pop
        latitude={coordinates.lat}
        longitude={coordinates.lng}
        closeButton={false}
        maxWidth="320px"
      >
        {hover.features.content}
      </Pop>
    );
  }

  return (
    <Pop
      latitude={coordinates.lat}
      longitude={coordinates.lng}
      closeButton={false}
    >
      <table className={tw`table-auto border`}>
        <thead>
          <tr>
            <th className={tw`bg-gray-200 py-1 px-2`} colSpan={2}>
              {hover.features.title}
            </th>
          </tr>
        </thead>
        <tbody>
          {hover.features.data.map(([k, v], idx) => (
            <tr
              key={k + v}
              className={tw(
                clsx({
                  "bg-gray-50": idx % 2 === 0,
                  "border-gray-100 border-t": 1,
                })
              )}
            >
              <td className={tw`py-1 px-2`}>{k}</td>
              <td className={tw`py-1 px-2 border-l border-gray-100`}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Pop>
  );
}
