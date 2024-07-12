import { useT } from "@biodiv-platform/naksha-commons";
import React, { useState, useEffect } from "react";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import { PROPERTY_ID, SELECTION_STYLE } from "../../static/constants";
import {
  CloseButton,
  CrossHairIcon,
  DownIcon,
  ExternalLinkIcon,
  UpIcon,
} from "../core";
import InfoBarPanel from "./infobar-panel";
import clsx from "clsx";

export default function InfoBarContent({ onClose }) {
  const {
    layer: { selectedFeatures, selectedLayers, selectionStyle },
    markerDetails,
  } = useLayers();
  const { t } = useT();

  const [isOpen, setIsOpen] = useState(true);
  const [groupName, setGroupName] = useState(null);

  const values = markerDetails?.values || [];

  useEffect(() => {
    // Extract groupName from the path if it exists
    const groupMatch = window.location.pathname.match(/group\/([^/]+)/);
    if (groupMatch) {
      setGroupName(groupMatch[1]);
    }
  }, []);

  return (
    <div
      className={tw`absolute top-0 right-0 bottom-0 left-0 md:top-4 md:right-4 md:bottom-4 md:left-auto bg-white rounded-lg overflow-hidden shadow-md md:max-w-sm w-full z-20 flex flex-col`}
    >
      <div className="flex w-full">
        <div
          className={tw`h-12 px-4 flex items-center gap-3 flex-grow bg-gray-200`}
        >
          <CrossHairIcon /> {t("infobar")}
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <div className={tw`flex flex-col flex-grow overflow-auto gap-3 p-4`}>
        {markerDetails.values.length > 0 && (
          <div className={tw`bg-gray-100 rounded-lg`}>
            <button
              className={tw(
                clsx([
                  `px-4 h-10 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer w-full focus:outline-none focus:ring`,
                  { "bg-gray-200 rounded-t-lg": isOpen, "rounded-lg": !isOpen },
                ])
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              Marker Details {isOpen ? <UpIcon /> : <DownIcon />}
            </button>
            {isOpen && (
              <div>
                {values.map((valueItem, index) => (
                  <div key={index} className={tw`px-4 py-2 flex flex-col`}>
                    <p className={tw`truncate text-gray-600`}>
                      {valueItem.name}
                    </p>
                    <p className={tw`truncate`}>
                      {Array.isArray(valueItem.value)
                        ? valueItem.value.map((val, i) => (
                            <span key={i}>
                              {val.label}
                              {i < valueItem.value.length - 1 ? ", " : ""}
                            </span>
                          ))
                        : valueItem.value}
                    </p>
                  </div>
                ))}
                <p className={tw`text-blue-500 px-4 py-2`}>
                  <a
                    href={
                      groupName
                        ? `/group/${groupName}/data/show/${markerDetails.id}`
                        : `/data/show/${markerDetails.id}`
                    }
                    target="_blank"
                    className={tw`flex items-center gap-1`}
                  >
                    <span>CCA Details</span>
                    <span className={tw`mt-1`}>
                      <ExternalLinkIcon />
                    </span>
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
        {selectedFeatures &&
          selectedFeatures
            .flat(1)
            ?.map((data) => (
              <InfoBarPanel
                key={
                  selectedLayers?.[0]?.source.type === "raster" &&
                  selectionStyle === SELECTION_STYLE.ALL
                    ? data?.sourceLayer
                    : data?.sourceLayer + data?.properties[PROPERTY_ID]
                }
                data={data}
              />
            ))}
      </div>
    </div>
  );
}
