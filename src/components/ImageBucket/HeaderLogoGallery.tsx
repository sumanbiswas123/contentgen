import React, { useEffect, useState } from 'react'
import './HeaderLogoGallery.css'
import LogoImageUpload from './LogoImageUpload';
import axios from 'axios';

interface HeaderLogoGalleryProps {
  isOpenstatus: boolean;
  onGalleryClose: (status: boolean, imgname?: string) => void;
}

const HeaderLogoGallery = ({ isOpenstatus, onGalleryClose }: HeaderLogoGalleryProps) => {
  const [isModalOpen, setModalOpen] = useState(isOpenstatus);
  const [LogoNamesArr, setLogoNamesArr] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState("")
  
  const closeModal = () => {
    setModalOpen(false);
    onGalleryClose(false)
  };

  const SelectImg = (imgname: string) => {
    onGalleryClose(false, imgname)
  }

  const handleSearchLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_URL}/logos`)
    .then(res => {
      let newFiltered = res.data.filter((item: string) => {
        return item.toLowerCase().includes(searchValue.toLowerCase());
      });
      setLogoNamesArr(newFiltered)
    })
    .catch(err => {
      console.log(err)
    })
  }, [searchValue])

  if (!isModalOpen) return null;

  return (
    <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000 }}>
      <div className="Logos-container" style={{ backgroundColor: "white", borderRadius: "8px", width: "80%", maxWidth: "800px", maxHeight: "90vh", display: "flex", flexDirection: "column" as const, position: "relative" as const }}>
        <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, padding: "16px 20px", borderBottom: "1px solid #eee" }}>
          <h3 style={{ margin: 0 }}>Logos Gallery</h3>
          <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
        </div>

        <div style={{ padding: "16px 20px", overflowY: "auto" as const, flex: 1 }}>
          <div style={{ width: "70%", marginBottom: "15px" }}>
            <input type="search" name="search logo" id="searchBox" placeholder='Search Logo' value={searchValue} onChange={handleSearchLogo} style={{ width: "100%", padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px" }} />
          </div>
          <div style={{ position: "absolute" as const, top: 25, right: 70 }}>
            <LogoImageUpload />
          </div>
          <div id="galleryStyles">
            {LogoNamesArr && LogoNamesArr.map((img, i) => {
              return (
                <div key={i} draggable="true" onClick={() => SelectImg(img)} style={{ border: "5px solid #f3f3f3", padding: "3px", display: "flex", flexDirection: "column" as const, justifyContent: "space-between" as const, alignItems: "center" as const, height: "130px", cursor: "pointer" }}>
                  <img src={`${process.env.REACT_APP_SERVER_URL}/logos/${img}`} width={"120px"} height="100px" alt={img} />
                  <p style={{ textOverflow: "clip", fontFamily: "monospace", textTransform: "capitalize" as const }}>{img.split("-")[1]}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid #eee" }}></div>
      </div>
    </div>
  )
}

export default HeaderLogoGallery