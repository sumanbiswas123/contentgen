import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { getHeader } from '../../Redux/ProductReducer/action';
import { Heading as LayoutHeader } from 'lucide-react';
import "./HeaderCustom.css"
import HeaderLogoGallery from '../ImageBucket/HeaderLogoGallery';
import { GlobalModalHost } from '../ModalHost/GlobalModalHost';

const HeaderCustom = ({ stage, onClose, setSelectedCategory }: any) => {
    const [isHeaderModalOpen, setHeaderModalOpen] = useState(false)
    const [imagePath, setImagePath] = useState<string | null>(null); // Image path to be displayed
    const [imgALT, setAlt] = useState("")
    const [imgBackgroundLink, setImageBackgroundLink] = useState("")
    const [headerTitle, setHeaderTitle] = useState("")
    const [headerImageWidth , setHeaderImageWidth] = useState("120")
    const [ gallery, setGallery] = useState(false)
    const [ imgName, setimgName] = useState("")
    const dispatch = useDispatch()

    const openHeaderModal =()=>{
        setHeaderModalOpen(true)
    }
    const closeHeaderModal =()=>{
        setHeaderModalOpen(false)
        if (onClose) onClose();
    }

    const handleImageLoad = () => {
      setGallery(true)
    };

    const HandleGalleryClose = (value: boolean, imgname: string)=>{
      setimgName(imgname)
      setGallery(value)
      const imageURL = `${process.env.REACT_APP_SERVER_URL}/logos/${imgname}`;
      setImagePath(imageURL);
    }

    const HeaderCode =()=>{
        let HeaderHtml = imgBackgroundLink ?`<tr>
        <td align="left" class="gskheaderbox" valign="middle" bgcolor="#FFFFFF" style="padding: 20px 20px 20px 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" class="container" role="presentation">
        <tbody>
        <tr>
          <td class="col-100" width="${headerImageWidth}" align="left" valign="top"><a href="${imgBackgroundLink}" target="_blank"><img src="${imagePath}" width="${headerImageWidth}" height="" alt="${imgALT}" style="display:inline-block; border:none;color: #151515 !important;font-size: 12px;line-height: 30px;font-style: italic;font-weight: normal;"></a></td>
          <td class="col-100" width="20" align="center" valign="top">&nbsp;</td>
        <td class="col-100" align="left" valign="middle" style="font-family: Arial; font-size: 18px; line-height: 22px; color: #151515; font-weight: bold;">${headerTitle}</td>
        </tr>
        
        </tbody>
        </table></td>
        </tr>`:`<tr>
        <td align="left" class="gskheaderbox" valign="middle" bgcolor="#FFFFFF" style="padding: 20px 20px 20px 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" class="container" role="presentation">
        <tbody>
        <tr>
          <td class="col-100" width="${headerImageWidth}" align="left" valign="top"><img src="${imagePath}" width="${headerImageWidth}" height="" alt="${imgALT}" style="display:inline-block; border:none;color: #151515 !important;font-size: 12px;line-height: 30px;font-style: italic;font-weight: normal;"></td>
          <td class="col-100" width="20" align="center" valign="top">&nbsp;</td>
        <td class="col-100" align="left" valign="middle" style="font-family: Arial; font-size: 18px; line-height: 22px; color: #151515; font-weight: bold;">${headerTitle}</td>
        </tr>
        
        </tbody>
        </table></td>
        </tr>`

        dispatch(getHeader(HeaderHtml))
        closeHeaderModal()
    }

    const divStyle = {
      background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
      border: '2px solid transparent'
    };

    if (stage === "SidebarEditor") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {imgName && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Image Preview</span>
              <img src={`${process.env.REACT_APP_SERVER_URL}/logos/${imgName}`} width="90" height="90" alt="Preview" style={{ objectFit: "contain", borderRadius: "6px" }} />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Image Alt Text</label>
            <input 
              value={imgALT}
              placeholder="Enter Image Alternate Text"
              onChange={(e)=>setAlt(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Image Link URL (Optional)</label>
            <input 
              value={imgBackgroundLink}
              placeholder="https://example.com"
              onChange={(e)=>setImageBackgroundLink(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Header Title</label>
            <input 
              value={headerTitle}
              placeholder="Enter Header Title"
              onChange={(e)=>setHeaderTitle(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Header Image Width (px)</label>
            <input 
              value={headerImageWidth}
              placeholder="120"
              onChange={(e)=>setHeaderImageWidth(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={() => handleImageLoad()}
              style={{ flex: 1, padding: "10px", color: "#334155", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              🖼 Select Image
            </button>
            <button 
              onClick={HeaderCode}
              style={{ flex: 1, padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
            >
              Apply Header
            </button>
          </div>
          {gallery && <HeaderLogoGallery isOpenstatus={gallery} onGalleryClose={HandleGalleryClose} />}
        </div>
      );
    }

  const handleHeaderClick = () => {
    if (setSelectedCategory) {
      setSelectedCategory("HeaderCustom");
    } else {
      openHeaderModal();
    }
  };

  return (
    <div>
        <button className='Content_btn' style={isHeaderModalOpen ? divStyle : undefined} onClick={handleHeaderClick}>
          <div className="lucide-icon-box">
            <LayoutHeader size={20} />
          </div>
          <span>Header</span>
        </button>

        <GlobalModalHost
          isOpen={isHeaderModalOpen}
          onClose={closeHeaderModal}
          modalContent={
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "12px", width: "400px", display: "flex", flexDirection: "column" as const, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
                <h3 style={{ margin: 0 }} id='AltNames'>Create Header</h3>
                <button onClick={closeHeaderModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>

              <div style={{ marginBottom: "15px", overflowY: "auto" as const, maxHeight: "60vh" }}>
                {imgName && <label className="labels" id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Image preview</label>}
                {imgName && (
                  <div style={{ display: "flex", justifyContent: "center" as const, marginBottom: "15px" }}>
                    <img src={`${process.env.REACT_APP_SERVER_URL}/logos/${imgName}`} width={"100px"} height={"100px"} alt="Preview" />
                  </div>
                )}

                <label className='labels' id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Image Alt Text</label>
                <input 
                  value={imgALT}
                  id='image-alt'
                  placeholder='Paste Image Alternate Text'
                  onChange={(e)=>setAlt(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />

                <label className='labels' id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Image Background Url</label>
                <input 
                  value={imgBackgroundLink}
                  id="image-BGurl"
                  placeholder='Paste Image Background Link If Any'
                  onChange={(e)=>setImageBackgroundLink(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />

                <label className='labels' id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Header Title</label>
                <input 
                  value={headerTitle}
                  placeholder='Paste Header Title'
                  onChange={(e)=>setHeaderTitle(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />

                <label className='labels' id='AltNames' style={{ display: "block", marginBottom: "5px" }}>Header Image width</label>
                <input 
                  value={headerImageWidth}
                  placeholder='Paste Header Image Width'
                  onChange={(e)=>setHeaderImageWidth(e.target.value)}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                  className='InputBox'
                />
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
                  onClick={HeaderCode}
                  style={{ padding: "8px 16px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                >
                  Save
                </button>
              </div>
            </div>
          }
        />
      {gallery && <HeaderLogoGallery isOpenstatus={gallery} onGalleryClose ={HandleGalleryClose}  />}
    </div>
  )
}

export default HeaderCustom