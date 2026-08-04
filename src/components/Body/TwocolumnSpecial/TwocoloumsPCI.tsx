import React, { useState } from "react";
import PCI from "./Thumbs/TwocoloumnsPCI.png";
import EditorReuse from "../../EditorSkills/EditorReusable";
import ImageReusable from "../../EditorSkills/ImageReusable";
import { useDispatch } from "react-redux";
import { getPCI } from "../../../Redux/ProductReducer/action";
import CTAbtnReusable from "../../EditorSkills/CTAbtnReusable";

// Paragraph cta image => pci

const TwocoloumsPCI = ({onContentChange,stage}) => {
  const [isPCIModuleModalOpen, setPCIModuleModalOpen] = useState(false);
  const [isPCIImgStyles, setPCIImgStyles] = useState<any>({});
  const [isPCIDescription, setPCIDescription] = useState(false);
  const [isContentsModal, setContentsModal] = useState(false);
  const [isPCITitleStyles, setPCITitleStyles] = useState<any>({});
  const [mainTitle, setMainTile] = useState("");
  const [isDescriptionStyles, setDescriptionStyles] = useState<any>({});
  const [isDescription, setDescription] = useState("");
  const [isCtaValues, setCtaValues] = useState<any>({});
  const [isModuleBg, setModuleBg] = useState("#ffffff");
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState(false);

  // console.log(isCtaValues)
  let PCIhtml = isChecked?`<tr>
    <td align="center" valign="top">
      <table
        width="100%"
        border="0"
        cellspacing="0"
        cellpadding="0"
        bgcolor="#ffffff"
        
      >
        <tbody>
          <tr>
            <td
              bgcolor="${isModuleBg}"
              class="setPadding"
              align="left"
              valign="top"
              style="padding: 0px 20px"
            >
              <table
                width="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                role="presentation"
              >
                <tbody>
                  
                  <tr>
                    <td align="center" valign="top">
                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td class="col-100" align="left" valign="middle">
                              <table
                                width="100%"
                                border="0"
                                cellspacing="0"
                                cellpadding="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      align="${isPCITitleStyles.align}"
                                      valign="top"
                                      style="
                                        color: ${isPCITitleStyles.color};
                                        font-family: Arial;
                                        font-size: ${isPCITitleStyles.fontsize}px;
                                        line-height: ${+isPCITitleStyles.fontsize+2}px;
                                      "
                                    >
                                      ${mainTitle}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      height="5"
                                      style="font-size: 1px; line-height: 1px"
                                    >
                                      &nbsp;
                                    </td>
                                  </tr>
  
                                  <tr>
                                    <td
                                      align="left"
                                      valign="top"
                                      style="
                                        color: ${isDescriptionStyles.color};
                                        font-family: Arial;
                                        font-size: ${isDescriptionStyles.fontsize}px;
                                        line-height: ${+isDescriptionStyles.fontsize+2}px;
                                        text-align:${isDescriptionStyles.align}
                                      "
                                    >
                                     ${isDescription}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      height="20"
                                      style="font-size: 1px; line-height: 1px"
                                    >
                                      &nbsp;
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      align="center"
                                      valign="top"
                                      class="Container"
                                    >
                                      <table
                                        class="Container"
                                        width="200"
                                        border="0"
                                        cellspacing="0"
                                        cellpadding="0"
                                      >
                                        <tbody>
                                          <tr>
                                            <td
                                              bgcolor="${isCtaValues.ctaBG}"
                                              style="padding: 12px"
                                            >
                                              <table
                                                width="100%"
                                                border="0"
                                                cellspacing="0"
                                                cellpadding="0"
                                              >
                                                <tbody>
                                                  <tr>
                                                    <td
                                                      align="center"
                                                      valign="middle"
                                                      style="
                                                        font-family: Arial;
                                                        font-size: 16px;
                                                        font-weight: bold;
                                                        line-height: 20px;
                                                        padding: 0 3px;
                                                      "
                                                    >
                                                      <a
                                                        target="_blank"
                                                        style="
                                                          color: ${isCtaValues.ctaColor};
                                                          text-decoration: none;
                                                        "
                                                        href="${isCtaValues.ctaLink}"
                                                        >${isCtaValues.ctaText}</a
                                                      >
                                                    </td>
                                                    <td
                                                      width="10"
                                                      align="left"
                                                      valign="middle"
                                                    >
                                                      &nbsp;
                                                    </td>
                                                    <td
                                                      width="28"
                                                      align="left"
                                                      valign="middle"
                                                    >
                                                      <a
                                                        href="${isCtaValues.ctaLink}"
                                                        target="_blank"
                                                        style="
                                                          color: #ffffff;
                                                          text-decoration: none;
                                                        "
                                                        ><img
                                                          src="${isCtaValues.ctaIcon}"
                                                          alt="Icon"
                                                          width="23"
                                                          height="23"
                                                          style="
                                                            border: none;
                                                            display: block;
                                                          "
                                                      /></a>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td class="col-100" width="10">&nbsp;</td>
                            <td
                              class="col-100"
                              width="240"
                              align="center"
                              valign="middle"
                            >
                              <img
                                src="${isPCIImgStyles.imgURL}"
                                width="${isPCIImgStyles.imgWidth}"
                                height="${isPCIImgStyles.imgHeight}"
                                alt="${isPCIImgStyles.imgALT}"
                                style="display: block; border: none"
                              />
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
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>`:`<tr>
  <td align="center" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
      <tbody>
      
        <tr>
          <td bgcolor="${isModuleBg}" class="setPadding" align="left" valign="top" style="padding: 0px 20px">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tbody>
              <tr>
                                  <td height="5" style="font-size: 1px; line-height: 1px">
                                    &nbsp;
                                  </td>
                                </tr>
              <tr>
              <td height="5" style="font-size: 1px; line-height: 1px">
                &nbsp;
              </td>
            </tr>
                <tr>
                  <td align="center" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tbody>
                        <tr>
    <td class="col-100" width="240" align="center" valign="middle">
    <img
    src="${isPCIImgStyles.imgURL}"
    width="${isPCIImgStyles.imgWidth}"
    height="${isPCIImgStyles.imgHeight}"
    alt="${isPCIImgStyles.imgALT}"
    style="display: block; border: none"
  />
                          </td>
                          
    
                          <td class="col-100" align="left" valign="middle" >
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tbody>
                                <tr>
                                  <td align="${isPCITitleStyles.align}" valign="top" style="
                                  color: ${isPCITitleStyles.color};
                                  font-family: Arial;
                                  font-size: ${isPCITitleStyles.fontsize}px;
                                  line-height: ${+isPCITitleStyles.fontsize+2}px;
                                "
                                    >
                                    ${mainTitle}
                                  </td>
                                </tr>
                                <tr>
                                  <td height="5" style="font-size: 1px; line-height: 1px">
                                    &nbsp;
                                  </td>
                                </tr>

                                <tr>
                                  <td align="left" valign="top"  style="
                                  color: ${isDescriptionStyles.color};
                                  font-family: Arial;
                                  font-size: ${isDescriptionStyles.fontsize}px;
                                  line-height: ${+isDescriptionStyles.fontsize+2}px;
                                  text-align:${isDescriptionStyles.align}
                                ">
                                ${isDescription}
                                  </td>
                                </tr>
                                <tr>
                                  <td height="20" style="font-size: 1px; line-height: 1px">
                                    &nbsp;
                                  </td>
                                </tr>
                                <tr>
                                  <td align="center" valign="top" class="Container">
                                    <table class="Container" width="200" border="0" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td bgcolor="${isCtaValues.ctaBG}" style="padding: 12px">
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                              <tbody>
                                                <tr>
                                                  <td align="center" valign="middle" style="
                                                      font-family: Arial;
                                                      font-size: 16px;
                                                      font-weight: bold;
                                                      line-height: 20px;
                                                      padding: 0 3px;
                                                    ">
                                                    <a target="_blank" style="
                                                    color: ${isCtaValues.ctaColor};
                                                        text-decoration: none;
                                                      " href="${isCtaValues.ctaLink}"
                                                      >${isCtaValues.ctaText}</a>
                                                  </td>
                                                  <td width="10" align="left" valign="middle">
                                                    &nbsp;
                                                  </td>
                                                  <td width="28" align="left" valign="middle">
                                                    <a href="${isCtaValues.ctaLink}"
                                                    target="_blank" style="
                                                        color: #ffffff;
                                                        text-decoration: none;
                                                      "><img src="${isCtaValues.ctaIcon}" alt="Icon" width="23" height="23" style="
                                                          border: none;
                                                          display: block;
                                                        "></a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                          <td class="col-100" width="10">&nbsp;</td>
                          
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
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>`;

  const openPCIModuleModal = () => {
    setPCIModuleModalOpen(true);
  };
  const closePCIModuleModal = () => {
    setPCIModuleModalOpen(false);
  };

  const openPCIDescModal = () => {
    setPCIDescription(true);
  };

  const closePCIDescModal = () => {
    setPCIDescription(false);
  };

  const openContentsModal = () => {
    // console.log("true");
    setContentsModal(true);
  };
  const closeContentsModal = () => {
    setContentsModal(false);
  };
  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  const handleImageVariables = (
    imgURL,
    imgBackgroundLink,
    imgHeight,
    imgWidth,
    imgALT
  ) => {
    // console.log(imgURL, imgBackgroundLink, imgHeight, imgWidth, imgALT);
    setPCIImgStyles({
      imgURL,
      imgBackgroundLink,
      imgHeight,
      imgWidth,
      imgALT,
    });
  };

  const handleTitleChange = (paraHtml, align, color, fontsize, bgcolor) => {
    setPCITitleStyles({
      align: align,
      color: color,
      fontsize: fontsize,
      bgcolor: bgcolor,
    });
    setMainTile(paraHtml);
  };

  const handleDescriptionChange = (
    paraHtml,
    align,
    color,
    fontsize,
    bgcolor
  ) => {
    setDescriptionStyles({
      align: align,
      color: color,
      fontsize: fontsize,
      bgcolor: bgcolor,
    });
    setDescription(paraHtml);
  };

  const HandlePCIEditCode = ()=>{
    onContentChange(isChecked,PCIhtml);
    closePCIModuleModal();
  }

  const PCICode = () => {
    // console.log(PCIhtml);
    // dispatch(getPCI(PCIhtml));
    dispatch(getPCI({type:"PCI",code:PCIhtml}));
    closePCIModuleModal();
  };

  const handleCta = (
    isCtaBrandColor,isCtaText,isCtaLink,isCtaIcon,isCtaColor
  ) => {
    // console.log(isCtaText)
    // console.log("hello");
    setCtaValues({
      ctaBG: isCtaBrandColor,
      ctaText: isCtaText,
      ctaLink: isCtaLink,
      ctaIcon: isCtaIcon,
      ctaColor: isCtaColor,
    });
  };

  return (
    <div>
      <div
        style={{
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          padding: "5px",
          margin: "10px",
        }}
      >
        <img
          src={PCI}
          alt="PCIModule.png"
          style={{ width: "100%", height: "70px", cursor: "pointer" }}
          onClick={openPCIModuleModal}
        />
        <div style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center" as const, color: "#151515", backgroundColor: "#f0efed", padding: "5px", marginTop: "5px" }}>
          PCI Module
        </div>
      </div>
      {/* main Modal */}
      {isPCIModuleModalOpen && (
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
              <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                <label style={{ display: "flex", alignItems: "center" as const, gap: "8px", fontSize: "14px", fontWeight: "normal" }}>
                  <input type="checkbox" checked={isChecked} onChange={handleToggle} />
                  change Image position
                </label>
              </div>
              <button onClick={closePCIModuleModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div className="modal-body">
              <button
                id="ThemeButtonSave"
                onClick={stage ? HandlePCIEditCode : PCICode}
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
                Apply PCI Module
              </button>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-start" as const, marginBottom: "15px" }}>
                <div style={{ flex: "1 1 auto" }}>
                  <ImageReusable onContentChange={handleImageVariables} />
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
                    onClick={openPCIDescModal}
                    style={{ padding: "8px 16px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
                  >
                    Description
                  </button>
                </div>
              </div>
              <div style={{ padding: "10px" }}>
                <CTAbtnReusable ctaFunction={handleCta} ctaName={"CTA"} />
                <input
                  value={isModuleBg}
                  placeholder="Paste Module Background"
                  onChange={(e) => setModuleBg(e.target.value)}
                  style={{ width: "100%", padding: "8px", marginTop: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
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
              <EditorReuse onContentChange={handleTitleChange} />
            </div>
          </div>
        </div>
      )}

      {/* below modal is speaker description */}
      {isPCIDescription && (
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
              <button onClick={closePCIDescModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div className="modal-body">
              <EditorReuse onContentChange={handleDescriptionChange} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwocoloumsPCI;
