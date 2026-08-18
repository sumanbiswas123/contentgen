import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getHero } from "../../Redux/ProductReducer/action";
import { Image as ImageIcon } from "lucide-react";
import "./hero.css";
import { memo } from "react";
import ImageGallery from "../ImageBucket/ImageGallery";
import HeroIcon from "./image_assets/HeroImage.png"

const Hero = memo(({ onContentChange, prevCode, setSelectedCategory, stage, onClose }: any) => {
  const dispatch = useDispatch();
  const [imagePath, setImagePath] = useState(null as string | null);
  const [isHeroModalOpen, setHeroModalOpen] = useState(false);
  const [gallery, setGallery] = useState(false)
  const [imgName, setimgName] = useState("")
  const [imgURL, setImgURL] = useState("");
  const [imgALT, setAlt] = useState(prevCode?.imgAlt || "");
  const [imgBackgroundLink, setImageBackgroundLink] = useState(
    prevCode && prevCode.ahref ? prevCode.ahref : ""
  );

  let heroHTML = imgBackgroundLink
    ? `<tr>
    <td align="left" data-test="hero-image" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody><tr>
    <td class="hero_image" style="font-size: 0%;padding:0px">
    <a target="_blank" style="color: #164194; text-decoration: none" href="${imgBackgroundLink}"><img src="${imagePath}" width="660" height="" alt="${imgALT}" aria-hidden="true" style="
    display: inline-block;border: none;
    color: #151515;
    font-size: 12px;
    line-height: 18px;
    font-style: italic;
    font-weight: normal;
    border-radius: 8px;
    "></a>
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>`
    : `<tr>
    <td align="left" data-test="hero-image" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody><tr>
    <td class="hero_image" style="font-size: 0%;padding:0px">
    <img src="${imagePath}" width="660" height="" alt="${imgALT}" aria-hidden="true" style="
    display: inline-block;border: none;
    color: #151515;
    font-size: 12px;
    line-height: 18px;
    font-style: italic;
    font-weight: normal;
    border-radius: 8px;
    ">
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>`;

  const [dataHTML, setDataHtml] = useState();

  const HandleGalleryClose = (value: any, imgname: any)=>{
    setimgName(imgname)
    setGallery(value)
    const imageURL = `${process.env.REACT_APP_SERVER_URL}/assets/${imgname}`;
    setImagePath(imageURL);
  }

  const closeHeroModal = () => {
    setHeroModalOpen(false);
  };

  const handleImageLoad = () => {
    setGallery(true)
  }
  
  const openHeroModal = () => {
    if (setSelectedCategory) {
      setSelectedCategory('Hero');
    } else {
      setHeroModalOpen(true);
    }
  };

  const EditHeroCode = () => {
    const imagePath = `${process.env.REACT_APP_SERVER_URL}/assets/${imgName}`;
    onContentChange(imagePath, imgALT, imgBackgroundLink);
    closeHeroModal();
  };

  useEffect(() => {
    setAlt(prevCode?.imgAlt || "");
    setImageBackgroundLink(prevCode && prevCode.ahref ? prevCode.ahref : "");
    setImgURL(prevCode && prevCode.stage ? prevCode.imgURL : "");
    setimgName(prevCode && prevCode.stage ? prevCode.imgsrc : "")
  }, [prevCode]);

  const HeroCode = () => {
    setDataHtml(heroHTML as any);
    dispatch(getHero({ type: "HeroImage", code: heroHTML }));
    closeHeroModal();
  };

  const divStyle = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column" as const }}>
        <div style={{ marginBottom: "15px" }}>
          {imgName && <label className="labels" style={{ display: "block", marginBottom: "5px" }}>Image preview</label>}
          {imgName && (
            <div style={{ display: "flex", justifyContent: "center" as const, marginBottom: "10px" }}>
              <img src={`${process.env.REACT_APP_SERVER_URL}/assets/${imgName}`} width="150px" height="150px" alt="Preview" />
            </div>
          )}

          <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Image Alt Text</label>
          <input
            value={imgALT}
            id="image-alt"
            placeholder="Paste Image Alternate Text"
            onChange={(e) => setAlt(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
            className='InputBox'
          />

          <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Image Background Url (optional)</label>
          <input
            value={imgBackgroundLink}
            id="image-BGurl"
            placeholder="Paste Image Background Link If Any"
            onChange={(e) => setImageBackgroundLink(e.target.value)}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
            className='InputBox'
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" as const, borderTop: "1px solid #eee", paddingTop: "15px" }}>
          <button
            onClick={handleImageLoad}
            style={{ padding: "8px 16px", color: "#000", backgroundColor: "#fff", border: "1px solid #D0D5DD", borderRadius: "4px", fontSize: "14px", cursor: "pointer" }}
          >
            Select Image
          </button>
          <button
            id='ThemeButtonSave'
            onClick={() => {
              HeroCode();
              if (onClose) onClose();
            }}
            style={{ padding: "8px 16px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            Add
          </button>
        </div>
        {gallery && <ImageGallery isOpenstatus={gallery} onGalleryClose={HandleGalleryClose} />}
      </div>
    );
  }

  return (
    <div>
      <button className="Content_btn" style={isHeroModalOpen ? divStyle : undefined} onClick={openHeroModal}>
        <div className="lucide-icon-box">
          <ImageIcon size={20} />
        </div>
        <span>Hero Banner</span>
      </button>

      {isHeroModalOpen && (
        <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "400px", display: "flex", flexDirection: "column" as const }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }} id='AltNames'>Add Image</h3>
              <button onClick={closeHeroModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ marginBottom: "15px" }}>
              {imgName && <label className="labels" style={{ display: "block", marginBottom: "5px" }}>Image preview</label>}
              {imgName && (
                <div style={{ display: "flex", justifyContent: "center" as const, marginBottom: "10px" }}>
                  <img src={`${process.env.REACT_APP_SERVER_URL}/assets/${imgName}`} width="150px" height="150px" alt="Preview" />
                </div>
              )}

              <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Image Alt Text</label>
              <input
                value={imgALT}
                id="image-alt"
                placeholder="Paste Image Alternate Text"
                onChange={(e) => setAlt(e.target.value)}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                className='InputBox'
              />

              <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Image Background Url (optional)</label>
              <input
                value={imgBackgroundLink}
                id="image-BGurl"
                placeholder="Paste Image Background Link If Any"
                onChange={(e) => setImageBackgroundLink(e.target.value)}
                style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                className='InputBox'
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" as const, borderTop: "1px solid #eee", paddingTop: "15px" }}>
              <button
                onClick={handleImageLoad}
                style={{ padding: "8px 16px", color: "#000", backgroundColor: "#fff", border: "1px solid #D0D5DD", borderRadius: "4px", fontSize: "14px", cursor: "pointer" }}
              >
                Select Image
              </button>
              <button
                id='ThemeButtonSave'
                onClick={prevCode && prevCode.stage ? EditHeroCode : HeroCode}
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

export default Hero;
