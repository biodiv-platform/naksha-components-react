import React from "react";
import { tw } from "twind";

import useLayers from "../../../hooks/use-layers";
import MoreLess from "./moreless";

export default function GridLegend({ item }) {
  const { layer } = useLayers();
  const legendInfo = layer.gridLegends[item.id];

  if (!legendInfo) return null;

  return (
    <MoreLess>
      <ul style={{ margin: 0, padding: 0 }}>
        {legendInfo?.stops.map(([stop, color], index, stopsArr) => {
          const prevStop = (stopsArr[index - 1] || [0])[0];

          if (prevStop === stop) return <div key={color}></div>;

          return (
            <li className={tw`flex gap-2 items-center mb-1`} key={color}>
              <svg viewBox="0 0 24 24" height="14" width="14" focusable="false">
                <circle
                  cx="12"
                  fill={color}
                  cy="12"
                  r="12"
                  stroke="none"
                ></circle>
              </svg>
              <div>
                {prevStop} - {stop}
              </div>
            </li>
          );
        })}
        <li>
          1 Square = {legendInfo?.squareSize} x {legendInfo?.squareSize} km
        </li>
      </ul>
    </MoreLess>
  );
}
