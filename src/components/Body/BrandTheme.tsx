import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Palette } from "lucide-react";
import { getBrandTheme } from "../../Redux/ProductReducer/action";

function BrandTheme({ stage, onClose, setSelectedCategory }: any) {
  const dispatch = useDispatch();
  const [isTheme, setTheme] = useState("#151515");
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const onOpen = () => setIsOpen(true);
  const onCloseModal = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  function HandleTheme() {
    dispatch(getBrandTheme(isTheme));
    localStorage.setItem("isTheme", isTheme);
    onCloseModal();
  }

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
            Brand Theme Color (Hex or Name)
          </label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <input
              type="color"
              value={isTheme.startsWith("#") ? isTheme : "#151515"}
              onChange={(e) => setTheme(e.target.value)}
              style={{ width: "38px", height: "38px", minWidth: "38px", padding: "2px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", backgroundColor: "#ffffff", boxSizing: "border-box" }}
            />
            <input
              type="text"
              value={isTheme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="#151515"
              style={{ flex: 1, minWidth: 0, width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>
          <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
            Applies to footer compliance links and primary brand elements.
          </span>
        </div>

        <button
          onClick={HandleTheme}
          style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", marginTop: "8px" }}
        >
          Apply Brand Theme
        </button>
      </div>
    );
  }

  const handleBrandThemeClick = () => {
    if (setSelectedCategory) {
      setSelectedCategory("BrandTheme");
    } else {
      if (isOpen) onClose();
      else onOpen();
    }
  };

  const divStyle = {
    background:
      "linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box",
    border: "2px solid transparent",
  };

  return (
    <button
      className="Content_btn btn-accent"
      title="this color applies to the footer links"
      style={isOpen ? { ...divStyle, cursor: "pointer", border: "none", background: "none" } : { cursor: "pointer", border: "none", background: "none" }}
      onClick={handleBrandThemeClick}
    >
      <div className="lucide-icon-box">
        <Palette size={20} />
      </div>
      <span>Brand Theme</span>
    </button>
  );
}

export default BrandTheme;
