import React, { useState } from 'react'
import ImageGallery from '../ImageBucket/ImageGallery';

const CTAbtnReusable = ({ctaName,ctaFunction}: any) => {
const [isButtonModalOpen, setButtonModalOpen] = useState(false)
const [isCtaText, setCtaText] = useState("")
const [isCtaLink , setCtaLink] = useState("")
const [isCtaIcon , setImagePath] = useState("")
const [isCtaBrandColor, setCtaBrandColor] = useState("")
const [isCtaColor , setCtaColor] = useState("")
const [gallery, setGallery] = useState(false)
const [imgName, setimgName] = useState("")

    const openButtonModal =()=>{
        setButtonModalOpen(true)
    }
    const closeButtonModal =()=>{
        setButtonModalOpen(false)
    }

    const handleImageLoad = () => {
      setGallery(true)
    }

    const HandleGalleryClose = (value: boolean, imgname: string)=>{
      setimgName(imgname)
      setGallery(value)
      const imageURL = `${process.env.REACT_APP_SERVER_URL}/assets/${imgname}`;
      setImagePath(imageURL);
    }

    const ApplyCta =()=>{
      ctaFunction(isCtaBrandColor,isCtaText,isCtaLink,isCtaIcon,isCtaColor)
      closeButtonModal()
    }
  return (
    <div>
        <button id='ThemeButtonSave' style={{width:"100%", marginBottom:"10px", padding: "8px", cursor: "pointer", border: "none", borderRadius: "4px"}} onClick={openButtonModal}>{ctaName}</button>
        
        {isButtonModalOpen && (
          <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "400px", display: "flex", flexDirection: "column" as const, boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
                <h3 style={{ margin: 0 }}>{ctaName}</h3>
                <button onClick={closeButtonModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>

              <div style={{ marginBottom: "15px", overflowY: "auto" as const, maxHeight: "60vh" }}>
                <button id='ThemeButtonSave' onClick={ApplyCta} style={{ width: "100%", padding: "10px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginBottom: "15px" }}>
                  Apply
                </button>

                <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Cta Text</label>
                <input 
                  value={isCtaText}
                  placeholder='Paste Cta Text'
                  onChange={(e)=>setCtaText(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />

                <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Cta Link</label>
                <input 
                  value={isCtaLink}
                  placeholder='Paste Cta Link'
                  onChange={(e)=>setCtaLink(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />

                <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Cta Icon asset</label>
                <button
                  id='ThemeButtonSave'
                  onClick={() => handleImageLoad()}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", marginBottom: "15px", background: "#f8f9fa" }}
                >
                  Select Image
                </button>

                {imgName && <label className="labels" style={{ display: "block", marginBottom: "5px" }}>Image preview</label>}
                {imgName && (
                  <div style={{ display: "flex", justifyContent: "center" as const, marginBottom: "15px" }}>
                    <img src={`${process.env.REACT_APP_SERVER_URL}/assets/${imgName}`} width={"150px"} height={"150px"} alt="Preview" />
                  </div>
                )}

                <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Cta Background Color</label>
                <input 
                  value={isCtaBrandColor}
                  placeholder='Paste Cta Brand Background'
                  onChange={(e)=>setCtaBrandColor(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />

                <label id='AltNames' className="labels" style={{ display: "block", marginBottom: "5px" }}>Cta Color</label>
                <input 
                  value={isCtaColor}
                  placeholder='Paste Cta color'
                  onChange={(e)=>setCtaColor(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" as const, borderTop: "1px solid #eee", paddingTop: "15px" }}>
                <button
                  onClick={closeButtonModal}
                  style={{ padding: "8px 16px", color: "#000", backgroundColor: "#fff", border: "1px solid #D0D5DD", borderRadius: "4px", fontSize: "14px", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      {gallery && <ImageGallery isOpenstatus={gallery} onGalleryClose ={HandleGalleryClose}  />}
    </div>
  )
}

export default CTAbtnReusable