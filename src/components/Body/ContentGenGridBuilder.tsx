import React from "react";
import { EMAIL_COMPONENTS_CONFIG } from "../../config/componentsConfig";
import { Image, Type, Link, Video, Minus } from "lucide-react";
import "./ContentGenGridBuilder.css";

const ContentGenGridBuilder: React.FC = () => {
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

  const components = [
    { key: "IMAGE", label: "Image", icon: Image, tooltip: "Drag Image component into canvas" },
    { key: "TEXT", label: "Paragraph", icon: Type, tooltip: "Drag Paragraph component into canvas" },
    { key: "CTA", label: "Button", icon: Link, tooltip: "Drag Button component into canvas" },
    { key: "VIDEO", label: "Video Card", icon: Video, tooltip: "Drag Video component into canvas" },
    { key: "DIVIDER", label: "Divider", icon: Minus, tooltip: "Drag Divider line into canvas" }  ];

  return (
    <div className="contentgen-grid-builder-container">
      <div className="contentgen-elements-grid">
        {components.map((comp) => {
          const IconComponent = comp.icon;
          return (
            <div
              key={comp.key}
              className="contentgen-element-card"
              draggable={true}
              onDragStart={(e) => handleDragStart(e, comp.key)}
              title={comp.tooltip}
            >
              <div className="icon-wrapper">
                <IconComponent size={20} />
              </div>
              <span className="element-label">{comp.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentGenGridBuilder;

