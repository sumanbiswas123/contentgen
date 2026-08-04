import React from 'react';
import { FaRegEdit, FaRegClock, FaUser, FaTag, FaFileAlt, FaInfoCircle } from 'react-icons/fa';

interface PreviewEmailModeProps {
  templateData: any;
  onUseTemplate?: () => void;
}

const PreviewEmailMode: React.FC<PreviewEmailModeProps> = ({ templateData, onUseTemplate }) => {
  let fullBody = "";
  templateData?.body?.forEach((e: any) => {
    fullBody += e.code || "";
  });

  const std_temp = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="EN">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>${templateData?.subjectline || ''}</title>
    <style type="text/css">
      body, #body_style { width: 100% !important; background: #ffffff; font-family: Arial, sans-serif; color: #151515; line-height: 1.4; margin: 0; padding: 0; }
      ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
      * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      img { max-width: 100% !important; height: auto !important; display: block !important; border: none !important; }
      table { border-collapse: collapse; }
      table.Container { width: 100% !important; max-width: 600px !important; margin: 0 auto; }
    </style>
  </head>
  <body yahoo="fix">
    ${templateData?.preheader ? `<div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;opacity:0;overflow:hidden;">${templateData.preheader}</div>` : ''}
    <table width="100%" bgcolor="#F5F5F5" border="0" cellspacing="0" cellpadding="0" role="presentation">
      <tbody>
        <tr>
          <td align="center" valign="top">
            <table bgcolor="#ffffff" class="Container" width="600" border="0" cellspacing="0" cellpadding="0" align="center" role="presentation">
              <tbody>
                ${templateData?.header || ''}
                ${fullBody}
                ${templateData?.footer || ''}
                ${templateData?.pmdate || ''}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

  return (
    <div className="template-preview-modal-split">
      {/* Left Iframe Preview Area */}
      <div className="modal-preview-left-pane">
        <div className="modal-iframe-frame">
          <iframe
            srcDoc={std_temp}
            className="modal-preview-iframe"
            title="email_preview"
          ></iframe>
        </div>
      </div>

      {/* Right Metadata Details Sidebar Pane */}
      <div className="modal-details-right-pane">
        <div className="modal-details-card">
          <div className="modal-details-header">
            <div className="details-header-icon">
              <FaInfoCircle size={18} />
            </div>
            <h4>Template Information</h4>
          </div>

          <div className="modal-details-grid">
            <div className="meta-detail-item">
              <div className="meta-detail-label"><FaTag className="meta-icon" /> PM ID</div>
              <div className="meta-detail-value highlight-pm-id">{templateData?.PmId || "N/A"}</div>
            </div>

            <div className="meta-detail-item">
              <div className="meta-detail-label"><FaFileAlt className="meta-icon" /> Draft Version</div>
              <div className="meta-detail-value"><span className="meta-draft-chip">Draft {templateData?.DraftId ?? "1"}</span></div>
            </div>

            <div className="meta-detail-item">
              <div className="meta-detail-label"><FaUser className="meta-icon" /> Created By</div>
              <div className="meta-detail-value">{templateData?.CreatedBy || templateData?.User || "Unknown"}</div>
            </div>

            <div className="meta-detail-item">
              <div className="meta-detail-label"><FaUser className="meta-icon" /> Last Modified By</div>
              <div className="meta-detail-value">{templateData?.User || "Unknown"}</div>
            </div>

            <div className="meta-detail-item">
              <div className="meta-detail-label"><FaRegClock className="meta-icon" /> Creation Date</div>
              <div className="meta-detail-value">{templateData?.CreatedAt || templateData?.CreatedTime || templateData?.Time || "N/A"}</div>
            </div>

            <div className="meta-detail-item">
              <div className="meta-detail-label"><FaRegClock className="meta-icon" /> Last Modified Date</div>
              <div className="meta-detail-value">{templateData?.Time || "N/A"}</div>
            </div>

            {templateData?.subjectline && (
              <div className="meta-detail-item full-width">
                <div className="meta-detail-label">Subject Line</div>
                <div className="meta-detail-box">{templateData.subjectline}</div>
              </div>
            )}

            {templateData?.preheader && (
              <div className="meta-detail-item full-width">
                <div className="meta-detail-label">Preheader</div>
                <div className="meta-detail-box text-muted-box">{templateData.preheader}</div>
              </div>
            )}
          </div>

          {onUseTemplate && (
            <div className="modal-details-footer">
              <button className="btn-modal-action-primary" onClick={onUseTemplate}>
                <FaRegEdit /> Load & Edit Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewEmailMode;