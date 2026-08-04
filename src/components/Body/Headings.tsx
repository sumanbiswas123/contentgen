// no longer useful since everything acheived using just paragraphNew.jsx
import React, { useState } from "react";
import { getHead } from "../../Redux/ProductReducer/action";
import { useDispatch } from "react-redux";

const Headings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [headHtml, setHeadHtml] = useState("");
  const [color, setColor] = useState("#151515");
  const [bgcolor, setBGColor] = useState("#ffffff");
  const [fontsize, setFontsize] = useState("14");
  const [heading, setHeading] = useState("");
  const [align, setAlign] = useState("left");
  const dispatch = useDispatch();

  const HeadCode = () => {
    const HeadCode = `<tr>
        <td
            class=""
            align="left"
            valign="top"
            style="padding: 0px 20px; background-color: #ffffff"
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
    <td align="${align}" valign="top" style="
    color: ${color};
    font-family: Arial;
    font-size: ${fontsize}px;
    line-height: ${+fontsize + 2}px;
    background-color:${bgcolor};
    mso-line-height-rule: exactly;
    ">
    <strong>${heading}</strong>
    </td>
    </tr>
                </tbody>
            </table>
        </td>
    </tr>`;
    setHeadHtml(HeadCode);
    dispatch(getHead(HeadCode));
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <button className="btn-accent" style={{ padding: "8px 16px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px" }} onClick={openModal}>Headings</button>
      
      {isOpen && (
      <div className="modal-dialog-overlay" style={{ position: "fixed" as const, top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center" as const, alignItems: "center" as const }}>
        <div className="modal-content" style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", minWidth: "300px", maxWidth: "500px", width: "100%" }}>
          <div className="modal-header" style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: "15px" }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Enter your Headings</h2>
            <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
          </div>
          
          <div className="modal-body" style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
            <textarea
              className="input-custom-field"
              placeholder={"enter your content"}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minHeight: "80px", width: "100%", boxSizing: "border-box" }}
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />

            <input
              type="number"
              className="input-custom-field"
              placeholder="font-size - px"
              style={{ width: "40%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              value={fontsize}
              onChange={(e) => setFontsize(e.target.value)}
            />

            <input
              className="input-custom-field"
              placeholder="color - #000000"
              style={{ width: "40%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            
            <input
              className="input-custom-field"
              placeholder="background color - #000000"
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
              value={bgcolor}
              onChange={(e) => setBGColor(e.target.value)}
            />

            <select className="input-custom-field" style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} value={align} onChange={(e) => setAlign(e.target.value)}>
              <option value="left">LEFT</option>
              <option value="center">CENTER</option>
              <option value="right">RIGHT</option>
            </select>
          </div>
          
          <div className="modal-footer" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" as const }}>
            <button className="btn-accent" style={{ backgroundColor: "#3182ce", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={HeadCode}>
              Save
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Headings;

// no longer useful since everything acheived using just paragraphNew.jsx