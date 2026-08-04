import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTemplate, getDummeyTemplate, getCursorPointer, getBody } from '../../Redux/ProductReducer/action';
import Preview from '../Preview/preview';
import TextEditor from '../LayoutEditor/TextEditor';
import canvasScript from '../../scripts/canvas-runner.js?raw';

function safeLSGet(key: string, fallback: string = ""): string {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key) || fallback;
    }
  } catch (e) {}
  return fallback;
}

function safeLSSet(key: string, val: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch (e) {}
}

const StandardTemplete: React.FC = () => {
  const [items, setItems] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("body") || "[]");
    } catch (e) {
      return [];
    }
  });
  const [isToggleEditor, setToggleEditor] = useState<boolean>(false);
  const [prevCodeData, setPrevCodeData] = useState<{
    index: number | null;
    prevCode: string | null;
    type: string;
  }>({
    index: null,
    prevCode: null,
    type: ''
  });

  const dispatch = useDispatch();
  
  // Safe Redux selector destructuring with default fallbacks
  const productReducer = useSelector((selector: any) => selector?.ProductReducer || {});
  const { 
    Header = '', 
    Footer = '', 
    Body = [], 
    SubjectLine = '', 
    PreHeader = '', 
    PMDate = '', 
    CustomCss = '' 
  } = productReducer;

  const safeBody = Array.isArray(Body) ? Body : [];

  let dummy_fullBody = '';
  let fullBOdy = '';

  safeBody.forEach((e: any, i: number) => {
    if (!e) return;
    fullBOdy = fullBOdy + (e.code || '');
    let cursor = localStorage.getItem("cursorPointer") || 0;
    let categoryLabel = e.type || "";
    const upperType = (e.type || "").toUpperCase();
    if (upperType === "CIMG") categoryLabel = "IMAGE";
    else if (upperType === "HEROIMAGE") categoryLabel = "HERO";
    else if (upperType === "TEXT") categoryLabel = "TEXT";
    else if (upperType === "CTA") categoryLabel = "BUTTON";
    else if (upperType === "CLARAVINE") categoryLabel = "TRACKING";
    else if (upperType === "DOCUMENT") categoryLabel = "DOC NUMBER";

    const rawCode = (e.code || '').trim();
    const isFullTr = /^<tr[\s>]/i.test(rawCode);

    if (isFullTr) {
      // Inject draggable attributes into existing TR element
      let processedTr = rawCode.replace(/^<tr/i, `<tr data-id="${i+1}" class="draggable-row" style="position: relative;" id="row${i}" onclick="getClassName(event)"`);
      if (i == Number(cursor)) {
        processedTr = processedTr.replace(/^<tr/i, `<tr style="border: 1px dashed blue; animation: pulse-border 30s infinite;"`);
      }
      dummy_fullBody = dummy_fullBody + processedTr;
    } else {
      if (i == Number(cursor)) {
        dummy_fullBody = dummy_fullBody +
        `<tr data-id="${i+1}" class="draggable-row" style="position: relative;">
        <td class="great" id="row${i}" onclick="getClassName(event)" style="border: 1px dashed blue; animation: pulse-border 30s infinite; position: relative;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
       ${rawCode}
        
        </tbody>
        </table></td>
        </tr>`;
      } else {
        dummy_fullBody = dummy_fullBody + 
        `<tr data-id="${i+1}" class="draggable-row" style="position: relative;">
        <td id="row${i}" onclick="getClassName(event)" style="position: relative;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
       ${rawCode}
        
        </tbody>
        </table></td>
        </tr>`;
      }
    }
  });

  const [header, setHeader] = useState<string>("");
  const [footer, setFooter] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [contentEditable, setContentEditable] = useState<string>("");

  const handleContentEditable = useCallback(() => {
    setContentEditable(prev => prev === "contentEditable" ? "" : "contentEditable");
  }, []);

  const handleIframeMessage = useCallback((event: any) => {
    if (!event || !event.data) return;

    if (event.data.type === 'customMessage') {
      if (event.data.id === 'reload' || event.data === 'reload') {
        window.location.reload();
      } else if (typeof event.data.id === 'string' && event.data.id.includes('row')) {
        let pointer = event.data.id.split('row')[1] || safeLSGet('cursorPointer', '0') || 0;
        dispatch(getCursorPointer(pointer));
        safeLSSet('cursorPointer', String(pointer));
      }
    } else if (event.data.type === 'reorder') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr)) return;

      const reorderedItems = Array.from(itemsArr);
      const [movedItem] = reorderedItems.splice(event.data.oldIndex, 1);
      reorderedItems.splice(event.data.newIndex, 0, movedItem);

      safeLSSet("body", JSON.stringify(reorderedItems));
      dispatch(getBody(reorderedItems));
      setItems(reorderedItems);
    }
    else if (event.data.type === 'doubleclick' || event.data.type === 'edit-block') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr)) return;
      const movedItem = itemsArr[event.data.index];
      if (!movedItem) return;

      safeLSSet("native_editor_prev_code", movedItem.code || "");
      safeLSSet("native_editor_type_obj", JSON.stringify({ type: movedItem.type, index: event.data.index }));

      const hasPopup = typeof (window as any).init_popup_webview === "function";
      if (hasPopup) {
        (window as any).init_popup_webview("http://127.0.0.1:9732/TextEditor");
        requestAnimationFrame(() => {
          setTimeout(() => {
            const x = Math.round(window.innerWidth * 0.025);
            const y = Math.round(window.innerHeight * 0.025);
            const w = Math.round(window.innerWidth * 0.95);
            const h = Math.round(window.innerHeight * 0.95);
            if (typeof (window as any).sync_popup_bounds === "function") {
              (window as any).sync_popup_bounds(`${x},${y},${w},${h},true`);
            }
          }, 50);
        });
      } else {
        setToggleEditor(true);
      }

      setPrevCodeData({
        index: event.data.index,
        prevCode: movedItem.code || "",
        type: movedItem.type
      });
    }
    else if (event.data.type === 'delete-block') {
      let itemsStr = localStorage.getItem("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr)) return;
      const newItems = itemsArr.filter((_: any, idx: number) => idx !== event.data.index);
      localStorage.setItem("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);
    }
    else if (event.data.type === 'update-block-html') {
      let itemsStr = localStorage.getItem("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr)) return;
      const newItems = Array.from(itemsArr);
      if (newItems[event.data.index]) {
        newItems[event.data.index].code = event.data.code;
      }
      localStorage.setItem("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);
    }
    else if (
      event.data.type === 'enter-edit-mode' ||
      event.data.type === 'exit-edit-mode' ||
      event.data.type === 'set-interaction-mode' ||
      event.data.type === 'element-selected' || 
      event.data.type === 'update-element-code' ||
      event.data.type === 'trigger-erase-confirm' || 
      event.data.type === 'confirm-erase-action'
    ) {
      return;
    }
    else {
      console.warn('Received non-string data:', event.data);
    }
  }, [dispatch]);

  useEffect(() => {
    const ipcChannel = new BroadcastChannel("webview_ipc");
    ipcChannel.onmessage = (event) => {
      const fakeEvent = {
        origin: window.location.origin,
        data: event.data
      };
      handleIframeMessage(fakeEvent);
    };

    const editorChannel = new BroadcastChannel("editor_channel");
    editorChannel.onmessage = (event) => {
      if (event.data && event.data.type === "open-saved-template-modal") {
        document.body?.classList.add("modal-blur-active");
      } else if (event.data && event.data.type === "close-saved-template-modal") {
        document.body?.classList.remove("modal-blur-active");
      }
    };

    return () => {
      ipcChannel.close();
      editorChannel.close();
    };
  }, [handleIframeMessage]);

  let dummy_std_temp = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
  <html lang="EN" id="Emailer">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      <title>${SubjectLine}</title>
      <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
      <style>
        .draggable-row {
          position: relative !important;
          transition: all 0.2s ease-in-out;
        }
        body[data-interaction-mode="move"] .draggable-row:hover {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: -2px;
          cursor: move !important;
        }
        body[data-interaction-mode="move"] .draggable-row * {
          cursor: move !important;
        }
        body[data-interaction-mode="edit"] .draggable-row {
          outline: none !important;
          cursor: default !important;
        }
        body[data-interaction-mode="edit"] .draggable-row:hover {
          outline: none !important;
        }
        body[data-interaction-mode="edit"] .draggable-row * {
          cursor: default !important;
        }
        body[data-interaction-mode="edit"] [contenteditable="true"] {
          cursor: text !important;
        }
        html, body {
          overflow-x: hidden !important;
          margin: 0;
          padding: 0;
        }
        #sortable-root {
          max-width: 100% !important;
          width: 100% !important;
        }
        body {
          transition: filter 0.25s ease-in-out !important;
        }
        .in-webview-modal-backdrop {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(15, 23, 42, 0.45) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 999998 !important;
        }
        .in-webview-modal-card {
          width: 440px !important;
          max-width: 90% !important;
          max-height: 80vh !important;
          background: #ffffff !important;
          border-radius: 20px !important;
          padding: 20px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          font-family: 'Inter', sans-serif !important;
          color: #0f172a !important;
          box-sizing: border-box !important;
        }
        body.modal-blur-active #sortable-root {
          filter: blur(6px) grayscale(0.2) !important;
          transition: filter 0.25s ease-in-out !important;
        }
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid #000000;
          border-radius: 19px !important;
          pointer-events: none !important;
          z-index: 999999 !important;
          box-sizing: border-box !important;
        }
        html.dark body::before,
        @media (prefers-color-scheme: dark) {
          body::before {
            border-color: #ffffff !important;
          }
        }
        img {
          max-width: 100% !important;
          height: auto !important;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          -ms-interpolation-mode: bicubic;
        }
        body, html {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      </style>
      ${CustomCss}
    </head>
  
    <body
      data-interaction-mode="move"
      style="
        font-family: Arial;
        font-size: 12px;
        font-weight: normal;
        color: #151515;
        background: #ffffff;
        margin: 0;
        padding: 0;
        width: 100% !important;
        -ms-overflow-style: none;
        scrollbar-width: none;
      "
      yahoo="fix"
    >
      <style>
        html, body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      </style>
      <!--[if !mso 9]><!-->
      <div
        data-test="pre-header"
        style="
          display: none;
          font-size: 1px;
          color: #151515;
          line-height: 1px;
          max-height: 0px;
          max-width: 0px;
          opacity: 0;
          overflow: hidden;
        "
      >
        ${PreHeader}
      </div>
      <!--<![endif]-->
  
      <table
        width="100%"
        height="100%"
        bgcolor="#F5F5F5"
        border="0"
        cellspacing="0"
        cellpadding="0"
        role="presentation"
        style="height: 100%; min-height: 100vh;"
      >
        <tbody>
          <tr>
            <td align="center" valign="middle" style="height: 100%;">
              <!-- Main Wrapper -->
              <table
                bgcolor="#ffffff"
                width="600"
                height="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                align="center"
                role="presentation"
                id="sortable-root"
                style="border-radius: 19px; overflow: hidden; height: 100%; min-height: 100vh;"
              >
                <tbody>
  
                  ${Header}
  
                  <!-- Draggable body -->
                  <tr style="height: 100%;">
                    <td style="border-radius: 19px; overflow: hidden; height: 100%; vertical-align: middle;">
                      <table width="100%" height="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-radius: 19px; overflow: hidden; height: 100%;" role="presentation">
                        <tbody id="sortable-body" style="overflow: hidden; position: relative; height: 100%;">
                          ${dummy_fullBody || `
                            <tr id="empty-canvas-welcome-row" style="height: 100%;">
                              <td align="center" valign="middle" style="padding: 60px 20px; text-align: center; background: #ffffff; border-radius: 19px; height: 100%;">
                                <table border="0" cellspacing="0" cellpadding="0" align="center" role="presentation" style="margin: 0 auto; width: 100%; max-width: 440px;">
                                  <tbody>
                                    <tr>
                                      <td align="center" style="background: transparent; border-radius: 0; padding: 20px; box-shadow: none; border: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        <table border="0" cellspacing="0" cellpadding="0" align="center" role="presentation" style="margin: 0 auto 16px auto;">
                                          <tbody>
                                            <tr>
                                              <td align="center" valign="middle" style="width: 44px; height: 44px; background: #0284c7; border-radius: 12px; text-align: center;">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto;"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <h2 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 800; letter-spacing: 0.12em; color: #0f172a; text-transform: uppercase; text-align: center;">
                                          WELCOME TO CONTENTGEN
                                        </h2>
                                        <p style="margin: 0 0 24px 0; font-size: 13px; color: #64748b; line-height: 1.6; font-weight: 400; text-align: center;">
                                          Open a previous template or select a HTML template file directly from your system to start editing.
                                        </p>
                                        <button 
                                          type="button"
                                          onclick="if(window.chrome && window.chrome.webview){ window.chrome.webview.postMessage(JSON.stringify({type: 'open-system-file-picker'})); } else { window.parent.postMessage({type: 'open-system-file-picker'}, '*'); }"
                                          style="background: #0284c7; color: #ffffff; border: none; padding: 11px 26px; font-size: 13px; font-weight: 700; border-radius: 10px; cursor: pointer; outline: none; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3); display: inline-block; margin: 0 auto;"
                                        >
                                          Select Template
                                        </button>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          `}
                        </tbody>
                      </table>
                    </td>
                  </tr>
  
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
  
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <script>
        ${canvasScript}
      </script>
    </body>
  </html>`;

  let std_temp = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="EN" ${contentEditable} id="Emailer">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>${SubjectLine}</title>
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
        color: #151515;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
      ${PreHeader}
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
              <tbody id="start">
                
              ${header}

              ${fullBOdy}
              
              
              ${footer}
              
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
</html>`;

  const HandleCodeMode = useCallback((code: string, typeObj: any) => {
    try {
      let LSBodyArray = JSON.parse(localStorage.getItem("body") || "[]");
      if (!Array.isArray(LSBodyArray)) return;
      let newLS = LSBodyArray.map((e: any, i: number) => {
        if (i === typeObj.index) {
          return {
            type: typeObj.type,
            code: code,
          };
        } else {
          return e;
        }
      });
      localStorage.setItem("body", JSON.stringify(newLS));
      dispatch(getBody(newLS));
    } catch (e) {
      console.warn("HandleCodeMode error:", e);
    }
  }, [dispatch]);

  const handleToggleEdiror = useCallback(() => {
    setToggleEditor(false);
  }, []);

  useEffect(() => {
    setHeader(Header);
    setFooter(Footer);
    setBody(Array.isArray(Body) ? Body.join("\n") : "");
    dispatch(getTemplate(std_temp));
    dispatch(getDummeyTemplate(dummy_std_temp));
    
    try {
      localStorage.setItem("body", JSON.stringify(Body));
      localStorage.setItem("footer", Footer);
      localStorage.setItem("header", Header);
      localStorage.setItem("pmdate", PMDate);
      localStorage.setItem("subjectline", SubjectLine);
      localStorage.setItem("preheader", PreHeader);
    } catch (e) {}
  }, [Header, Footer, Body, PMDate, SubjectLine, PreHeader, dispatch]);

  useEffect(() => {
    const syncPopupBounds = () => {
      requestAnimationFrame(() => {
        const hasBinding = typeof (window as any).sync_popup_bounds === "function";
        if (!hasBinding) return;

        const x = Math.round(window.innerWidth * 0.025);
        const y = Math.round(window.innerHeight * 0.025);
        const w = Math.round(window.innerWidth * 0.95);
        const h = Math.round(window.innerHeight * 0.95);

        (window as any).sync_popup_bounds(`${x},${y},${w},${h},true`);
      });
    };

    const channel = new BroadcastChannel("editor_channel");
    channel.onmessage = (event) => {
      if (event.data && event.data.type === "save") {
        const { code, typeObj } = event.data.payload;
        HandleCodeMode(code, typeObj);
        if (typeof (window as any).close_popup_webview === "function") {
          (window as any).close_popup_webview();
        }
      } else if (event.data && event.data.type === "close") {
        if (typeof (window as any).close_popup_webview === "function") {
          (window as any).close_popup_webview();
        }
      }
    };

    window.addEventListener("resize", syncPopupBounds);
    const observer = new MutationObserver(syncPopupBounds);
    observer.observe(document.body, { childList: true, subtree: true });

    syncPopupBounds();

    return () => {
      channel.close();
      window.removeEventListener("resize", syncPopupBounds);
      observer.disconnect();
      if (typeof (window as any).close_popup_webview === "function") {
        (window as any).close_popup_webview();
      }
    };
  }, [dispatch, Body, HandleCodeMode]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <span style={{ display: "none" }}>
        <TextEditor 
          prevCode={prevCodeData.prevCode} 
          typeObj={{ type: prevCodeData.type, index: prevCodeData.index }}  
          onContentChange={HandleCodeMode} 
          state={isToggleEditor} 
          onstateChange={handleToggleEdiror}
        />
      </span>

      <Preview data={{ finalCode: std_temp, handleContentEditable: handleContentEditable }} />
    </div>
  );
};

export default StandardTemplete;