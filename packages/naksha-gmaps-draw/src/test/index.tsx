import React, { useRef, useState, useEffect } from "react";
import { GMAP_FEATURE_TYPES } from "../static/constants";
import NakshaImport from "../import";

export default function TestingImport({ ButtonComponent,ModalComponent,addFeature,InputComponent}) {
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
        nakshaImport:<NakshaImport 
        addFeature={addFeature}
        InputComponent={InputComponent}
        ButtonComponent={ButtonComponent}/>
      })}
     {React.cloneElement(ButtonComponent, {
        onClick: handleOpenModal,
        type: "button",
      })}

    </div>
  );
}
