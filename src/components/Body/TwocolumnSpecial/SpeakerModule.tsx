import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { getSpeakerModule } from "../../../Redux/ProductReducer/action";
import SpeakerModuleIMG from "./Thumbs/SpeakerModule.png";
import EditorReuse from "../../EditorSkills/EditorReusable";
import ImageReusable from "../../EditorSkills/ImageReusable";

const SpeakerModule = ({onContentChange,prevCode,stage}) => {
  const [isSpeakerModuleModalOpen, setSpeakerModuleModalOpen] = useState(false);
  const [isMainHeadingModal, setMainHeadingModal] = useState(false);
  const [mainHeading, SetMainHeading] = useState("");
  const [mainTitle, setMainTile] = useState("")
  const [speakerHeadingStyles, setSpeakerHeadingStyles] = useState<any>({});
  const [speakerTitleStyles, setSpeakerTitleStyles] = useState<any>({})
  const [isContentsModal, setContentsModal] = useState(false);
  const [speakerImgStyles, setSpeakerImgStyles] = useState<any>({});
  const [ isTitleModal, setTitleModal] = useState(false)
  const [isSpeakarDescription, setSpeakarDescription] = useState(false)
  const [ isDescriptionStyles, setDescriptionStyles] = useState<any>({})
  const [ isDescription, setDescription] = useState("")
  

  const dispatch = useDispatch();

  let SpeakerHtml = speakerImgStyles.imgBackgroundLink?`<tr>
    <td align="center" valign="top" style="background-color:#FFFFFF;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody><tr>
          <td class="setPadding" align="left" valign="top" style="padding:0px 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <!-- Spacing -->
              
              <tbody>
              
              <tr>
                <td align="center" valign="top"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td class="col-100" width="300" align="left" valign="top"><table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td align="center" valign="top"><a href="${
                                  speakerImgStyles.imgBackgroundLink
                                }" target="_blank"><img src="${
    speakerImgStyles.imgURL
  }" width="${speakerImgStyles.imgWidth}" height="${speakerImgStyles.imgHeight}" alt="${
    speakerImgStyles.imgALT
  }" aria-hidden="true"/></a></td>
                              </tr>
                            </tbody>
                          </table></td>
                        <td class="blockSpace" width="10" align="left" valign="top">&nbsp;</td>
                        <td class="col-100" width="370" align="left" valign="top"><table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td align="left" class="pt-40" valign="top" style=""><table align="center" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                    <tbody>
                                      <tr>
                                        <td align="left" valign="top" style=""><table align="center" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                            <tbody>
                                              <tr>
                                                <td class="center_textalign" align="left" valign="top" style="color:${speakerTitleStyles.color}; font-family: Arial; font-size:${speakerTitleStyles.fontsize}px; line-height:${+speakerTitleStyles.fontsize+2}px; mso-line-height-rule:exactly;">${mainTitle}</td>
                                              </tr>
                                              <tr>
                                                <td height="5" style="font-size:1px; line-height:1px;">&nbsp;</td>
                                              </tr>
                                              <tr>
                                                <td class="center_textalign" align="left" valign="top" style="color:${isDescriptionStyles.color}; font-family: Arial; font-size:14px; line-height:20px; mso-line-height-rule:exactly;">
                                                ${isDescription}
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table></td>
                                      </tr>
                                      <tr>
                                        <td height="15" style="font-size:1px; line-height:1px;">&nbsp;</td>
                                      </tr>
                                    </tbody>
                                  </table></td>
                              </tr>
                            </tbody>
                          </table></td>
                      </tr>
                    </tbody>
                  </table></td>
              </tr>
              <tr>
                <td height="10" style="font-size:1px; line-height:1px;">&nbsp;</td>
              </tr>
              
              
              
              
            </tbody></table></td>
        </tr>
      </tbody></table></td>
  </tr>`:`<tr>
  <td align="center" valign="top" style="background-color:#FFFFFF;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
      <tbody><tr>
        <td class="setPadding" align="left" valign="top" style="padding:0px 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
            <!-- Spacing -->
            
            <tbody>
            
            <tr>
              <td align="center" valign="top"><table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tbody>
                    <tr>
                      <td class="col-100" width="300" align="left" valign="top"><table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tbody>
                            <tr>
                              <td align="center" valign="top"><img src="${
  speakerImgStyles.imgURL
}" width="${speakerImgStyles.imgWidth}" height="${speakerImgStyles.imgHeight}" alt="${
  speakerImgStyles.imgALT
}" aria-hidden="true"/></td>
                            </tr>
                          </tbody>
                        </table></td>
                      <td class="blockSpace" width="10" align="left" valign="top">&nbsp;</td>
                      <td class="col-100" width="370" align="left" valign="top"><table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tbody>
                            <tr>
                              <td align="left" class="pt-40" valign="top" style=""><table align="center" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                  <tbody>
                                    <tr>
                                      <td align="left" valign="top" style=""><table align="center" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                          <tbody>
                                            <tr>
                                              <td class="center_textalign" align="left" valign="top" style="color:${speakerTitleStyles.color}; font-family: Arial; font-size:${speakerTitleStyles.fontsize}px; line-height:${+speakerTitleStyles.fontsize+2}px; mso-line-height-rule:exactly;">${mainTitle}</td>
                                            </tr>
                                            <tr>
                                              <td height="5" style="font-size:1px; line-height:1px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                              <td class="center_textalign" align="left" valign="top" style="color:${isDescriptionStyles.color}; font-family: Arial; font-size:14px; line-height:20px; mso-line-height-rule:exactly;">
                                              ${isDescription}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table></td>
                                    </tr>
                                    <tr>
                                      <td height="15" style="font-size:1px; line-height:1px;">&nbsp;</td>
                                    </tr>
                                  </tbody>
                                </table></td>
                            </tr>
                          </tbody>
                        </table></td>
                    </tr>
                  </tbody>
                </table></td>
            </tr>
            <tr>
              <td height="10" style="font-size:1px; line-height:1px;">&nbsp;</td>
            </tr>
            
          </tbody></table></td>
      </tr>
    </tbody></table></td>
</tr>`;
  const closeSpeakerModuleModal = () => {
    setSpeakerModuleModalOpen(false);
  };
  const openSpeakerModuleModal = () => {
    setSpeakerModuleModalOpen(true);
  };
  const openMainHeadingModal = () => {
    setMainHeadingModal(true);
  };
  const closeMainHeadingModal = () => {
    setMainHeadingModal(false);
  };
  const openSpeakerDescModal =()=>{
    setSpeakarDescription(true)
  }

  const closeSpeakerDescModal =()=>{
    setSpeakarDescription(false)
  }

  const openContentsModal = () => {
    // console.log("true")
    setContentsModal(true);
  };
  const closeContentsModal = () => {
    setContentsModal(false);
  };

  const openTitleModal = ()=>{
    setTitleModal(true)
  }

  const closeTitleModal = ()=>{
    setTitleModal(false)
  }
// currently deisabled below fuction
  const handleSpeakerHeadingChange = (
    paraHtml,
    align,
    color,
    fontsize,
    bgcolor,
    
  ) => {
    // console.log(paraHtml, align, color, fontsize, bgcolor);
    setSpeakerHeadingStyles({
      align: align,
      color: color,
      fontsize: fontsize,
      bgcolor: bgcolor,
    });
    SetMainHeading(paraHtml);
  };
  // currently deisabled above fuction


  const handleTitleChange =(
    paraHtml,
    align,
    color,
    fontsize,
    bgcolor,
    
  )=>{
    setSpeakerTitleStyles({
      align: align,
      color: color,
      fontsize: fontsize,
      bgcolor: bgcolor,
    });
    setMainTile(paraHtml);
  }

  // below funciton is to access the paragraph description
  const handleDescriptionChange = (
    paraHtml,
    align,
    color,
    fontsize,
    bgcolor,
  ) =>{
   setDescriptionStyles({
    align: align,
    color: color,
    fontsize: fontsize,
    bgcolor: bgcolor,
   })
   setDescription(paraHtml)

  } 


  const handleImageVariables = (
    imgURL,
    imgBackgroundLink,
    imgHeight,
    imgWidth,
    imgALT
  ) => {
    // console.log(imgURL, imgBackgroundLink, imgHeight, imgWidth, imgALT);
    setSpeakerImgStyles({
      imgURL,
      imgBackgroundLink,
      imgHeight,
      imgWidth,
      imgALT,
    });
  };

const SpeakerEditCode =()=>{
  onContentChange(SpeakerHtml)  
  closeSpeakerModuleModal()
}

  const SpeakerCode = () => {
    // console.log(SpeakerHtml);
    // dispatch(getSpeakerModule(SpeakerHtml));
    dispatch(getSpeakerModule({type:"SpeakerModule",code:SpeakerHtml}));
    closeSpeakerModuleModal();
  };



  return (
    <div>
      <div
        style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px", padding: "5px",margin:"10px" }}
      >
        <img
          src={SpeakerModuleIMG}
          alt="SpeakerModule.png"
          style={{ width: "100%", height: "70px", cursor: "pointer" }}
          onClick={openSpeakerModuleModal}
        />
        <div style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center" as const, color: "#151515", backgroundColor: "#f0efed", padding: "5px", marginTop: "5px" }}>
          Speaker Module
        </div>
      </div>
      
      {isSpeakerModuleModalOpen && (
        <div className="modal-overlay" style={{
          position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: "white", padding: "20px", borderRadius: "8px",
            width: "600px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" as const, position: "relative" as const
          }}>
            <div className="modal-header" style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const }}>
              <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>Add All Components</div>
              <button onClick={closeSpeakerModuleModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div className="modal-body">
              <button
                id="ThemeButtonSave"
                onClick={stage ? SpeakerEditCode : SpeakerCode}
                style={{
                  background: "#3182ce",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  width: "100%",
                  marginBottom: "15px"
                }}
              >
                Apply Speaker Module
              </button>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-start" as const }}>
                <div style={{ flex: "1 1 auto" }}>
                  <ImageReusable onContentChange={handleImageVariables} prevCode={prevCode} stage={stage}/>
                </div>
                <div>
                  <button
                    id="ThemeButtonSave"
                    onClick={openContentsModal}
                    style={{ padding: "8px 16px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
                  >
                    Contents
                  </button>
                </div>
                <div>
                  <button
                    id="ThemeButtonSave"
                    onClick={openSpeakerDescModal}
                    style={{ padding: "8px 16px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
                  >
                    Description
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* contetns */}

      {isContentsModal && (
        <div className="modal-overlay" style={{
          position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: "white", padding: "20px", borderRadius: "8px",
            width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" as const, position: "relative" as const
          }}>
            <div className="modal-header" style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const }}>
              <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>Title</div>
              <button onClick={closeContentsModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div className="modal-body">
              <EditorReuse onContentChange={handleTitleChange}/>
            </div>
          </div>
        </div>
      )}

      {/* below modal is speaker description */}
      {isSpeakarDescription && (
        <div className="modal-overlay" style={{
          position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: "white", padding: "20px", borderRadius: "8px",
            width: "500px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" as const, position: "relative" as const
          }}>
            <div className="modal-header" style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const }}>
              <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>Description</div>
              <button onClick={closeSpeakerDescModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div className="modal-body">
              <EditorReuse onContentChange={handleDescriptionChange}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakerModule;
