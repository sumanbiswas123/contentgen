import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FileCode2 } from 'lucide-react';
import { getPM } from '../../Redux/ProductReducer/action';

const DocumentNumber = ({onContentChange, stage, onClose, setSelectedCategory}: any) => {
    const [isPMDate, setPMDate] = useState("");
    const dispatch = useDispatch();

    let PMhtml = `<tr>
    <td align="center" valign="top" style="background-color: #f0efed">
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
    <tbody><tr>
    <td height="10" style="font-size: 1px; line-height: 1px">
    &nbsp;
    </td>
    </tr>
    <tr>
    <td class="setPadding" align="center" valign="top" style="padding: 0px 20px">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody>
        <tr>
        <td height="16" align="center" valign="middle" style="
            font-family: Arial;
            font-size: 12px;
            font-weight: normal;
            color: #151515;
            line-height: 16px;
            text-align: left;
            ">
            ${isPMDate}
        </td>
        </tr>
    </tbody>
    </table>
    </td>
    </tr>
    <tr>
    <td height="10" style="font-size: 1px; line-height: 1px">
    &nbsp;
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>`;

    const openPmModal = () => {
        if (setSelectedCategory) {
            setSelectedCategory("DocumentNumber");
        }
    };

    const PMCode = () => {
        dispatch(getPM(PMhtml));
        if (onClose) onClose();
    };

    if (stage === "SidebarEditor") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Document Number & Preparation Date</label>
                    <textarea 
                        className="input-custom-field"
                        value={isPMDate}
                        onChange={(e) => setPMDate(e.target.value)} 
                        style={{ fontSize: "13px", width: "100%", minHeight: "100px", padding: "10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                        placeholder="Document number & date of preparation..."
                    ></textarea>
                </div>

                <button 
                    onClick={PMCode}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", marginTop: "6px" }}
                >
                    Apply PM Number
                </button>
            </div>
        );
    }

    return (
        <div>
            <button className="Content_btn btn-accent" style={{ cursor: "pointer", border: "none", background: "none" }} onClick={openPmModal}>
                <div className="lucide-icon-box">
                    <FileCode2 size={20} />
                </div>
                <span>Pm Number</span>
            </button>
        </div>
    );
};

export default DocumentNumber;