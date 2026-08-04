import React, { useState } from 'react'
import HeroIcon from "../Body/image_assets/HeroImage.png";
import LogoDropper from './LogoDropper';

const LogoImageUpload = () => {
  const [isUploadModal, setUploadModal] = useState(false)

  const openUploadModal = () => setUploadModal(true)
  const closeUploadModal = () => setUploadModal(false)

  const divStyle: React.CSSProperties = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  return (
    <div style={{ textAlign: "center" as const }}>
      <button
        className="Content_btn"
        style={isUploadModal ? divStyle : {}}
        onClick={openUploadModal}
      >
        <img src={HeroIcon} alt='HeroIcon.png' width={"30px"} height={"30px"} /><br />
        <span>Upload Logos</span>
      </button>

      {isUploadModal && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "8px", width: "90%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column" as const }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, padding: "16px 20px", borderBottom: "1px solid #eee" }}>
              <h3 style={{ margin: 0 }}>Add Image</h3>
              <button onClick={closeUploadModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            <div style={{ padding: "16px 20px", overflowY: "auto" as const, flex: 1 }}>
              <LogoDropper onClose={closeUploadModal} />
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #eee" }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LogoImageUpload