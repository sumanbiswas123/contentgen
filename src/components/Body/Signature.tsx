import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FileSignature as SignatureLucide } from "lucide-react";
import { getSignature } from "../../Redux/ProductReducer/action";

const Signature = ({onContentChange,prevCode,stage,onClose,setSelectedCategory}: any) => {
    const dispatch = useDispatch()
    const [isSignModalOpen, SetSignModalOpen ] = useState(false)
    const [isChecked, setChecked] = useState(false);
    const [userBrandColor, setUserBrandColor]  = useState("#f36633")
    let SignHtml = isChecked?`<tr>
    <td align="center" valign="top" bgcolor="#E6E6E6" style="background-color: #e6e6e6">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
          <tr>
            <td class="setPadding" align="left" valign="top" style="padding: 0px 20px">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tbody>
                  <tr>
                    <td height="15" style="font-size: 1px; line-height: 1px">
                      &nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td align="left" valign="top" style="
                        color: ${userBrandColor};
                        font-family: Arial;
                        font-weight: bold;
                        font-size: 16px;
                        line-height: 20px;
                      ">
                      {{userName}}
                    </td>
                  </tr>
                  <tr>
                    <td align="left" valign="top" style="
                        color: #151515;
                        font-family: Arial;
                        font-size: 14px;
                        font-weight: bold;
                        line-height: 18px;
                      ">
                      {{User.Title}}
                    </td>
                  </tr>
                  <tr>
                    <td align="left" valign="top" style="
                        color: #151515;
                        font-family: Arial;
                        font-size: 14px;
                        line-height: 18px;
                      ">
                      <b>Tel</b> {{User.MobilePhone}} &nbsp;<b>Email</b>
                      <a class="email" style="
                          color: #151515;
                          font-family: Arial;
                          font-size: 14px;
                          text-decoration: none;
                        " target="new" href="mailto:{{User.Email}}">{{User.Email}}</a>
                    </td>
                  </tr>
                  <tr>
                    <td height="5" style="font-size: 1px; line-height: 1px">
                      &nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td align="left" valign="top" style="font-size: 1px">
                      <img src="https://cdnae1.vod309.com/c87c97d2-53d8-4bb6-bf26-c2dcb22973df/0000000/000003/358/557/1/4/assetFiles/images/assets/up.jpg" height="30" width="43" alt="up-icon" aria-hidden="true" style="
                          display: inline-block;
                          border: none;
                          color: #151515;
                          font-size: 12px;
                          line-height: 18px;
                          font-style: italic;
                          font-weight: normal;
                        ">
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>`:`<tr>

    <td align="center" valign="top" bgcolor="#E6E6E6" style="background-color:#E6E6E6;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
          <tr>
            <td class="setPadding" align="left" valign="top" style="padding:0px 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tbody>
                  <tr>
                    <td align="left" valign="top" style="font-size:1px;"><img src="https://cdnae1.vod309.com/c87c97d2-53d8-4bb6-bf26-c2dcb22973df/0000000/000003/354/219/0/10/assetFiles/images/assets/down.jpg" width="45" title="title_text" alt="down arrow" aria-hidden="true" style="display:inline-block; border:none;color: #151515;font-size: 12px;line-height: 18px;font-style: italic;font-weight: normal;"></td>
                  </tr>
                  <tr>
                    <td height="5" style="font-size:1px; line-height:1px;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td align="left" data-test="footer-signature-usernName" valign="top" style="color:${userBrandColor}; font-family: Arial; font-weight: bold; font-size:16px; line-height:22px;"> {{userName}} </td>
                  </tr>
                  <tr>
                    <td align="left" valign="top" data-test="footer-signature-title" style="color:#151515; font-family: Arial; font-size:14px; font-weight:bold; line-height:20px;"> {{User.Title}} </td>
                  </tr>
                  <tr>
                    <td align="left" valign="top" data-test="footer-signature-mobAndEmail" style="color:#151515; font-family: Arial; font-size:14px; line-height:20px;"><b>Tel</b> {{User.MobilePhone}} &nbsp;<b>Email</b> <a class="email" style="color:#151515; font-family: Arial; font-size:14px;line-height:20px; text-decoration:none;" target="new" href="mailto:{{User.Email}}">{{User.Email}}</a></td>
                  </tr>
                  <tr>
                    <td height="15" style="font-size:1px; line-height:1px;">&nbsp;</td>
                  </tr>
                </tbody>
              </table></td>
          </tr>
        </tbody>
      </table></td>
  </tr>`;

  const openSignModal = () => {
    if (setSelectedCategory) {
      setSelectedCategory("Signature");
    } else {
      SetSignModalOpen(true);
    }
  };
  const CloseSignModal =()=>{
    SetSignModalOpen(false)
  }

  const HandleSignEditCode =()=>{
    onContentChange(SignHtml)
    CloseSignModal()
  }
  const handleToggle = () =>{
    setChecked(prev=>!prev)
  }


  const SignCode=()=>{
    dispatch(getSignature({type:"Signature",code:SignHtml}))
    SetSignModalOpen(false)
  }

  const divStyle = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  if (stage === "SidebarEditor") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <label style={{ display: "flex", alignItems: "center", fontSize: "13px", cursor: "pointer", gap: "8px", fontWeight: 600, color: "#334155" }}>
          <input type="checkbox" checked={isChecked} onChange={handleToggle} />
          Switch to Up Arrow
        </label>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Brand Accent Color</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <input
              type="color"
              value={userBrandColor.startsWith("#") ? userBrandColor : "#f36633"}
              onChange={(e) => setUserBrandColor(e.target.value)}
              style={{ width: "38px", height: "38px", minWidth: "38px", padding: "2px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", backgroundColor: "#ffffff", boxSizing: "border-box" }}
            />
            <input
              value={userBrandColor}
              onChange={(e) => setUserBrandColor(e.target.value)}
              placeholder="#f36633"
              style={{ flex: 1, minWidth: 0, width: "100%", padding: "8px 10px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            />
          </div>
        </div>

        <button 
          onClick={() => {
            dispatch(getSignature({ type: "Signature", code: SignHtml }));
            if (onClose) onClose();
          }}
          style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px", marginTop: "6px" }}
        >
          Apply Signature
        </button>
      </div>
    );
  }

  const styles = {
    width: "300px",
    position: "relative" as const,
    margin: "10% auto",
    backgroundColor: "#F6F6F6",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column" as const
  };  

  return (
    <div>
      <button className="Content_btn btn-accent" style={{ cursor: "pointer", border: "none", background: "none" }} onClick={openSignModal}>
        <div className="lucide-icon-box">
          <SignatureLucide size={20} />
        </div>
        <span>Signature</span>
      </button>
    </div>
  );
};

export default Signature;
