import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface SaveTemplateProps {
  buttonClass?: string;
  buttonStyle?: React.CSSProperties;
}

const SaveTemplate: React.FC<SaveTemplateProps> = ({ buttonClass = "MenuButtons", buttonStyle }) => {
  const [isModalSaveOpen, setIsModalSaveOpen] = useState(false);
  const [isPmId, setPmId] = useState("");
  const [isDraftId, setDraftID] = useState<string>("");

  const onCloseSaveModal = () => {
    setIsModalSaveOpen(false);
  };
    
  const onOpenSaveModal = () => {
    setIsModalSaveOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    const Time = `Date: ${day}/${month}/${year} Time: ${hours}:${minutes}:${seconds}`;

    const bodyLs = JSON.parse(localStorage.getItem("body") || "[]");
    const subjectlineLs = localStorage.getItem("subjectline") || "";
    const preheaderLs = localStorage.getItem("preheader") || "";
    const pmdateLs = localStorage.getItem("pmdate") || "";
    const headerLs = localStorage.getItem("header") || "";
    const footerLs = localStorage.getItem("footer") || "";
    const mailImagesLs = JSON.parse(localStorage.getItem("mailImages") || "[]");
    
    const userName = sessionStorage.getItem("username") || "";
    const timeTaken = Number(Cookies.get('capsul')) || 0;
    const jiraId = JSON.parse(localStorage.getItem("TrackerId") || "{}");
    const isTheme = localStorage.getItem("isTheme") || '';
    
    const TemplateDataObj = {
      body: bodyLs,
      subjectline: subjectlineLs,
      preheader: preheaderLs,
      pmdate: pmdateLs,
      header: headerLs,
      footer: footerLs,
      mailImages: mailImagesLs,
      PmId: isPmId,
      DraftId: isDraftId,
      Time: Time,
      User: userName,
      timeTaken: timeTaken,
      jiraId: jiraId,
      isTheme: isTheme
    };
    
    axios.post(`${process.env.REACT_APP_SERVER_URL || 'http://10.215.56.196:9000'}/templates`, TemplateDataObj)
      .then(() => {
        onCloseSaveModal();
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  return (
    <div style={{ display: "inline-block" }}>
      <button className={buttonClass} style={buttonStyle} onClick={onOpenSaveModal}>
        Save Template
      </button>

      {isModalSaveOpen && (
        <div className="modal-dialog-overlay" onClick={onCloseSaveModal}>
          <div className="modal-dialog-content-full" style={{ maxWidth: '450px', height: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <h3>Confirm <span style={{ color: "var(--accent-success)" }}>Save</span></h3>
              <button className="btn-modal-close" onClick={onCloseSaveModal}>✘</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p>Are you sure you want to Save this as New Email Template?</p>
                <input 
                  className="input-custom-field" 
                  placeholder="PM NUMBER" 
                  value={isPmId} 
                  onChange={(e) => setPmId(e.target.value)}  
                  required
                />
                <input 
                  className="input-custom-field" 
                  placeholder="Draft Number" 
                  value={isDraftId} 
                  type="number" 
                  onChange={(e) => setDraftID(e.target.value)}
                />
              </div>
              <div className="modal-dialog-footer" style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-action-cancel" onClick={onCloseSaveModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-action-submit-theme">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveTemplate;