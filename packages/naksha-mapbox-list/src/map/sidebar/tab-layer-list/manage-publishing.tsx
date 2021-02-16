import { IconButton } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import useLayerManager from "../../../hooks/use-layer-manager";
import { IconDelete, IconEyeOff, IconEyeOn } from "../../icons";

const ACTIONS = {
  PUBLISH: "Publish",
  PENDING: "Pending",
  DELETE: "Delete",
};

export default function ManagePublishing({ layerStatus, layerId }) {
  const [isPublished, setIsPublished] = useState(layerStatus === "Active");
  const { toggleLayerPublishing, deleteLayer } = useLayerManager();

  useEffect(() => {
    toggleLayerPublishing(layerId, isPublished);
  }, [isPublished]);

  const onLayerDelete = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Are you sure?")) {
      await deleteLayer(layerId);
    }
  };

  return (
    <>
      <IconButton
        variant="outline"
        colorScheme={isPublished ? "yellow" : "green"}
        size="sm"
        aria-label={isPublished ? ACTIONS.PENDING : ACTIONS.PUBLISH}
        title={isPublished ? ACTIONS.PENDING : ACTIONS.PUBLISH}
        icon={isPublished ? <IconEyeOff /> : <IconEyeOn />}
        onClick={() => setIsPublished(!isPublished)}
      />
      <IconButton
        variant="outline"
        colorScheme="red"
        size="sm"
        aria-label={ACTIONS.DELETE}
        title={ACTIONS.DELETE}
        icon={<IconDelete />}
        onClick={onLayerDelete}
      />
    </>
  );
}
