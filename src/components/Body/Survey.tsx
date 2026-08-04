import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { ClipboardList } from "lucide-react";
import { getSurvey } from "../../Redux/ProductReducer/action";

const Survey = ({onContentChange,stage,onClose,setSelectedCategory}: any) => {
  const dispatch = useDispatch();
  const [isSurveyModalOpen, setSurveyModalOpen] = useState(false);
  const [goodName, setGoodName] = useState("Good");
  const [goodLink, setGoodLink] = useState(
    "https://assets.gskinternet.com/pharma/GSKpro/Global/Survey/popup.html#Good"
  );
  const [sufficientName, setSufficientName] = useState("Sufficient");
  const [sufficientLink, setSufficientLink] = useState(
    "https://assets.gskinternet.com/pharma/GSKpro/Global/Survey/popup.html#Sufficient"
  );
  const [inSufficientName, setInSufficientName] = useState("Insufficient");
  const [inSufficientLink, setInSufficientLink] = useState(
    "https://assets.gskinternet.com/pharma/GSKpro/Global/Survey/popup.html#Insufficient"
  );
  const [surveyCaption4,setSurveyCaption4] = useState("")
  const [surveyCaptionLink4,setSurveyCaptionLink4] = useState("")
  const [surveyCaption5,setSurveyCaption5] = useState("")
  const [surveyCaptionLink5,setSurveyCaptionLink5] = useState("")
  const [isChecked, setChecked] = useState(false);
  const [title, setTitle] = useState("Please share your valuable feedback allowing us to be more relevant")

  let SurveyHtml = isChecked?`<tr>
  <td class="setPadding wrapper" data-test="survey-test" align="left" valign="top" bgcolor="#ffffff" style="padding-left:20px;padding-right:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
      <tbody>
        <tr>
          <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
        </tr>
        <tr>
          <td class="setPadding wrapper" align="left" valign="top" bgcolor="#ffffff" style="padding-left:20px;padding-right:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" >
              <tbody>
                <tr>
                  <td align="center" valign="top" style="color:#151515; font-family: Arial; font-size:18px; line-height:20px;" colspan="9"><strong>${title}</strong></td>
                </tr>
                <tr>
                  <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
                </tr>
                <tr>
    <td class="col-100">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
      <tr>
        <td  width="10" align="center" valign="top"><a href="${goodLink}" target="_blank" style="display: inline-block; border: none;color:#151515;border: none;"><img src="http://10.215.56.196:9000/assets/b8d4eefffd4aabc6-5.png" width="65" height="65" alt="Very Satisfied" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"/><br>
                    <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">${goodName}</font></a></td>
                  <td width="10" align="left" valign="top">&nbsp;</td>
                  <td  width="10" align="center" valign="top"><a href="${sufficientLink}" target="_blank" style="display: inline-block; border: none;color: #151515;border: none;"><img src="http://10.215.56.196:9000/assets/13bae17f8fc79365-4.png" width="65" height="65" alt="Satisfied" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"/><br>
                    <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">${sufficientName}</font></a></td>
                  <td  width="10" align="left" valign="top">&nbsp;</td>
                  <td width="10" align="center" valign="top"><a href="${inSufficientLink}" target="_blank" style="display: inline-block; border: none;color: #151515;border: none;"><img src="http://10.215.56.196:9000/assets/eae5cc96c02ae2d2-3.png" width="65" height="65" alt="Neutral" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"/><br>
                    <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">${inSufficientName}</font></a></td>
      </tr>
    </table>
    </td>
     <td class="col-100" width="10" align="left" valign="middle">&nbsp;</td>
    <td class="col-100">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
        <tr>
           <td  width="10" align="center" valign="top"><a href="${surveyCaptionLink4}" target="_blank" style="display: inline-block; border: none;color: #151515;border: none;"><img src="http://10.215.56.196:9000/assets/a9a02f5a01db05b3-2.png" width="65" height="65" alt="
Dissatisfied" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"/><br>
                    <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">
                    ${surveyCaption4}</font></a></td>
                  <td width="10" align="left" valign="top">&nbsp;</td>
                  <td width="10" align="center" valign="top"><a href="${surveyCaptionLink5}" target="_blank" style="display: inline-block; border: none;color: #151515;border: none;"><img src="http://10.215.56.196:9000/assets/f2cd5a4e4fa2f540-1.png" width="65" height="65" alt="Very dissatisfied" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"/><br>
                    <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">${surveyCaption5}</font></a></td>
        </tr>
      </table>
      
    </td>
                 
                </tr>
              </tbody>
            </table></td>
        </tr>
        <tr>
          <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
        </tr>
      </tbody>
    </table></td>
</tr>`: `<tr>
    <td class="setPadding wrapper" data-test="survey-test" align="left" valign="top" bgcolor="#ffffff" style="padding-left:20px;padding-right:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
        <tbody>
          <tr>
            <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
          </tr>
          <tr>
            <td align="left" valign="top" style="color:#151515; font-family: Arial; font-size:14px; line-height:20px;" colspan="3"><strong>${title}</strong></td>
          </tr>
          <tr>
            <td width="33.3%" class="col-100" align="center" valign="top" bgcolor="#ffffff" style="padding-top: 20px;color:#10c777;font-size: 14px;font-weight: bold;"><a href="${goodLink}" target="_blank" style="color:#10c777;"><img src="https://cdnae1.vod309.com/c87c97d2-53d8-4bb6-bf26-c2dcb22973df/0000000/000003/354/219/0/10/assetFiles/images/assets/good.png" width="90" alt="Good" aria-hidden="true" style="display:block; border:none;color: #151515;font-size: 12px;line-height: 18px;font-style: italic;font-weight: normal;"><br>
              <span style="display: inline-block;text-decoration: underline;line-height: 20x;">${goodName}</span></a></td>
            <td width="33.3%" class="col-100" align="center" valign="top" bgcolor="#ffffff" style="padding-top: 20px;color:#fe3f09;font-size: 14px;font-weight: bold;"><a href="${sufficientLink}" target="_blank" style="color:#fe3f09;"><img src="https://cdnae1.vod309.com/c87c97d2-53d8-4bb6-bf26-c2dcb22973df/0000000/000003/354/219/0/10/assetFiles/images/assets/sufficient.png" width="90" alt="Sufficient" aria-hidden="true" style="display:block; border:none;color: #151515;font-size: 12px;line-height: 18px;font-style: italic;font-weight: normal;"><br>
              <span style="display: inline-block;text-decoration: underline;line-height: 20x;">${sufficientName}</span></a></td>
            <td width="33.3%" class="col-100" align="center" valign="top" bgcolor="#ffffff" style="padding-top: 20px;color:#f90c26;font-size: 14px;font-weight: bold;"><a href="${inSufficientLink}" target="_blank" style="color:#f90c26;"><img src="https://cdnae1.vod309.com/c87c97d2-53d8-4bb6-bf26-c2dcb22973df/0000000/000003/354/219/0/10/assetFiles/images/assets/insufficient.png" width="90" alt="Insufficient" aria-hidden="true" style="display:block; border:none;color: #151515;font-size: 12px;line-height: 18px;font-style: italic;font-weight: normal;"><br>
              <span style="display: inline-block;text-decoration: underline;line-height: 20x;">${inSufficientName}</span></a></td>
          </tr>
          <tr>
            <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
          </tr>
        </tbody>
      </table></td>
  </tr>`;
  const openSurveyModal = () => {
    if (setSelectedCategory) {
      setSelectedCategory("Survey");
    } else {
      setSurveyModalOpen(true);
    }
  };
  const CloseSurveyModal = () => {
    setSurveyModalOpen(false);
  };

const HandleEditSurveyCode =()=>{
  onContentChange(goodName,goodLink,sufficientName,sufficientLink,inSufficientName,inSufficientLink)
  CloseSurveyModal()
}


const handleToggle = () =>{
  setChecked(prev=>!prev)
}

  const SurveyCode = () => {
    dispatch(getSurvey({ type: "Survey", code: SurveyHtml }));
    setSurveyModalOpen(false);
  };

  const divStyle = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  const styles = {
    width: "400px",
    position: "relative" as const,
    margin: "5% auto",
    backgroundColor: "#F6F6F6",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column" as const,
    maxHeight: "85vh",
    overflowY: "auto" as const
  }; 

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <label style={{ display: "flex", alignItems: "center", fontSize: "13px", cursor: "pointer", gap: "8px", fontWeight: 600, color: "#334155" }}>
          <input type="checkbox" checked={isChecked} onChange={handleToggle} />
          Enable 5-Images Rating Survey
        </label>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Survey Heading</label>
          <input
            value={title}
            placeholder="Enter Survey Title"
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Option 1 (Good)</label>
          <input value={goodName} onChange={(e) => setGoodName(e.target.value)} placeholder="Text" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "6px" }} />
          <input value={goodLink} onChange={(e) => setGoodLink(e.target.value)} placeholder="Link URL" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Option 2 (Sufficient)</label>
          <input value={sufficientName} onChange={(e) => setSufficientName(e.target.value)} placeholder="Text" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "6px" }} />
          <input value={sufficientLink} onChange={(e) => setSufficientLink(e.target.value)} placeholder="Link URL" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Option 3 (Insufficient)</label>
          <input value={inSufficientName} onChange={(e) => setInSufficientName(e.target.value)} placeholder="Text" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "6px" }} />
          <input value={inSufficientLink} onChange={(e) => setInSufficientLink(e.target.value)} placeholder="Link URL" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
        </div>

        <button 
          onClick={() => {
            dispatch(getSurvey({ type: "Survey", code: SurveyHtml }));
            if (onClose) onClose();
          }}
          style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", marginTop: "6px" }}
        >
          Apply Survey
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="Content_btn btn-accent" style={{ cursor: "pointer", border: "none", background: "none" }} onClick={openSurveyModal}>
        <div className="lucide-icon-box">
          <ClipboardList size={20} />
        </div>
        <span>Survey</span>
      </button>
    </div>
  );
};

export default Survey;
