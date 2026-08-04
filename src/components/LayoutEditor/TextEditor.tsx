import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { FaCode } from "react-icons/fa6";
import copy from "clipboard-copy";
import CodeMode from "../Body/image_assets/CodeMode.png";
import { useSelector } from "react-redux";
import Preview from "../Preview/preview";
import MobileIcon from "../Body/image_assets/MobileViewIcon.png";
import TabletIcon from "../Body/image_assets/TabletIcon.png";
import { IoDesktopOutline } from "react-icons/io5";

const TextEditor = ({ prevCode, typeObj, onContentChange, state = false, onstateChange = () => {} }) => {
  const isNativePopup = window.location.pathname === "/TextEditor";
  
  const [code, setCode] = useState(() => {
    if (isNativePopup) {
      return localStorage.getItem("native_editor_prev_code") || "";
    }
    return prevCode || "";
  });
  
  const [isModalOpen, setModalOpen] = useState(isNativePopup);
  const editorRef = useRef(null);
  
  const [content, setContent] = useState(() => {
    if (isNativePopup) {
      return localStorage.getItem("native_editor_prev_code") || "";
    }
    return prevCode || "";
  });
  
  const [blockTempOpen, setBlocktempOpen] = useState(false);
  const { CustomCss } = useSelector((selector: any) => selector.ProductReducer);
  const { Header, Footer, Body, SubjectLine, PreHeader, PMDate, Images } = useSelector((selector: any) => selector.ProductReducer);
  const [viewWidth, setViewWidth] = useState("630");

  const parsedTypeObj = () => {
    if (typeObj) return typeObj;
    try {
      return JSON.parse(localStorage.getItem("native_editor_type_obj") || "{}");
    } catch {
      return {};
    }
  };

  useEffect(() => {
    if (state) {
      setModalOpen(true);
    }
  }, [state]);

  let fullBOdy = "";
  Body.forEach((e, i) => {
    fullBOdy = fullBOdy + e.code;
  });

  const closeModal = () => {
    if (isNativePopup) {
      const channel = new BroadcastChannel("editor_channel");
      channel.postMessage({ type: "close" });
      channel.close();
    } else {
      setModalOpen(false);
      onstateChange();
    }
  };
  
  const openModal = () => {
    setModalOpen(true);
  };

  const onClose = () => {
    setBlocktempOpen(false);
  };

  const HandleBlockTemplatesModal = () => {
    setBlocktempOpen(true);
  };

  let std_temp = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="EN">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title></title>
    ${CustomCss}
  </head>
  <body
    style="
      font-family: Arial;
      font-size: 12px;
      font-weight: normal;
      color: #151515;
      background: #ffffff;
      margin: 0;
      padding: 0;
      width: 100% !important;
    "
    yahoo="fix"
  >
    <!--[if !mso 9]><!-->
    <div
    data-test="pre-header"
      style="
        display: none;
        font-size: 1px;
        color: #333333;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
     
    </div>
    <!--<![endif]-->
    <table
      width="100%"
      bgcolor="#F5F5F5"
      border="0"
      cellspacing="0"
      cellpadding="0"
      role="presentation"
    >
      <tbody>
        <tr>
          <td class="Wrapper" align="center" valign="top">
            <!-- Main Wrapper -->

            <table
              bgcolor="#ffffff"
              class="Container"
              width="600"
              border="0"
              cellspacing="0"
              cellpadding="0"
              align="center"
              role="presentation"
            >
              <tbody>
                
      


            ${Header}

              ${fullBOdy}
              
              
              ${Footer}
              
              ${PMDate}

               

                <!-- Gmail App Fix -->
                <tr class="gmail-fix">
                  <td>
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      align="center"
                      width="600"
                      role="presentation"
                    >
                      <tbody>
                        <tr>
                          <td
                            bgcolor="#f8f6f5"
                            height="1"
                            style="line-height: 1px; min-width: 600px"
                          >
                            <img
                              src="assets/trans.png"
                              width="600"
                              height="1"
                              alt=""
                              style="
                                display: block;
                                max-height: 1px;
                                min-height: 1px;
                                min-width: 600px;
                                width: 600px;
                              "
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <!-- Gmail App Fix End -->
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function showValue() {
    setContent(editorRef.current.getValue());
  }

  const HandleUpdateCode = () => {
    if (isNativePopup) {
      const channel = new BroadcastChannel("editor_channel");
      channel.postMessage({ type: "save", payload: { code: content, typeObj: parsedTypeObj() } });
      channel.close();
    } else {
      onContentChange(content, typeObj);
    }
  };

  const editorOptions: any = {
    wordWrap: "on",
    wordWrapColumn: 60,
  };

  let arr = [{"type":"survey","code":"<tr>\r\n  <td align=\"center\" valign=\"top\">\r\n    <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\r\n      <tbody>\r\n        <tr>\r\n          <td class=\"setPadding wrapper\" align=\"left\" valign=\"top\" bgcolor=\"#ffffff\"\r\n            style=\"padding-left: 20px; padding-right: 20px\">\r\n            <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#ffffff\">\r\n              <tbody>\r\n                <tr>\r\n                  <td height=\"20\" style=\"font-size: 1px; line-height: 1px\">&nbsp;\r\n\r\n                  </td>\r\n                </tr>\r\n                <tr>\r\n                  <td align=\"center\" valign=\"top\" style=\"\r\n                                  color: #151515;\r\n                                  font-family: Arial;\r\n                                  font-size: 18px;\r\n                                  line-height: 20px;\r\n                                \" colspan=\"3\">\r\n                    <strong\r\n                                  >Su opinión es importante para\r\n                                  nosotros</strong>\r\n                  </td>\r\n                </tr>\r\n                <tr>\r\n                  <td height=\"10\" style=\"font-size: 1px; line-height: 1px\">&nbsp;\r\n\r\n                  </td>\r\n                </tr>\r\n                <tr>\r\n                  <td align=\"center\" valign=\"top\" style=\"\r\n                                  color: #151515;\r\n                                  font-family: Arial;\r\n                                  font-size: 14px;\r\n                                  line-height: 20px;\r\n                                \" colspan=\"3\">\r\n                    ¿Le ha resultado relevante esta información?\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </td>\r\n        </tr>\r\n      </tbody>\r\n    </table>\r\n  </td>\r\n</tr>\r\n<tr>\r\n  <td class=\"setPadding wrapper\" align=\"left\" valign=\"top\" bgcolor=\"#ffffff\"\r\n    style=\"padding-left: 20px; padding-right: 20px\">\r\n    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#ffffff\">\r\n      <tbody>\r\n        <tr>\r\n          <td height=\"20\" style=\"font-size: 1px; line-height: 1px\"></td>\r\n        </tr>\r\n        <tr>\r\n          <td class=\"col-100\" align=\"center\" valign=\"top\">\r\n            <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\r\n              <tbody>\r\n                <tr>\r\n                  <td align=\"center\" valign=\"top\" bgcolor=\"#dc2127\" style=\"\r\n                                  color: #ffffff;\r\n                                  font-size: 16px;\r\n                                  line-height: 20px;\r\n                                  font-family: arial;\r\n                                  text-align: center;\r\n                                  padding: 10px 10px;\r\n                                  font-weight: bold;\r\n                                \">\r\n                    <a href=\"https://assets.gskinternet.com/pharma/GSKpro/LSP/Survey/popup.html#Good\" target=\"_blank\"\r\n                      style=\"text-decoration: none; color: #ffffff\">Muy relevante</a>\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </td>\r\n          <td class=\"col-100\" width=\"10\" align=\"left\" valign=\"top\">&nbsp;\r\n\r\n          </td>\r\n          <td class=\"col-100\" align=\"center\" valign=\"top\">\r\n            <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\r\n              <tbody>\r\n                <tr>\r\n                  <td align=\"center\" valign=\"top\" bgcolor=\"#dc2127\" style=\"\r\n                                  color: #ffffff;\r\n                                  font-size: 16px;\r\n                                  line-height: 20px;\r\n                                  font-family: arial;\r\n                                  text-align: center;\r\n                                  padding: 10px 10px;\r\n                                  font-weight: bold;\r\n                                \">\r\n                    <a href=\"https://assets.gskinternet.com/pharma/GSKpro/LSP/Survey/popup.html#Sufficient\"\r\n                      target=\"_blank\" style=\"text-decoration: none; color: #ffffff\">Relevante</a>\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </td>\r\n          <td class=\"col-100\" width=\"10\" align=\"left\" valign=\"top\">&nbsp;\r\n\r\n          </td>\r\n          <td class=\"col-100\" align=\"center\" valign=\"top\">\r\n            <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\r\n              <tbody>\r\n                <tr>\r\n                  <td align=\"center\" valign=\"top\" bgcolor=\"#dc2127\" style=\"\r\n                                  color: #ffffff;\r\n                                  font-size: 16px;\r\n                                  line-height: 20px;\r\n                                  font-family: arial;\r\n                                  text-align: center;\r\n                                  padding: 10px 10px;\r\n                                  font-weight: bold;\r\n                                \">\r\n                    <a href=\"https://assets.gskinternet.com/pharma/GSKpro/LSP/Survey/popup.html#Insufficient\"\r\n                      target=\"_blank\" style=\"text-decoration: none; color: #ffffff\">Irrelevante</a>\r\n                  </td>\r\n                </tr>\r\n              </tbody>\r\n            </table>\r\n          </td>\r\n        </tr>\r\n        <tr>\r\n          <td height=\"20\" style=\"font-size: 1px; line-height: 1px\"></td>\r\n        </tr>\r\n      </tbody>\r\n    </table>\r\n  </td>\r\n</tr>"}];

  const handleAddBlockTemplateToTextEditor = (item) => {
    alert("Code copied past it in Editor");
    copyToClipboard(item.code);
    setBlocktempOpen(false);
  };
  
  const copyToClipboard = (text) => {
    copy(text)
      .then(() => {})
      .catch((error) => {});
  };

  useEffect(() => {}, [content]);
  useEffect(() => {
    setCode(prevCode);
  }, []);

  const divStyle = {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #0005F6, #002A90) border-box',
    border: '2px solid transparent'
  };

  return (
    <div>
      <button className="Content_btn" style={isModalOpen ? divStyle : null} onClick={openModal}>
        <img src={CodeMode} alt='CodeMode.png' width={"30px"} height={"30px"} /><br />
        <span>Code Mode</span>
      </button>

      {isModalOpen && (
        <div className="modal-dialog-overlay" style={{
          position: "fixed" as const, top: 0, left: 0, width: "100%", height: "100%", 
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", 
          justifyContent: "center" as const, alignItems: "center" as const
        }}>
          <div className="modal-content" style={{
            backgroundColor: "#fff", width: "95%", height: "95%", 
            borderRadius: "8px", display: "flex", flexDirection: "column" as const
          }}>
            <div className="modal-header" style={{ padding: "10px", borderBottom: "1px solid #ccc", display: "flex", alignItems: "center" as const }}>
              <div style={{ width: "100%", display: "flex", alignItems: "center" as const }}>
                <div style={{ fontWeight: "bold", display: "flex", alignItems: "center" as const, width: "100%" }}>
                  <button onClick={HandleUpdateCode} id='ThemeButtonSave' className="btn-accent" style={{ backgroundColor: "green", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", width: "150px", cursor: "pointer" }}>
                    Save
                  </button>
                  <button onClick={closeModal} style={{ marginLeft: "10px", border: "none", background: "none", fontSize: "16px", cursor: "pointer" }}>✖</button>
                  <span style={{ marginLeft: "20px" }}>Code Mode - </span>
                  <span className="badge-status" style={{ backgroundColor: "red", color: "white", padding: "2px 5px", borderRadius: "4px", marginLeft: "10px", marginRight: "auto" }}>
                    Make sure the code you write won't have any bugs
                  </span>
                  <div className="iconsViews" style={{ display: "flex", gap: "10px" }}>
                    <img src={MobileIcon} alt="MobileIcon" className="ViewSelected" title="Mobile View" onClick={() => { setViewWidth("320") }} id={viewWidth == "320" ? "iconsViewsSelected" : ""} style={{ cursor: "pointer" }} />
                    <img src={TabletIcon} alt="TabletIcon" title="Tablet View" onClick={() => { setViewWidth("480") }} id={viewWidth == "480" ? "iconsViewsSelected" : ""} style={{ cursor: "pointer" }} />
                    <IoDesktopOutline style={{ cursor: "pointer", fontSize: "24px" }} title="Desktop View" onClick={() => { setViewWidth("630") }} id={viewWidth == "630" ? "iconsViewsSelected" : ""} />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              <div className="flex-row-wrap" style={{ display: "flex", width: "100%", height: "100%" }}>
                <div style={{ width: "50%", height: "100%" }}>
                  <Editor
                    width="100%"
                    height="100%"
                    language="html"
                    theme="vs-dark"
                    options={editorOptions}
                    value={prevCode}
                    defaultLanguage="html"
                    onChange={showValue}
                    onMount={handleEditorDidMount}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "center" as const, alignItems: "center" as const, height: "100%", width: "50%" }}>
                  <iframe
                    srcDoc={std_temp}
                    width={`${viewWidth}px`}
                    height="680px"
                    title="email_preview"
                    style={{
                      border: "5px solid #e6e6e6", resize: "horizontal",
                    }}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {blockTempOpen && (
        <div className="modal-dialog-overlay" style={{
          position: "fixed" as const, top: 0, left: 0, width: "100%", height: "100%", 
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", 
          justifyContent: "center" as const, alignItems: "flex-start" as const, paddingTop: "50px"
        }}>
          <div className="modal-content" style={{
            backgroundColor: "#fff", width: "640px", borderRadius: "8px", 
            display: "flex", flexDirection: "column" as const, maxHeight: "80vh"
          }}>
            <div style={{ padding: "15px", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between" as const, alignItems: "center" as const }}>
              <h2 style={{ margin: 0, fontSize: "18px" }}>Use these in your code</h2>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer" }}>✖</button>
            </div>
            <div style={{ padding: "15px", overflowY: "auto" as const, overflowX: "hidden" as const }}>
              {arr && arr.length > 0 && arr.map((item, index) => {
                return (
                  <div key={index}>
                    <div onClick={(e) => handleAddBlockTemplateToTextEditor(item)} style={{ cursor: "pointer", marginTop: "20px", padding: "10px", color: "red", fontWeight: "bold" }}>
                      {item.type} <span className="badge-status" style={{ backgroundColor: "green", color: "white", padding: "2px 5px", borderRadius: "4px", fontSize: "12px" }}>click here to use &#x25BC;</span>
                    </div>
                    <div>
                      <iframe
                        srcDoc={item.code}
                        width="620px"
                        title="code_preview"
                        style={{
                          border: "5px solid #e6e6e6",
                        }}
                      ></iframe>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: "15px", borderTop: "1px solid #ccc", display: "flex", justifyContent: "flex-end" as const }}>
              <button className="btn-accent" style={{ backgroundColor: "blue", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
