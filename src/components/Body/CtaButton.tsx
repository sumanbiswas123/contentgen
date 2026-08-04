import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { MousePointerClick } from "lucide-react";
import { getCta } from "../../Redux/ProductReducer/action";

const CtaButton = ({onContentChange,prevCode,stage,onClose,setSelectedCategory}: any) => {
  const dispatch = useDispatch();
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [ctaBrandColor, setCtaBrandColor] = useState("");
  const [ctaAlign, setCtaAlign] = useState("");

  const CtaHtml = `<tr>
        <td align="${ctaAlign}" data-test="cta-test" class="setPadding" valign="top" style="padding:0px 15px;border-radius:30px"><table width="auto" border="0" cellspacing="0" cellpadding="0">
        <tbody>
        <tr>
        <td align="center" valign="middle" width="auto" bgcolor="${ctaBrandColor}" style="color:#ffffff; font-family: arial; font-size: 16px; font-weight: bold;  line-height: 20px; padding: 10px 20px;border-radius:30px"><a href="${ctaLink}" target="_blank" style="color:#ffffff;text-decoration:none;">${ctaText}</a></td>
        </tr>
        </tbody>
        </table></td>
        </tr>`;

  const openButtonModal = () => {
    if (setSelectedCategory) {
      setSelectedCategory("CtaButton");
    }
  };

  const HandleEditButton = () => {
    onContentChange(ctaText, ctaLink, ctaBrandColor, ctaAlign);
    if (onClose) onClose();
  };

  const ButtonCode = () => {
    dispatch(getCta({ type: "CtaButton", code: CtaHtml }));
    if (onClose) onClose();
  };

  useEffect(() => {
    setCtaAlign(prevCode?.ctaAlign || "center");
    setCtaBrandColor(prevCode?.ctaBrandColor || "#f36633");
    setCtaLink(prevCode?.ctaLink || "");
    setCtaText(prevCode?.ctaText || "Click Here");
  }, [prevCode]);

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>CTA Button Text</label>
          <input
            value={ctaText}
            placeholder="Click Here"
            onChange={(e) => setCtaText(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Destination URL</label>
          <input
            value={ctaLink}
            placeholder="https://..."
            onChange={(e) => setCtaLink(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Button Color</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <input
              type="color"
              value={ctaBrandColor.startsWith("#") ? ctaBrandColor : "#f36633"}
              onChange={(e) => setCtaBrandColor(e.target.value)}
              style={{ width: "38px", height: "38px", minWidth: "38px", padding: "2px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", backgroundColor: "#ffffff", boxSizing: "border-box" }}
            />
            <input
              value={ctaBrandColor}
              onChange={(e) => setCtaBrandColor(e.target.value)}
              placeholder="#f36633"
              style={{ flex: 1, minWidth: 0, width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Alignment</label>
          <select
            value={ctaAlign}
            onChange={(e) => setCtaAlign(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", backgroundColor: "#ffffff" }}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <button 
          onClick={stage === "Edit" ? HandleEditButton : ButtonCode}
          style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", marginTop: "6px" }}
        >
          Apply CTA Button
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="Content_btn" style={{ cursor: "pointer", border: "none", background: "none" }} onClick={openButtonModal}>
        <div className="lucide-icon-box">
          <MousePointerClick size={20} />
        </div>
        <span>Cta Button</span>
      </button>
    </div>
  );
};

export default CtaButton;
