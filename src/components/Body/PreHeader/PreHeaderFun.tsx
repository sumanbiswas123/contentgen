import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { TextQuote } from "lucide-react";
import { getPreHeader } from "../../../Redux/ProductReducer/action";

export function PreHeaderFun({ stage, onClose, setSelectedCategory }: any) {
  const dispatch = useDispatch();
  const [preHeader, setPreHeader] = useState("Your pre header not set yet!");
  const [isOpen, setIsOpen] = useState(false);
    
  function handlePreHeader() {
    dispatch(getPreHeader(preHeader));
    setIsOpen(false);
    if (onClose) onClose();
  }

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Pre-Header Snippet Text</label>
          <textarea
            value={preHeader}
            onChange={(e) => setPreHeader(e.target.value)}
            placeholder="Enter pre-header text visible in email preview inbox"
            rows={3}
            style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "vertical" }}
          />
          <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
            This summary text appears next to the subject line in email clients.
          </span>
        </div>

        <button 
          onClick={handlePreHeader}
          style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
        >
          Apply Pre-Header
        </button>
      </div>
    );
  }

  const handlePreHeaderClick = () => {
    if (setSelectedCategory) {
      setSelectedCategory("PreHeader");
    } else {
      setIsOpen(true);
    }
  };

  const divStyle = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  return (
    <button className="Content_btn" style={isOpen ? divStyle : undefined} onClick={handlePreHeaderClick}>
      <div className="lucide-icon-box">
        <TextQuote size={20} />
      </div>
      <span>Pre Header</span>
    </button>
  );
}

export default PreHeaderFun;
