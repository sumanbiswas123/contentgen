import React from "react";
import { EMAIL_COMPONENTS_CONFIG } from "../../config/componentsConfig";
import { useCanvasEngine } from "../../hooks/useCanvasEngine";
import { LayoutGrid, Image, Type, Link, Video, Minus } from "lucide-react";
import "./ContentGenGridBuilder.css";

const ContentGenGridBuilder: React.FC = () => {
  const { addBlock } = useCanvasEngine();

  const handleMouseDown = (e: React.MouseEvent, componentKey: string) => {
    const config = EMAIL_COMPONENTS_CONFIG[componentKey];
    if (!config) return;
    const dragData = {
      type: "ADD_BLOCK",
      blockType: config.id,
      code: config.generateHtml()
    };
    (window as any).__activeDragPayload = dragData;
    (window as any).__isCustomDragging = true;

    // Create floating ghost element
    let ghost = document.getElementById("native-drag-ghost");
    if (!ghost) {
      ghost = document.createElement("div");
      ghost.id = "native-drag-ghost";
      ghost.style.position = "fixed";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "999999";
      ghost.style.padding = "8px 16px";
      ghost.style.background = "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
      ghost.style.color = "#ffffff";
      ghost.style.borderRadius = "8px";
      ghost.style.fontSize = "12px";
      ghost.style.fontWeight = "700";
      ghost.style.boxShadow = "0 10px 25px rgba(2, 132, 199, 0.4)";
      ghost.style.transform = "translate(-50%, -50%)";
      ghost.style.transition = "opacity 0.15s ease";
      document.body.appendChild(ghost);
    }
    ghost.textContent = `⚡ Drop ${config.name}`;
    ghost.style.display = "block";
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;

    const onMouseMove = (moveEvt: MouseEvent) => {
      if (ghost) {
        ghost.style.left = `${moveEvt.clientX}px`;
        ghost.style.top = `${moveEvt.clientY}px`;
      }
    };

    const onMouseUp = (upEvt: MouseEvent) => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (ghost) {
        ghost.style.display = "none";
      }
      (window as any).__isCustomDragging = false;
      
      // If mouse released over canvas area (x > 260px)
      if (upEvt.clientX > 260 && (window as any).__activeDragPayload) {
        window.postMessage({ type: "child-mouse-up" }, "*");
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="contentgen-grid-builder-container">
      {/* Primary Layout Section: Unified Block Component */}
      <div className="contentgen-builder-section">
        <div className="contentgen-section-header">
          <span className="section-title">Layout Section</span>
        </div>

        <div className="contentgen-grid-cards">
          {/* Single Core Block Component */}
          <div
            className="contentgen-grid-card single-block-card"
            onMouseDown={(e) => handleMouseDown(e, "BLOCK")}
            title="Drag to add parent block section onto dot matrix canvas"
          >
            <div className="contentgen-grid-preview col-1">
              <div className="preview-cell" style={{ background: "rgba(2, 132, 199, 0.1)", border: "1px dashed #0284c7", color: "#0284c7" }}>
                <LayoutGrid size={16} style={{ marginRight: "4px" }} />
                Block (Cover)
              </div>
            </div>
            <div className="contentgen-card-info">
              <span className="card-name">Block Section</span>
              <span className="card-desc">Drag to canvas (Auto-dividing child columns)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Atomic Email Components */}
      <div className="contentgen-builder-section" style={{ marginTop: "16px" }}>
        <div className="contentgen-section-header">
          <span className="section-title">Components</span>
        </div>

        <div className="contentgen-elements-grid">
          <div
            className="contentgen-element-card"
            onMouseDown={(e) => handleMouseDown(e, "IMAGE")}
            title="Drag Image component into any block"
          >
            <div className="icon-wrapper">
              <Image size={18} />
            </div>
            <span>Image</span>
          </div>

          <div
            className="contentgen-element-card"
            onMouseDown={(e) => handleMouseDown(e, "TEXT")}
            title="Drag Paragraph component into any block"
          >
            <div className="icon-wrapper">
              <Type size={18} />
            </div>
            <span>Paragraph</span>
          </div>

          <div
            className="contentgen-element-card"
            onMouseDown={(e) => handleMouseDown(e, "CTA")}
            title="Drag Button component into any block"
          >
            <div className="icon-wrapper">
              <Link size={18} />
            </div>
            <span>Button</span>
          </div>

          <div
            className="contentgen-element-card"
            onMouseDown={(e) => handleMouseDown(e, "VIDEO")}
            title="Drag Video component into any block"
          >
            <div className="icon-wrapper">
              <Video size={18} />
            </div>
            <span>Video Card</span>
          </div>

          <div
            className="contentgen-element-card"
            onMouseDown={(e) => handleMouseDown(e, "DIVIDER")}
            title="Drag Divider line into any block"
          >
            <div className="icon-wrapper">
              <Minus size={18} />
            </div>
            <span>Divider</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenGridBuilder;
