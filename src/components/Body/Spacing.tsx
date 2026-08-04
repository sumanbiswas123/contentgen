import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { MoveVertical } from 'lucide-react'
import { getSpacing } from '../../Redux/ProductReducer/action'

const Spacing = ({onContentChange,prevCode,stage,setSelectedCategory}: any) => {
    
    const dispatch  = useDispatch()
  
    const [ spacingHeight, setSpacingHeight] = useState("5")
    const [ spacingColor, setSpacingColor] = useState("#ffffff")
    const [isSpacingOpen, setSpacingOpen] = useState(false)
   
    let SpacingCode = `<tr>
    <td height="${spacingHeight}" bgColor= "${spacingColor}" style="font-size: 1px; line-height: 1px;background-color:${spacingColor}">
    &nbsp;
    </td>
    </tr>`;
    const HandleSpacing=()=>{
       
        dispatch(getSpacing({type:"Spacing",code:SpacingCode}))

        setSpacingOpen(false)
    }
    const openSpacingModal = ()=>{
        if (setSelectedCategory) {
          setSelectedCategory("Spacing");
        } else {
          setSpacingOpen(true);
        }
    }
    const closeSpacingModal = () =>{
        setSpacingOpen(false)
    }

    const HandleEditSpacing = () =>{
      onContentChange(SpacingCode)
      closeSpacingModal()
    }

    // -----------------------------------------------------------------
      

      useEffect(() => {
        setSpacingHeight(prevCode?.SpacingHeight || "5");
       
       
      }, [prevCode]);


    // -----------------------------------------------------------------
    if (stage === "SidebarEditor") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Spacing Height (px)</label>
            <input 
              value={spacingHeight}
              type="number"
              placeholder="5"
              onChange={(e)=>setSpacingHeight(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Background Color</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <input 
              type="color"
              value={spacingColor.startsWith("#") ? spacingColor : "#ffffff"}
              onChange={(e)=>setSpacingColor(e.target.value)}
              style={{ width: "38px", height: "38px", minWidth: "38px", padding: "2px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", backgroundColor: "#ffffff", boxSizing: "border-box" }}
            />
            <input 
              value={spacingColor}
              type="text"
              placeholder="#ffffff"
              onChange={(e)=>setSpacingColor(e.target.value)}
              style={{ flex: 1, minWidth: 0, width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>
          </div>

          <button 
            onClick={stage ? HandleEditSpacing : HandleSpacing}
            style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", marginTop: "6px" }}
          >
            Apply Spacing
          </button>
        </div>
      );
    }

    return (
      <div>
        <button className="Content_btn btn-accent" style={{ cursor: "pointer", border: "none", background: "none" }} onClick={openSpacingModal}>
          <div className="lucide-icon-box">
            <MoveVertical size={20} />
          </div>
          <span>Spacing</span>
        </button>
      </div>
    );
}

export default Spacing