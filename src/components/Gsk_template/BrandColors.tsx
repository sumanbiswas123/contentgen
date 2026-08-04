import React, { useState } from "react";
import copy from "clipboard-copy";
import { Palette as PaletteIcon } from "lucide-react";
import { GlobalModalHost } from "../ModalHost/GlobalModalHost";

const BrandColorsTable = ({ stage, onClose, setSelectedCategory }: any) => {
    const [isModalOpen, setModalOpen] = useState(false)

  const brand_colors: any = {
    ANORO: ["#AC1E36", " #5A6780", "#3C3835"],
    "Augmentin-Global": ["#dc2127", "#ec7a24", "#f6ea02"],
    "Augmentin-India": ["#00a54d", "#9d6c29", "#fcf3b0"],
    "Augmentin-Pakistan": ["#6e3694"],
    "Augmentin-Brazil": ["#6e3694", "#ec7a24"],
    Avamys: ["#FF6600", "#164194", "#42BAC7", "#54565B"],
    Avodart: ["#CA0538", "#AC0033", "#213C47"],
    Duodart: ["#AC0033", "#1C3F94", "#264C59"],
    "Benlysta-primary": [
      "#661c78",
      "#fdc82f",
      "#675c53",
      "#988f86",
      "#f4f4f4",
      "#262626",
    ],
    "Benlysta-secondary": [
      "#661c78",
      "#83afb4",
      "#dcdcdc",
      "#6c6c6c",
      "#707070",
      "#1e1e1e",
    ],
    BEXSERO: ["#68002A", "#00467F", "#009AC7", "#F47B20", "#58595B", "#A7A9AC"],
    Duac: ["#0c4da2", "#00aecd", "#7fc241"],
    VATEs: ["#D06F00", "#E8500E", "#E5007D"],
    Bactroban: ["#246FA6", "#52B5DC", "#F08486", "#585856"],
    TOCTINO: ["#CC6633", "FFA100", "0018A8", "#999999", "#49332a"],
    DOVOTO: ["#EA1B75", " #8E1D58", "#612166", "#F7C4BF"],
    Engerix: ["#004C98", "#007973", "#4D4D4D"],
    Havrix: ["#FAEA27", "#595857", "#00A0B0"],
    Infanrix: ["#4A8F8C", "#F0AA3C", "#DE6F8E", "#3394A6"],
    MENVEO: ["#D90369", "#5F116A", "#58595B", "#D48E15", "#A7A9AC"],
    Nucala: ["#630716", "#D81A26", "#eaeaea", "#46494b", "#1f1f1f"],
    "ZEJULA(Primary)": ["#25205E", " #00A2C2", "#00758B", "#585353"],
    "ZEJULA(Secondary)": ["#FD495C", " #D30053", "#FFB600"],
    "ZEJULA(for logo purpose)": ["#003C71", "#88DBDF", "#514689"],
    "Seretide(Primary colour)": ["#5d2d8e"],
    "Seretide(Secondary accent colour)": ["#995cdb"],
    Synflorix: ["#304200", "#004E3E"],
    "Urology(DUODART COLOURS)": ["#AC0033", "#1C3F94", "#264C59"],
    "Urology(AVODART COLOURS)": ["#F36633", "#003341", "#68828D"],
    ViiV: ["#e40046", "#071d49", "#702082", "#5bc2e7", "#d0d3d4"],
    Toctino: ["#FFA100", "#0018A8", "#49332A", "#8094A6", "#E36F1E"],
  };

  const handleBrandColorsClick = () => {
    if (setSelectedCategory) {
      setSelectedCategory("BrandColorsTable");
    } else {
      openModal();
    }
  };

  const openModal =()=>{
      setModalOpen(true)
  }
  const closeModal =()=>{
      setModalOpen(false)
  }

  const handleCopyColor = (copyText: string) => {
    const encodedURL = encodeURIComponent(`${copyText}`);
    const decodedURL = decodeURIComponent(encodedURL);
    copyToClipboard(decodedURL);
  };

  const copyToClipboard = (text: string) => {
    copy(text)
      .then(() => {
        alert(`Copied to Clipboard: ${text}`);
      })
      .catch((error) => {
        console.error("Copy to clipboard failed:", error);
      });
  };

  const renderTable = () => {
    const rows = [];

    for (const key in brand_colors) {
      const colors = brand_colors[key];
      const cells = [<td key={key} style={{ fontWeight: "bold", padding: "4px" }}>{key}</td>];

      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        cells.push(
          <td
            key={`${key}-${i}`}
            style={{ backgroundColor: color, cursor: "pointer", padding: "8px", color: "#fff", textShadow: "1px 1px 2px #000", fontSize: "11px", textAlign: "center" as const, borderRadius: "4px" }}
            title={`${color} click to copy`}
            onClick={() => handleCopyColor(color)}
          >
            {color}
          </td>
        );
      }

      rows.push(<tr key={key}>{cells}</tr>);
    }

    return (
      <table cellPadding={"3px"} cellSpacing={"3px"} style={{ width: "100%", borderCollapse: "separate", borderSpacing: "5px" }}>
        <tbody>{rows}</tbody>
      </table>
    );
  };

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          Click any color block below to copy hex code to clipboard.
        </span>
        <div style={{ overflowY: "auto", maxHeight: "65vh", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px", background: "#f8fafc" }}>
          {renderTable()}
        </div>
      </div>
    );
  }

  const divStyle = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  return (
    <div>
      <button className="Content_btn btn-accent" onClick={handleBrandColorsClick}>
        <div className="lucide-icon-box">
          <PaletteIcon size={20} />
        </div>
        <span>Brand Colors</span>
      </button>

      <GlobalModalHost
        isOpen={isModalOpen}
        onClose={closeModal}
        modalContent={
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", width: "560px", maxHeight: "80vh", display: "flex", flexDirection: "column" as const, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const, borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "15px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>Brand Colors Palette</h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            <div id="list" style={{ overflowY: "auto" as const, flex: 1, paddingRight: "5px" }}>
              {renderTable()}
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end" as const, borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
              <button 
                onClick={closeModal}
                style={{ padding: "8px 18px", backgroundColor: "#3182ce", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
              >
                Done
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default BrandColorsTable;
