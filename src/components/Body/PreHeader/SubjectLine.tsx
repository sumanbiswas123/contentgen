import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { MailCheck } from "lucide-react";
import { getSubjectLine } from "../../../Redux/ProductReducer/action";

function SubjectLineFun({ stage, onClose, setSelectedCategory }: any) {
  const dispatch = useDispatch();
  const [subjectLineText, setSubjectLineText] = useState("Hey satish!");
  const [isOpen, setIsOpen] = useState(false);

  function setSubjectLine() {
    dispatch(getSubjectLine(subjectLineText));
    setIsOpen(false);
    if (onClose) onClose();
  }

  const handleSubjectClick = () => {
    if (setSelectedCategory) {
      setSelectedCategory("SubjectLineFun");
    } else {
      setIsOpen(!isOpen);
    }
  };

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Subject Line</label>
          <input
            type="text"
            value={subjectLineText}
            onChange={(e) => setSubjectLineText(e.target.value)}
            placeholder="Enter Subject line"
            style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />
          <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
            This title will appear as the main subject line in the recipient's inbox.
          </span>
        </div>

        <button 
          onClick={setSubjectLine}
          style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
        >
          Apply Subject Line
        </button>
      </div>
    );
  }

  const divStyle = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  return (
    <button 
      className="Content_btn" 
      style={isOpen ? divStyle : undefined}
      onClick={handleSubjectClick}
    >
      <div className="lucide-icon-box">
        <MailCheck size={20} />
      </div>
      <span>Subject Line</span>
    </button>
  );
}

export default SubjectLineFun;
