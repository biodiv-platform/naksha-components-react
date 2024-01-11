import React, { useRef, useState, useEffect } from "react";
import { GMAP_FEATURE_TYPES } from "../static/constants";
import NakshaImport from "../import";
import GeojsonImport from "../geojson";

export default function ModalImport({
  ButtonComponent,
  ModalComponent,
  addFeature,
  InputComponent,
  ButtonComponentModal,
  DeleteIcon,
  LocationIcon,
  FileIcon,
  SuccessIcon,
  FailureIcon,
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
            LocationIcon={LocationIcon}
            SuccessIcon={SuccessIcon}
            FailureIcon={FailureIcon}
          />
        ),
        geoJSONImport: (
          <GeojsonImport
            addFeature={addFeature}
            ButtonComponent={ButtonComponent}
            DeleteIcon={DeleteIcon}
            FileIcon={FileIcon}
            SuccessIcon={SuccessIcon}
            FailureIcon={FailureIcon}
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
