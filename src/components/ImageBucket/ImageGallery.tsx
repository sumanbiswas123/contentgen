import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./ImageGallery.css"

const ImageGallery = ({ isOpenstatus, onGalleryClose }: any) => {
  const [isModalOpen, setModalOpen] = useState(isOpenstatus);
  const reduxstoreImages = useSelector(
    (selector: any) => selector.ProductReducer.Images
  );

  const closeModal = () => {
    setModalOpen(false);
    onGalleryClose(false)
  };

  const SelectImg = (imgname: string) =>{
    onGalleryClose(false,imgname)
  }
 
  useEffect(() => {
  }, []);

  return (
    <div>
      {isModalOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "flex-end" as const, zIndex: 2000 }}>
          <div style={{ backgroundColor: "white", width: "300px", height: "100vh", padding: "20px", display: "flex", flexDirection: "column" as const, boxSizing: "border-box", overflowY: "auto" as const }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Gallery</h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <div id="galleryStyles" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {
                 reduxstoreImages && reduxstoreImages.map((img: string)=>{
                      return (
                        <div key={img} onClick={()=>SelectImg(img)} style={{border:"1px solid #ccc", padding:"5px", cursor:"pointer", display:"flex", justifyContent:"center", alignItems:"center", borderRadius:"4px" }}>
                          <img src={`${process.env.REACT_APP_SERVER_URL}/assets/${img}`} width={"80px"} height="80px" alt={img} style={{ objectFit: "contain" }} />
                        </div>
                      )
                  })
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
