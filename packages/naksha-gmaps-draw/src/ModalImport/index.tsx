import React, { useState } from "react";
import NakshaImport from "../import";
import GeojsonImport from "../geojson";

const DefaultModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  nakshaImport: React.ReactNode;
  geoJSONImport: React.ReactNode;
}> = ({ isOpen, onClose, nakshaImport, geoJSONImport }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            border: "none",
            background: "none",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        <h3
          style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 600 }}
        >
          Import Data
        </h3>
        <div style={{ marginBottom: "20px" }}>
          <h4
            style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 500 }}
          >
            Import Coordinates
          </h4>
          {nakshaImport}
        </div>
        <div>
          <h4
            style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 500 }}
          >
            Import GeoJSON
          </h4>
          {geoJSONImport}
        </div>
      </div>
    </div>
  );
};

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
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const nakshaImport = (
    <NakshaImport
      addFeature={addFeature}
      InputComponent={InputComponent}
      ButtonComponent={ButtonComponent}
      LocationIcon={LocationIcon}
      SuccessIcon={SuccessIcon}
      FailureIcon={FailureIcon}
    />
  );

  const geoJSONImport = (
    <GeojsonImport
      addFeature={addFeature}
      ButtonComponent={ButtonComponent}
      DeleteIcon={DeleteIcon}
      FileIcon={FileIcon}
      SuccessIcon={SuccessIcon}
      FailureIcon={FailureIcon}
    />
  );

  return (
    <div style={{ display: "flex" }}>
      {React.isValidElement(ModalComponent) ? (
        React.cloneElement(ModalComponent, {
          isOpen: isModalOpen,
          onClose: handleModalClose,
          nakshaImport,
          geoJSONImport,
        } as any)
      ) : (
        <DefaultModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          nakshaImport={nakshaImport}
          geoJSONImport={geoJSONImport}
        />
      )}
      {React.isValidElement(ButtonComponentModal) ? (
        React.cloneElement(ButtonComponentModal, {
          onClick: handleOpenModal,
          type: "button",
        } as any)
      ) : (
        <button
          type="button"
          onClick={handleOpenModal}
          style={{
            padding: "6px 16px",
            backgroundColor: "#519895",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Import
        </button>
      )}
    </div>
  );
}
