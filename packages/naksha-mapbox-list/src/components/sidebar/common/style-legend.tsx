import React, { useMemo } from "react";
import { tw } from "twind";

export function StyleLegend({ item }) {
  const legendStyles = useMemo(
    () =>
      item?.data?.styles?.[item.data.styleIndex]?.colors?.paint?.["fill-color"]
        ?.stops ||
      item?.data?.styles?.[item.data.styleIndex]?.colors?.paint?.[
        "circle-color"
      ]?.stops ||
      [],
    [item]
  );

  return (
    <ul>
      {legendStyles.map(([title, color]) => (
        <li className={tw`flex gap-2 items-center mb-1`} key={color}>
          <svg viewBox="0 0 24 24" height="14" width="14" focusable="false">
            <circle cx="12" fill={color} cy="12" r="12" stroke="none"></circle>
          </svg>
          <div>{title}</div>
        </li>
      ))}
    </ul>
  );
}
