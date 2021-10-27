import React from "react";

import {
  LayerUploadProps,
  LayerUploadProvider,
} from "./hooks/use-layer-upload";
import LayerUpload from "./layer-upload";

const NakshaLayerUpload = (props) => (
  <LayerUploadProvider {...props}>
    <LayerUpload />
  </LayerUploadProvider>
);

export type { LayerUploadProps };
export { NakshaLayerUpload };
