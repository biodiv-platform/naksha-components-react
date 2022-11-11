import React from "react";
import { Layer, Source } from "react-map-gl";
import useLayers from "../../../../hooks/use-layers";

import { GeoserverLayer } from "../../../../interfaces";



export default function RasterLayer({
    data,
    beforeId,
}: {
    data: GeoserverLayer;
    beforeId?;
}) {
    const { mp } = useLayers();

    return (
        <Source id={data.id} type="raster"
            tiles={[`${mp?.geoserver?.endpoint}/wms?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&transparent=true&layers=biodiv:${data.id}`]} tileSize={256}>

            <Layer id={data.id}
                beforeId={beforeId}
                type="raster"
                source="biodiv"
                layout={{ "visibility": "visible" }}
                paint={{}} />
        </Source>
    );
}
