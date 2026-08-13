import React, { useState } from "react";

interface SectionAddBoxProps {
  blockIdx: number;
  onAddBelow: (blockIdx: number) => void;
  onDeleteBlock: (blockIdx: number) => void;
}

export const SectionAddBox: React.FC<SectionAddBoxProps> = ({
  blockIdx,
  onAddBelow,
  onDeleteBlock,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="bento-permanent-add-section-bar"
      style={{
        width: "100%",
        maxWidth: "660px",
        margin: "12px auto",
        boxSizing: "border-box",
        pointerEvents: "auto",
        zIndex: 1,
        position: "relative",
      }}
    >
      <div
        className="bento-box-drop-container"
        onClick={() => setShowMenu((prev) => !prev)}
        style={{
          width: "100%",
          height: "46px",
          border: "1px solid #d1d5db",
          background: "#f9fafb",
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          transition: "all 0.15s ease-in-out",
        }}
      >
        <span
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#6b7280",
            letterSpacing: "0.1px",
          }}
        >
          Box: Drag components here
        </span>

        {/* Box Tag Badge */}
        <div
          style={{
            position: "absolute",
            bottom: "-17px",
            right: "-1px",
            background: "#ffffff",
            border: "1px solid #64748b",
            color: "#334155",
            fontSize: "10px",
            fontWeight: 600,
            padding: "1px 6px",
            borderRadius: "1px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            fontFamily: "sans-serif",
            textTransform: "none",
          }}
        >
          Box
        </div>

        {/* Contextual Action Menu */}
        {showMenu && (
          <div
            className="bento-box-menu"
            style={{
              position: "absolute",
              top: "-40px",
              right: "0px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              display: "flex",
              gap: "4px",
              padding: "4px",
              zIndex: 100000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                onAddBelow(blockIdx);
              }}
              style={{
                background: "#10b981",
                color: "#fff",
                border: "none",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              + Add New Block Below
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                onDeleteBlock(blockIdx);
              }}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🗑 Delete Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
