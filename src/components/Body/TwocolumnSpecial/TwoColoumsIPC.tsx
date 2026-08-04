import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { getIPC } from '../../../Redux/ProductReducer/action'
import IPC from "./Thumbs/IPC.png";
import EditorReuse from '../../EditorSkills/EditorReusable';
import CTAbtnReusable from '../../EditorSkills/CTAbtnReusable';
import ImageReusable from '../../EditorSkills/ImageReusable';

const TwoColoumsIPC = ({onContentChange,stage}) => {
    const [isIpcModalModalOpen, setIpcModalModalOpen] = useState(false);
    const [imgURL1, setImgURL1] = useState("")
    const [imgURL2, setImgURL2] = useState("")
    const [isCtaValues1, setCtaValues1] = useState<any>({})
    const [isCtaValues2, setCtaValues2] = useState<any>({})
    const [isParagraph1Styles , setParagraph1Styles] = useState<any>({})
    const [isParagraph2Styles , setParagraph2Styles] =useState<any>({})
    const [isParagraph2, setParagraph2]  = useState("")
    const [isParagraph1, setParagraph1]  = useState("")
    const [isIPCImg1Styles,setIPCImg1Styles] = useState<any>({})
    const [isIPCImg2Styles,setIPCImg2Styles] = useState<any>({})
    const dispatch = useDispatch()

    const HandleEditIpcCode =()=>{
      onContentChange(componentHtml)
      closeIpcModuleModal()
    }
    const IpcCode =()=>{
        // console.log(isCtaValues1,isCtaValues2,imgURL1,imgURL2)
        // dispatch(getIPC(componentHtml))
        dispatch(getIPC({type:"IPC",code:componentHtml}))
        closeIpcModuleModal()
    };

    const closeIpcModuleModal =()=>{
        setIpcModalModalOpen(false)
      }
      const openIpcModuleModal =()=>{
        setIpcModalModalOpen(true)
      }

      const handleCta1 =(isCtaBrandColor,isCtaText,isCtaLink,isCtaIcon,isCtaColor)=>{
        setCtaValues1({
            isCtaBrandColor,isCtaText,isCtaLink,isCtaIcon,isCtaColor
        })
      }

      const handleCta2 =(isCtaBrandColor,isCtaText,isCtaLink,isCtaIcon,isCtaColor)=>{
        setCtaValues2({
            isCtaBrandColor,isCtaText,isCtaLink,isCtaIcon,isCtaColor
        })
      }

      const handlePara1Change =(
        paraHtml,
    align,
    color,
    fontsize,
    bgcolor,
      )=>{
        setParagraph1Styles({
            align: align,
      color: color,
      fontsize: fontsize,
      bgcolor: bgcolor,
        })
        setParagraph1(paraHtml)
      }
      const handlePara2Change =(
        paraHtml,
    align,
    color,
    fontsize,
    bgcolor,
      )=>{
        setParagraph2Styles({
            align: align,
      color: color,
      fontsize: fontsize,
      bgcolor: bgcolor,
        })
        setParagraph2(paraHtml)
      }


      const handleImg1change = (
        imgURL,
        imgBackgroundLink,
        imgHeight,
        imgWidth,
        imgALT
      ) => {
        // console.log(imgURL, imgBackgroundLink, imgHeight, imgWidth, imgALT);
        setIPCImg1Styles({
          imgURL,
          imgBackgroundLink,
          imgHeight,
          imgWidth,
          imgALT,
        });
      };

      const handleImg2change = (
        imgURL,
        imgBackgroundLink,
        imgHeight,
        imgWidth,
        imgALT
      ) => {
        // console.log(imgURL, imgBackgroundLink, imgHeight, imgWidth, imgALT);
        setIPCImg2Styles({
          imgURL,
          imgBackgroundLink,
          imgHeight,
          imgWidth,
          imgALT,
        });
      };



    let componentHtml = `<tr>
    <td align="center" valign="top" style="background-color: #ffffff">
      <table width="560" class="col-100" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
          <tr>
            <td class="setPadding" align="left" valign="top" style="">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tbody>
                  <tr>
                    <td align="center" valign="top">
                      <table width="560" align="center" role="presentation" class="col-100" border="0" cellspacing="0" cellpadding="0">
                        <tbody>
                          <tr>
                            <td class="col-100" width="270" align="center" valign="top">
                              <table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tbody>
                                  <tr>
                                    <td height="15" style="
                                        font-size: 1px;
                                        line-height: 1px;
                                      ">
                                      &nbsp;
                                    </td>
                                  </tr>

                                  <tr>
                                    <td class="col-100 Ipc_image" align="center" valign="middle">
                                      <img src="${isIPCImg1Styles.imgURL}" width="${isIPCImg1Styles.imgWidth}" alt="${isIPCImg1Styles.imgALT}" aria-hidden="true" style="
                                          display: block;
                                          border: none;
                                        ">
                                    </td>
                                  </tr>
                                  <tr>
                                  <td height="15" style="
                                      font-size: 1px;
                                      line-height: 1px;
                                    ">
                                    &nbsp;
                                  </td>
                                </tr>
                                  <tr>
                            <td align="left" valign="top" style="
                                color: ${isParagraph1Styles.color};
                                font-family: Arial;
                                font-size: ${isParagraph1Styles.fontsize}px;
                                line-height: ${+isParagraph1Styles.fontsize+2}px;
                                text-align:${isParagraph1Styles.align};
                                background-color:${isParagraph1Styles.bgcolor}
                              ">
                              ${isParagraph1}
                            </td>
                          </tr>

                                  <tr>
                                    <td height="15" style="
                                        font-size: 1px;
                                        line-height: 1px;
                                      ">
                                      &nbsp;
                                    </td>
                                  </tr>

                                  <tr>
                                    <td align="center" valign="top">
                                      <table width="270" class="col-100" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                        <tbody>
                                          <tr>
                                            <td bgcolor="${isCtaValues1.isCtaBrandColor}" style="
                                                padding: 6px
                                                  15px;
                                              ">
                                              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tbody>
                                                  <tr>
                                                    <td align="center" valign="middle" style="
                                                        font-family: Arial;
                                                        font-size: 16px;
                                                        font-weight: bold;
                                                        line-height: 20px;
                                                        padding: 0
                                                          2px;
                                                      ">
                                                      <a target="_blank" style="
                                                          color: ${isCtaValues1.isCtaColor};
                                                          text-decoration: none;
                                                        " href="${isCtaValues1.isCtaLink}">${isCtaValues1.isCtaText}<font></font></a>
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

                            <td class="col-100" width="20" align="left" valign="top">
                              &nbsp;
                            </td>

                            <td class="col-100" width="270" align="center" valign="top">
                              <table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tbody>
                                  <tr>
                                    <td height="15" style="
                                        font-size: 1px;
                                        line-height: 1px;
                                      ">
                                      &nbsp;
                                    </td>
                                  </tr>

                                  <tr>
                                    <td class="col-100 Ipc_image" align="center" valign="middle">
                                      <img src="${isIPCImg2Styles.imgURL}" width="${isIPCImg2Styles.imgWidth}" alt="${isIPCImg2Styles.imgALT}" aria-hidden="true" style="
                                          display: block;
                                          border: none;
                                        ">
                                    </td>
                                  </tr>
                                  <tr>
                                  <td height="15" style="
                                      font-size: 1px;
                                      line-height: 1px;
                                    ">
                                    &nbsp;
                                  </td>
                                </tr>
                                  <tr>
                            <td align="left" valign="top" style="
                                color: ${isParagraph2Styles.color};
                                font-family: Arial;
                                font-size: ${isParagraph2Styles.fontsize}px;
                                line-height: ${+isParagraph2Styles.fontsize + 2}px;
                                text-align:${isParagraph2Styles.align};
                                background-color:${isParagraph2Styles.bgcolor}
                              ">
                                ${isParagraph2}
                            </td>
                          </tr>
                          

                                  <tr>
                                    <td height="15" style="
                                        font-size: 1px;
                                        line-height: 1px;
                                      ">
                                      &nbsp;
                                    </td>
                                  </tr>

                                  <tr>
                                    <td align="center" valign="top">
                                      <table width="270" class="col-100" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                        <tbody>
                                          <tr>
                                            <td bgcolor="${isCtaValues2.isCtaBrandColor}" style="
                                                padding: 6px
                                                  15px;
                                              ">
                                              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tbody>
                                                  <tr>
                                                    <td align="center" valign="middle" style="
                                                        font-family: Arial;
                                                        font-size: 16px;
                                                        font-weight: bold;
                                                        line-height: 20px;
                                                        padding: 0
                                                          2px;
                                                      ">
                                                      <a target="_blank" style="
                                                          color: ${isCtaValues2.isCtaColor};
                                                          text-decoration: none;
                                                        " href="${isCtaValues2.isCtaLink}">${isCtaValues2.isCtaText}</a>
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
  </tr>`
  return (
    <div style={{
      boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
      padding: '5px',
      margin: '10px'
    }}>
        <img
          src={IPC}
          alt="IPCModule.png"
          style={{ width: "90%", height: "150px", marginLeft: "10px", cursor: "pointer" }}
          onClick={openIpcModuleModal}
        />
        <div style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center" as const, color: "#151515", backgroundColor: "#f0efed", padding: "5px", marginTop: "5px" }}>
          IPC Module
        </div>
        
        {isIpcModalModalOpen && (
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
                <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>Image Paragraph Cta</div>
                <button onClick={closeIpcModuleModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>
              
              <div className="modal-body">
                <button
                  onClick={stage ? HandleEditIpcCode : IpcCode}
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
                  Create IPC Module
                </button>
                
                <div style={{ marginBottom: "10px", fontWeight: "bold" }}>Image 1</div>
                <ImageReusable onContentChange={handleImg1change}/>

                <div style={{ marginTop: "15px", marginBottom: "10px", fontWeight: "bold" }}>Image 2</div>
                <ImageReusable onContentChange={handleImg2change}/>

                <div style={{ marginTop: "15px", marginBottom: "10px", fontWeight: "bold" }}>Paragraph 1</div>
                <EditorReuse onContentChange={handlePara1Change}/>

                <div style={{ marginTop: "15px", marginBottom: "10px", fontWeight: "bold" }}>Paragraph 2</div>
                <EditorReuse onContentChange={handlePara2Change}/>

                <div style={{ marginTop: "15px", marginBottom: "10px", fontWeight: "bold" }}>Cta 1</div>
                <CTAbtnReusable ctaName={"cta 1"} ctaFunction={handleCta1}/>

                <div style={{ marginTop: "15px", marginBottom: "10px", fontWeight: "bold" }}>Cta 2</div>
                <CTAbtnReusable ctaName={"cta 2"} ctaFunction={handleCta2}/>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default TwoColoumsIPC