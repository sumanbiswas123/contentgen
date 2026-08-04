import React, { useState } from 'react'
import ImageDropper from './ImageDropper';
import { Upload } from 'lucide-react';

const UploadComponent = () => {
    const [ isUploadModal, setUploadModal] = useState(false)
    const openUploadModal = ()=>{
        setUploadModal(true)
    }
    const closeUploadModal =()=>{
        setUploadModal(false)
    }

    const divStyle = {
      background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
      border: '2px solid transparent'
    };

  return (
    <div>
        <button className="Content_btn" style={isUploadModal ? divStyle : undefined} onClick={openUploadModal}>
          <div className="lucide-icon-box">
            <Upload size={20} />
          </div>
          <span>Upload Assets</span>
        </button>

        {isUploadModal && (
          <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "90vw", height: "90vh", display: "flex", flexDirection: "column" as const, boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
                <h3 style={{ margin: 0 }}>Add Image</h3>
                <button onClick={closeUploadModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>

              <div style={{ flex: 1, overflowY: "auto" as const }}>
                <ImageDropper onClose={closeUploadModal}/>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default UploadComponent