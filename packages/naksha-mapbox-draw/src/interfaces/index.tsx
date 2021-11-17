import { BaseLayer } from "@ibp/naksha-commons";
import { ViewportProps } from "react-map-gl";

export interface NakshaMapboxDrawProps {
  defaultViewPort?: Partial<ViewportProps>;
  mapboxApiAccessToken: string;
  baseLayer?: BaseLayer;
  defaultFeatures?: any[];
  onFeaturesChange?: Function;
  isControlled?: boolean;
  isReadOnly?: boolean;
  isMultiple?: boolean;
}
