import React, { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ImagePlus } from "lucide-react";
import ImageGallery from "../ImageBucket/ImageGallery";

const ImageReusable = memo(({ onContentChange, prevCode }: any) => {
  const dispatch = useDispatch();
  const [imagePath, setImagePath] = useState("null");
  const [isImageReusableModalOpen, setImageReusableModalOpen] = useState(false);
  const [imgALT, setAltURL] = useState("");
  const [imgBackgroundLink, setImageBackgroundLink] = useState("");
  const [imgHeight, setImgHeight] = useState("auto");
  const [imgWidth, setImgWidth] = useState("");
  const [isalign, setAlign] = useState("center");
  const [gallery, setGallery] = useState(false);
  const [imgName, setimgName] = useState("");

  const closeImageReusableModal = () => {
    setImageReusableModalOpen(false);
  };
  const openImageReusableModal = () => {
    setImageReusableModalOpen(true);
  };

  const handleImageLoad = () => {
    setGallery(true);
  };

  useEffect(() => {
    setAltURL(prevCode?.imgAlt || "");
    setImageBackgroundLink(prevCode && prevCode.ahref ? prevCode.ahref : "");
    setImgWidth(prevCode?.imgWidth || "");
    setAlign(prevCode?.imgAlign || "center");
    setimgName(prevCode?.imgsrc || "");
  }, [prevCode]);

  const HandleEditCimg = () => {
    const imagePath = `${process.env.REACT_APP_SERVER_URL}/assets/${imgName}`;
    onContentChange(
      imagePath,
      imgBackgroundLink,
      imgHeight,
      imgWidth,
      imgALT,
      isalign
    );
    closeImageReusableModal();
  };

  const ImageReusableCode = () => {
    onContentChange(
      imagePath,
      imgBackgroundLink,
      imgHeight,
      imgWidth,
      imgALT,
      isalign
    );
    closeImageReusableModal();
  };

  const HandleGalleryClose = (value: boolean, imgname: string) => {
    setimgName(imgname);
    setGallery(value);
    const imageURL = `${process.env.REACT_APP_SERVER_URL}/assets/${imgname}`;
    setImagePath(imageURL);
  };

  const divStyle = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  return (
    <div>
      <button className="Content_btn" style={isImageReusableModalOpen ? divStyle : undefined} onClick={openImageReusableModal}>
        <div className="lucide-icon-box">
          <ImagePlus size={20} />
        </div>
        <span>Image</span>
      </button>

      {isImageReusableModalOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "350px", display: "flex", flexDirection: "column" as const }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }} id='AltNames'>Add Image</h3>
              <button onClick={closeImageReusableModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ marginBottom: "15px", overflowY: "auto" as const, maxHeight: "60vh" }}>
              {imgName && <label className="labels" style={{ display: "block", marginBottom: "5px" }}>Image preview</label>}
              {imgName && (
                <div style={{ display: "flex", justifyContent: "center" as const, marginBottom: "15px" }}>
                  <img src={`${process.env.REACT_APP_SERVER_URL}/assets/${imgName}`} width={"150px"} height={"150px"} alt="Preview" />
                </div>
              )}

              <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Image Alt Text</label>
              <input
                value={imgALT}
                placeholder="Paste Image Alternate Text"
                onChange={(e) => setAltURL(e.target.value)}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                className='InputBox'
              />

              <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Image Background Url (optional)</label>
              <input
                value={imgBackgroundLink}
                placeholder="Paste Image Background Link If Any"
                onChange={(e) => setImageBackgroundLink(e.target.value)}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                className='InputBox'
              />

              <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Align</label>
              <select
                value={isalign}
                onChange={(e) => setAlign(e.target.value)}
                className='InputBox'
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="center">center</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>

              <div style={{ display: "flex", justifyContent: "space-between" as const, gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Width</label>
                  <input
                    type="number"
                    value={imgWidth}
                    placeholder="width"
                    onChange={(e) => setImgWidth(e.target.value)}
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    className='InputBox'
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Height</label>
                  <input
                    value={imgHeight}
                    placeholder="Height"
                    onChange={(e) => setImgHeight(e.target.value)}
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                    className='InputBox'
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" as const, borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
              <button
                onClick={() => handleImageLoad()}
                style={{ padding: "8px 16px", color: "#000", backgroundColor: "#fff", border: "1px solid #D0D5DD", borderRadius: "4px", fontSize: "14px", cursor: "pointer" }}
              >
                Select Image
              </button>
              <button
                id='ThemeButtonSave'
                onClick={prevCode && prevCode.stage ? HandleEditCimg : ImageReusableCode}
                style={{ padding: "8px 16px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {gallery && <ImageGallery isOpenstatus={gallery} onGalleryClose={HandleGalleryClose} />}
    </div>
  );
});

export default ImageReusable;
