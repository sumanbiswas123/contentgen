import React, { useEffect, useRef } from "react";

interface GlobalModalHostProps {
  modalContent: React.ReactNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalModalHost: React.FC<GlobalModalHostProps> = ({ modalContent, isOpen, onClose }) => {
  useEffect(() => {
    const hasPopup = typeof (window as any).init_popup_webview === "function";
    if (!hasPopup) return;

    if (isOpen) {
      // Launch 3rd transparent native WebView2
      (window as any).init_popup_webview("http://127.0.0.1:9732/GlobalModalContainer");
      setTimeout(() => {
        const x = 0;
        const y = 0;
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (typeof (window as any).sync_popup_bounds === "function") {
          (window as any).sync_popup_bounds(`${x},${y},${w},${h},true`);
        }
      }, 50);
    } else {
      if (typeof (window as any).close_popup_webview === "function") {
        (window as any).close_popup_webview();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="global-modal-wrapper export-floating-container"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{modalContent}</div>
    </div>
  );
};
