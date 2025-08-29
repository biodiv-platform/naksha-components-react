export const featureStyle: any = {
  id: "data",
  type: "fill",
  paint: {
    "fill-color": "#f03b20",
    "fill-opacity": 0.2,
  },
  filter: ["==", ["geometry-type"], "Polygon"],
};

export const pointStyle: any = {
  type: "circle",
  paint: {
    "circle-radius": 8,
    "circle-color": "#f03b20",
    "circle-opacity": 0.8,
  },
  filter: ["==", ["geometry-type"], "Point"],
};

export const lineStyle: any = {
  type: "line",
  paint: {
    "line-color": "#f03b20",
    "line-width": 1.6,
    "line-dasharray": [6, 3],
    "line-opacity": 0.8,
  },
  filter: ["==", ["geometry-type"], "LineString"],
};
