import type { JSX } from "react";
import { ViewState } from "react-map-gl/maplibre";
import { MapStyles } from "@biodiv-platform/naksha-commons";

type LayerType = "grid" | "vector" | "raster";

export interface ExtendedMarkerProps {
  latitude: number;
  longitude: number;
  colorHex?: string;
  anchor?:
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  iconUrl?: string;
}

export interface NakshaMaplibreLayersProps {
  defaultViewState?: Partial<ViewState>;
  workerUrl?: string;

  loadToC?: boolean;
  showToC?: boolean;
  showFullscreenControl?: boolean;
  /** distance scale bar */
  showScaleControl?: boolean;
  /** button that returns the map to `defaultViewState` */
  showResetControl?: boolean;

  managePublishing?: boolean;
  nakshaEndpointToken?: string;
  nakshaApiEndpoint?: string;
  bearerToken?: string;
  geoserver?: {
    endpoint: string;
    store: string;
    workspace: string;
    onClick?: any;
  };

  selectedLayers?: string[];
  onSelectedLayersChange?;

  mapStyle?: MapStyles;
  mapStyles?: Array<{
    text: string;
    key: string;
    style: string;
    maxZoom?: number;
  }>;
  layers?: GeoserverLayer[];
  onLayerDownload?;
  canLayerShare?;
  lang?;

  markers?: ExtendedMarkerProps[];

  children?;
}

/** Grid layer look; without `colors` and `breaks` bins and colours come from the data */
export interface GridLayerStyle {
  /** one colour per step, lowest first */
  colors?: string[];
  /** lowest count of each step after the first, so one fewer than `colors` */
  breaks?: number[];
  outlineColor?: string;
  opacity?: number;
}

/** What a grid or vector layer's `onHover` and `onClick` receive */
export interface LayerFeatureEvent {
  /** [minLon, minLat, maxLon, maxLat] of the feature */
  bbox?: number[];
  feature;
  layerId: string;
}

interface VectorStyleMeta {
  styleName?;
  styleTitle?;
  colors?;
}

export interface IUseDisclosure {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export interface GeoserverLayer {
  id: string;
  index?: number;
  title: string;
  description?: string;
  thumbnail?: string;
  attribution?: string;
  license?: string;
  tags?: string[];
  createdBy?: string;
  layerStatus?: string;
  author?: { name: string };
  url?: string;
  createdDate?: string;
  isDownloadable?: boolean;
  bbox?: any[];
  zoomToFit?: boolean;
  isAdded?: boolean;
  ats?;
  source: {
    type: LayerType;
    scheme?;
    tiles?;
    endpoint?;
    fetcher?;
  } & GridLayerStyle;
  /** content of a popup pinned on click; replaces the info bar for this layer */
  onClick?: (event: LayerFeatureEvent) => JSX.Element;
  /** content of the hover popup; replaces the default property table */
  onHover?: (event: LayerFeatureEvent) => JSX.Element;
  data?: {
    styles?: VectorStyleMeta[];
    styleIndex?;
    propertyMap?;
    titleColumn?;
    summaryColumn?;
    [key: string]: any;
  };
}
