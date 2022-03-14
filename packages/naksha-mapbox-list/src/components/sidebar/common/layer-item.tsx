import { LICENSES, useT } from "@ibp/naksha-commons";
import React, { useState } from "react";
import { SortableHandle } from "react-sortable-hoc";
import { tw } from "twind";

import useLayers from "../../../hooks/use-layers";
import { GeoserverLayer } from "../../../interfaces";
import {
  FALLBACK_THUMB,
  overflowStyle,
  overflowStyle2,
} from "../../../static/constants";
import {
  AttributionIcon,
  CheckboxInput,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  GrabberIcon,
  IconButton,
  LicenseIcon,
  TagIcon,
} from "../../core";
import { Highlighted } from "../../core/highlighter";
import LayerItemStyle from "./layer-item-style";

interface LayerInfoLineProps {
  icon;
  children;
  title?;
  link?;
}

const LayerInfoLine = ({ icon, title, link, children }: LayerInfoLineProps) => {
  const content = <span style={overflowStyle}>{children || "-"}</span>;

  return (
    <div className={tw`flex gap-3 text-sm text-gray-600`} title={title}>
      <div>{icon}</div>
      {link ? (
        <a
          className={tw`text-blue-700 focus:outline-none focus:ring`}
          target="_blank"
          rel="noopener"
          href={link}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
};

const DragHandle = SortableHandle(() => (
  <div className={tw`mt-1 w-5 text-center cursor-move`}>
    <GrabberIcon />
  </div>
));

interface LayerItemProps {
  item: GeoserverLayer;
  extended?: boolean;
}

export default function LayerItem({ item, extended }: LayerItemProps) {
  const { t } = useT();
  const { layer, query, mp } = useLayers();
  const [isAdded, setIsAdded] = useState(layer.selectedIds.includes(item.id));
  const [isLoading, setIsLoading] = useState(false);

  const onToggleLayer = async () => {
    setIsLoading(true);
    await layer.toggle({ layerId: item.id, add: !isAdded });
    setIsAdded(!isAdded);
    setIsLoading(false);
  };

  return (
    <div
      className={tw`z-20 p-3 bg-white`}
      style={{ borderTop: "1px solid #e5e7eb" }}
    >
      <div className={tw`flex gap-3`}>
        <div className={tw`flex-shrink-0`}>
          <CheckboxInput
            name={item.id}
            checked={isAdded}
            onChange={onToggleLayer}
            isLoading={isLoading}
          />
          {extended && <DragHandle />}
        </div>
        <img
          className={tw`flex-shrink-0 overflow-hidden h-16 w-16 p-1 mb-2 object-cover border border-gray-200 rounded`}
          src={item.thumbnail || FALLBACK_THUMB}
        />
        <div>
          <div
            title={item.title}
            className={tw`mb-1 leading-tight`}
            style={overflowStyle}
          >
            <Highlighted text={item.title} highlight={query.term} />
          </div>
          <p
            title={item.description}
            className={tw`text-gray-600 text-sm`}
            style={overflowStyle2}
          >
            {item.description}
          </p>
        </div>
      </div>
      <div className={tw`flex flex-col gap-1`}>
        <LayerInfoLine icon={<EyeIcon />} title={item.layerStatus}>
          {item.layerStatus}
          {item.layerStatus && mp.managePublishing && (
            <>
              <button
                className={tw`text-blue-600 focus:outline-none ml-4`}
                onClick={() => layer.togglePublish(item.id, item?.layerStatus)}
              >
                {t("toggle")}
              </button>
              <button
                className={tw`text-red-600 focus:outline-none ml-4`}
                onClick={() => layer.delete(item.id, t("are_you_sure"))}
              >
                {t("delete")}
              </button>
            </>
          )}
        </LayerInfoLine>

        <LayerInfoLine
          icon={<AttributionIcon />}
          link={item.url}
          title={[item.createdBy, item.attribution].join("\n")}
        >
          {item.createdBy}, {item.attribution}
        </LayerInfoLine>
        <LayerInfoLine icon={<ClockIcon />}>
          {item?.createdDate && new Date(item.createdDate).toDateString()}
        </LayerInfoLine>
        <LayerInfoLine
          icon={<TagIcon />}
          title={item.tags?.join(", ")}
          children={item.tags?.join(", ")}
        />
        <LayerInfoLine
          link={item.license && LICENSES[item.license]}
          icon={<LicenseIcon />}
        >
          {item.license}
        </LayerInfoLine>
        <LayerInfoLine icon={<DownloadIcon />}>
          {item.isDownloadable ? (
            <button
              className={tw`text-blue-600`}
              onClick={() => mp?.onLayerDownload(item.id)}
            >
              {t("download")}
            </button>
          ) : (
            "Unavailable"
          )}
        </LayerInfoLine>
      </div>
      {extended && <LayerItemStyle item={item} />}
    </div>
  );
}
