import { ViewState } from "react-map-gl";
import { MapStyles } from "@biodiv-platform/naksha-commons";

type LayerType = "grid" | "vector" | "raster";

export interface ExtendedMarkerProps {
  latitude: number;
  longitude: number;
  colorHex: string;
}

export interface ExtendedClusterProps {
  lat: number;
  lng: number;
  id: number;
}

export interface NakshaMapboxListProps {
  defaultViewState?: Partial<ViewState>;

  loadToC?: boolean;
  showToC?: boolean;

  managePublishing?: boolean;
  nakshaEndpointToken?: string;
  mapboxAccessToken: string;
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
  layers?: GeoserverLayer[];
  onLayerDownload?;
  canLayerShare?;
  lang?;

  markers?: ExtendedMarkerProps[];
  clusterMarkers?: ExtendedClusterProps[];
  hoverFunction?: any;

  showLayerHoverPopup?: boolean;

  children?;
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
  isAdded?: boolean;
  ats?;
  source: {
    type: LayerType;
    scheme?;
    tiles?;
    endpoint?;
    fetcher?;
  };
  onClick?: ({ bbox, feature, layerId }) => JSX.Element;
  onHover?: ({ bbox, feature, layerId }) => JSX.Element;
  data?: {
    styles?: VectorStyleMeta[];
    styleIndex?;
    propertyMap?;
    titleColumn?;
    summaryColumn?;
    [key: string]: any;
  };
}

export interface FeatureProperties {
  id: string;
  [key: string]: any;
}

export interface GeoJSONFeature {
  type: "Feature";
  properties: { id: string };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface GeoJSON {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface HoveredMarker {
  lngLat: [number, number];
  properties: FeatureProperties;
}
