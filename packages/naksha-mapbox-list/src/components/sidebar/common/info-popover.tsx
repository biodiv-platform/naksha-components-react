import { LICENSES, useT } from "@ibp/naksha-commons";
import React, { useState } from "react";
import { Popover, useArrowContainer } from "react-tiny-popover";
import { tw } from "twind";

import useLayers from "../../../hooks/use-layers";
import { overflowStyle } from "../../../static/constants";
import {
  AttributionIcon,
  Button,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  InfoIcon,
  LicenseIcon,
  TagIcon,
} from "../../core";

interface LayerInfoLineProps {
  icon;
  children;
  name?;
  title?;
  link?;
}

const LayerInfoLine = ({
  icon,
  name,
  title,
  link,
  children,
}: LayerInfoLineProps) => {
  const content = <span>{children || "-"}</span>;

  return (
    <div
      className={tw`flex gap-3 text-sm text-gray-600 break-all`}
      title={name && title && `${name}: ${title}`}
    >
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

interface InfoPopoverProps {
  item?;
  containerStyle?;
}

export function InfoPopover({ item, containerStyle }: InfoPopoverProps) {
  const { t } = useT();
  const { layer, mp } = useLayers();

  const license = item.license || "CC-BY";
  const createdOn =
    item?.createdDate && new Date(item.createdDate).toDateString();
  const tags = item.tags?.join(", ");

  return (
    <div
      className={tw`flex flex-col gap-1 bg-white p-4 rounded-lg w-72 border border-gray-300 border-solid`}
      style={containerStyle}
    >
      {mp.managePublishing && item.layerStatus && (
        <LayerInfoLine
          icon={<EyeIcon />}
          name={t("visiblity")}
          title={item.layerStatus}
        >
          {item.layerStatus}
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
        </LayerInfoLine>
      )}

      <LayerInfoLine
        icon={<AttributionIcon />}
        link={item.url}
        name={t("created_by")}
        title={[item.createdBy, item.attribution].join("\n")}
      >
        {item.createdBy}, {item.attribution}
      </LayerInfoLine>
      <LayerInfoLine
        icon={<ClockIcon />}
        name={t("created_on")}
        title={createdOn}
      >
        {createdOn}
      </LayerInfoLine>
      <LayerInfoLine
        icon={<TagIcon />}
        name={t("tags")}
        title={tags}
        children={tags}
      />
      <LayerInfoLine
        name={t("license")}
        title={license}
        link={license && LICENSES[license]}
        icon={<LicenseIcon />}
      >
        {license}
      </LayerInfoLine>
    </div>
  );
}

export const PopoverWrapper = ({ item }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => setIsPopoverOpen(!isPopoverOpen);

  return (
    <Popover
      isOpen={isPopoverOpen}
      padding={10}
      positions={["right"]}
      containerStyle={{ zIndex: 99 }}
      onClickOutside={togglePopover}
      content={<InfoPopover item={item} />}
    >
      <Button
        onClick={togglePopover}
        children={<InfoIcon />}
        title="Information"
      />
    </Popover>
  );
};
