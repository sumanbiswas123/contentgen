import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Minus } from 'lucide-react'
import { getDivider } from '../../Redux/ProductReducer/action'
import "./divider.css"
import DividerIcon from "./image_assets/Divider.png"

const Divider = ({onContentChange,prevCode,stage,setSelectedCategory}: any) => {
    const dispatch  = useDispatch()
    const [isDividerOpen, setDividerOpen] = useState(false)
    const [ divderHeight, setDividerHeight] = useState("5")
    const [ dividerBGcolor , setDividerBGcolor] = useState("#e6e6e6")
    const [ dividerPadding, setDividerPadding] = useState("20")
    const [ fullwidthBG, setFullwidthBG] = useState("#ffffff")
    const [borderBottom, setBorderBottom] = useState("no")
    
    let DividerCode = borderBottom ==="no"? `<tr>
    <td
      align="left"
      valign="top"
      class="setPadding"
      style="padding: 0px ${dividerPadding}px; background-color: ${fullwidthBG}"
    >
      <table
        width="100%"
        border="0"
        cellspacing="0"
        cellpadding="0"
        role="presentation"
      >
        <tbody>
        <tr>
        <td style="
        font-size: 1px;
        background-color:${dividerBGcolor};
        height:${divderHeight}px;">
        &nbsp;
        </td>
        </tr>
        </tbody>
      </table>
    </td>
  </tr>`:`<tr>
  <td
    align="left"
    valign="top"
    class="setPadding"
    style="padding: 0px ${dividerPadding}px; background-color: ${fullwidthBG}"
  >
    <table
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
      role="presentation"
      
    >
      <tbody>
      <tr>
      <td style="
      font-size: 1px;
      background-color:${dividerBGcolor};
      height:${divderHeight}px;border-bottom:1px solid #151515" >
      &nbsp;
      </td>
      </tr>
      </tbody>
    </table>
  </td>
</tr>`

    const HandleDivider=()=>{
        dispatch(getDivider({type:"Divider",code:DividerCode}))
        setDividerOpen(false)
    }
    const openDividerModal = ()=>{
        if (setSelectedCategory) {
          setSelectedCategory("Divider");
        } else {
          setDividerOpen(true);
        }
    }
    const closeDividerModal = () =>{
        setDividerOpen(false)
    }

    const HandleEditDivider = () =>{
      onContentChange(DividerCode)
      closeDividerModal()
    }

    useEffect(() => {
      setDividerHeight(prevCode?.dividerHeight || "5");
      setDividerBGcolor(prevCode && prevCode.dividerBGcolor ? prevCode.dividerBGcolor : "#e6e6e6");
    }, [prevCode]);

    if (stage === "SidebarEditor") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Height (px)</label>
            <input 
              value={divderHeight}
              placeholder="5"
              onChange={(e)=>setDividerHeight(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Background Color</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
              <input 
                type="color"
                value={dividerBGcolor.startsWith("#") ? dividerBGcolor : "#e6e6e6"}
                onChange={(e)=>setDividerBGcolor(e.target.value)}
                style={{ width: "38px", height: "38px", minWidth: "38px", padding: "2px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", backgroundColor: "#ffffff", boxSizing: "border-box" }}
              />
              <input 
                value={dividerBGcolor}
                placeholder="#e6e6e6"
                onChange={(e)=>setDividerBGcolor(e.target.value)}
                style={{ flex: 1, minWidth: 0, width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Padding Sides (px)</label>
            <input 
              value={dividerPadding}
              placeholder="20"
              onChange={(e)=>setDividerPadding(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Full Width Color</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
              <input 
                type="color"
                value={fullwidthBG.startsWith("#") ? fullwidthBG : "#ffffff"}
                onChange={(e)=>setFullwidthBG(e.target.value)}
                style={{ width: "38px", height: "38px", minWidth: "38px", padding: "2px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", backgroundColor: "#ffffff", boxSizing: "border-box" }}
              />
              <input 
                value={fullwidthBG}
                placeholder="#ffffff"
                onChange={(e)=>setFullwidthBG(e.target.value)}
                style={{ flex: 1, minWidth: 0, width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Border Bottom</label>
            <select 
              value={borderBottom} 
              onChange={(e)=>setBorderBottom(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "#fff" }}
            >
              <option value="no">No Border Selected</option>
              <option value="yes">Selected Border</option>
            </select>
          </div>

          <button 
            onClick={() => {
              dispatch(getDivider({ type: "Divider", code: DividerCode }));
              if (onClose) onClose();
            }}
            style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", marginTop: "6px" }}
          >
            Apply Divider
          </button>
        </div>
      );
    }

  return (
    <div>
        <button className="Content_btn" style={{ cursor: "pointer", border: "none", background: "none" }} onClick={openDividerModal}>
          <div className="lucide-icon-box">
            <Minus size={20} />
          </div>
          <span>Divider</span>
        </button>
    </div>
  );
};

export default Divider;