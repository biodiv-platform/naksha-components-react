import React, { useRef, useState, useEffect } from "react";
import { GMAP_FEATURE_TYPES } from "../static/constants";
import NakshaImport from "../import";
import GeojsonImport from "../geojson";

export default function TestingImport({
  ButtonComponent,
  ModalComponent,
  addFeature,
  InputComponent,
  ButtonComponentModal,
  DeteteIcon,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: "flex" }}>
      {React.cloneElement(ModalComponent, {
        isOpen: isModalOpen,
        onClose: handleModalClose,
        nakshaImport: (
          <NakshaImport
            addFeature={addFeature}
            InputComponent={InputComponent}
            ButtonComponent={ButtonComponent}
          />
        ),
        geoJSONImport: (
          <GeojsonImport
            addFeature={addFeature}
            ButtonComponent={ButtonComponent}
            DeleteIcon={DeteteIcon}
          />
        ),
      })}
      {React.cloneElement(ButtonComponentModal, {
        onClick: handleOpenModal,
        type: "button",
      })}
    </div>
  );
}
