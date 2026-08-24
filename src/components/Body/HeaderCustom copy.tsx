import React from 'react'
import { Heading as LayoutHeader } from 'lucide-react';
import "./HeaderCustom.css"

import { EMAIL_COMPONENTS_CONFIG } from '@/config/componentsConfig';

const HeaderCustom = ({id}) => {
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
    <div>
      <button className='Content_btn' draggable={true}
        onDragStart={(e) => handleDragStart(e, 'HEADER')}>
        <div className="lucide-icon-box">
          <LayoutHeader size={20} />
        </div>
        <span>Header</span>
      </button>
    </div>
  )
}

export default HeaderCustom