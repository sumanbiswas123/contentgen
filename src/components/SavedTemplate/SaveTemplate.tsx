import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { showCanvasModal } from '../../utils/canvasModal';

interface SaveTemplateProps {
  buttonClass?: string;
  buttonStyle?: React.CSSProperties;
}

const SaveTemplate: React.FC<SaveTemplateProps> = ({ buttonClass = "MenuButtons", buttonStyle }) => {
  const onOpenSaveModal = () => {
    showCanvasModal({
      title: "Confirm",
      titleAccent: "Save",
      message: "Are you sure you want to Save this as New Email Template?",
      confirmLabel: "Save Template",
      confirmVariant: "success",
      inputs: [
        { id: "pmId", placeholder: "PM NUMBER *", required: true },
        { id: "draftId", placeholder: "Draft Number", type: "number" }
      ],
      onConfirm: (values) => {
        executeSave(values.pmId || "", values.draftId || "");
      }
    });
  };

  const executeSave = (pmIdVal: string, draftIdVal: string) => {
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
      PmId: pmIdVal,
      DraftId: draftIdVal,
      Time: Time,
      User: userName,
      timeTaken: timeTaken,
      jiraId: jiraId,
      isTheme: isTheme
    };
    
    axios.post(`${process.env.REACT_APP_SERVER_URL || 'http://10.215.56.196:9000'}/templates`, TemplateDataObj)
      .catch((err) => {
        console.error(err.message);
      });
  };

  return (
    <div style={{ display: "inline-block" }}>
      <button className={buttonClass} style={buttonStyle} onClick={onOpenSaveModal}>
        Save Template
      </button>
    </div>
  );
};

export default SaveTemplate;