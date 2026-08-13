import React from "react";
import { EMAIL_COMPONENTS_CONFIG } from "../../config/componentsConfig";
import { useCanvasEngine } from "../../hooks/useCanvasEngine";
import { LayoutGrid, Image, Type, Link, Video, Minus } from "lucide-react";
import "./ContentGenGridBuilder.css";

const ContentGenGridBuilder: React.FC = () => {
  const { addBlock } = useCanvasEngine();

  const handleDragStart = (e: React.DragEvent, componentKey: string) => {
    const config = EMAIL_COMPONENTS_CONFIG[componentKey];
    if (!config) return;
    const dragData = {
      type: "ADD_BLOCK",
      blockType: config.id,
      code: config.generateHtml()
    };
    (window as any).__activeDragPayload = dragData;
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    e.dataTransfer.setData("Text", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "all";
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
            draggable={true}
            onDragStart={(e) => handleDragStart(e, "BLOCK")}
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
            draggable={true}
            onDragStart={(e) => handleDragStart(e, "IMAGE")}
            title="Drag Image component into any block"
          >
            <div className="icon-wrapper">
              <Image size={18} />
            </div>
            <span>Image</span>
          </div>

          <div
            className="contentgen-element-card"
            draggable={true}
            onDragStart={(e) => handleDragStart(e, "TEXT")}
            title="Drag Paragraph component into any block"
          >
            <div className="icon-wrapper">
              <Type size={18} />
            </div>
            <span>Paragraph</span>
          </div>

          <div
            className="contentgen-element-card"
            draggable={true}
            onDragStart={(e) => handleDragStart(e, "CTA")}
            title="Drag Button component into any block"
          >
            <div className="icon-wrapper">
              <Link size={18} />
            </div>
            <span>Button</span>
          </div>

          <div
            className="contentgen-element-card"
            draggable={true}
            onDragStart={(e) => handleDragStart(e, "VIDEO")}
            title="Drag Video component into any block"
          >
            <div className="icon-wrapper">
              <Video size={18} />
            </div>
            <span>Video Card</span>
          </div>

          <div
            className="contentgen-element-card"
            draggable={true}
            onDragStart={(e) => handleDragStart(e, "DIVIDER")}
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
