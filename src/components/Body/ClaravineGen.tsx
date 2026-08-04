import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import DeeplinkGen from './DeepLinkGen';

const ClaravineGen = ({stage, onClose, setSelectedCategory}: any) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    if (setSelectedCategory) {
      setSelectedCategory("ClaravineGen");
    } else {
      setModalOpen(true);
    }
  };

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <DeeplinkGen />
      </div>
    );
  }

  return (
    <div>
      <button className="Content_btn btn-accent" style={{ cursor: "pointer", border: "none", background: "none" }} onClick={openModal}>
        <div className="lucide-icon-box">
          <Link2 size={20} />
        </div>
        <span>Claravine</span>
      </button>
    </div>
  );
};

export default ClaravineGen;
