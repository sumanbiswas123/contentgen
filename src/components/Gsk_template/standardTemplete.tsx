import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTemplate, getDummeyTemplate, getCursorPointer, getBody, getHeader, getFooter, getPreHeader, getPM } from '../../Redux/ProductReducer/action';
import Preview from '../Preview/preview';
import TextEditor from '../LayoutEditor/TextEditor';
import canvasScript from '../../scripts/canvas-runner.js?raw';
import PdfToHtml from './PdfToHtml';
import sortableJsScript from 'sortablejs/Sortable.min.js?raw';
import jqueryScript from '../../scripts/jquery-bundle.js?raw';
import gskSanitizer from '../../config/sanitizers/gsk.json';
import jnjSanitizer from '../../config/sanitizers/jnj.json';
import { EMAIL_COMPONENTS_CONFIG } from '../../config/componentsConfig';
import { setupNativeIpcBridge, syncNativePopupWindowBounds } from '../../utils/ipcHandlers';
import CreateEmailDialog from '../Preview/CreateEmailDialog';

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
  const [showPdfModal, setShowPdfModal] = useState(false);




    useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("[Parent] Message received:", event.data);

      if (event.data?.type === "open-pdf-to-html") {
        console.log("[Parent] Opening PDF to HTML popup");

        setShowPdfModal(true);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
  
  // Safe Redux selector destructuring with default fallbacks

  useEffect(() => {
    try {
      const storedBody = localStorage.getItem("body");
      if (storedBody) {
        const parsed = JSON.parse(storedBody);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(getBody(parsed));
          setItems(parsed);
        }
      }
    } catch (e) {}
  }, [dispatch]);

  const activeCompany = (safeLSGet("active_company", "GSK")).toUpperCase();
  const activeSanitizer = activeCompany.includes("JNJ") || activeCompany.includes("J&J") || activeCompany.includes("JOHNSON")
    ? jnjSanitizer
    : gskSanitizer;
  const containerWidth = activeSanitizer.wrapperTable.containerWidth || "700";

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

  const itemsSelector = useSelector((state: any) => state.ProductReducer.Body);
  const safeBody = Array.isArray(itemsSelector) && itemsSelector.length > 0
    ? itemsSelector
    : (Array.isArray(Body) && Body.length > 0 ? Body : []);

  let dummy_fullBody = '';
  let fullBOdy = '';

  safeBody.forEach((e: any, i: number) => {
    if (!e || e.type === "EMPTY_CANVAS") return;
    fullBOdy = fullBOdy + (e.code || '');
    
    const rawCode = (e.code || '').trim();
    const isFullTr = /^<tr[\s>]/i.test(rawCode);

    if (isFullTr) {
      let processedTr = rawCode.replace(/^<tr\b([^>]*)>/i, (m, p1) => {
        const idAttr = ` data-id="${i+1}" id="row${i}" onclick="getClassName(event)" style="position: relative;"`;
        if (p1.includes("class=")) {
          return `<tr${p1.replace(/class=["']/i, '$&draggable-row ')}${idAttr}>`;
        }
        return `<tr class="draggable-row"${p1}${idAttr}>`;
      });
      dummy_fullBody = dummy_fullBody + processedTr;
    } else {
      dummy_fullBody = dummy_fullBody + 
      `<tr data-id="${i+1}" class="draggable-row" style="position: relative;" id="row${i}" onclick="getClassName(event)">
        <td class="grid-cell" style="position: relative; width: 100%;">
          ${rawCode}
        </td>
      </tr>`;
    }
  });

  const [header, setHeader] = useState<string>("");
  const [footer, setFooter] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [contentEditable, setContentEditable] = useState<string>("");

  const handleContentEditable = useCallback(() => {
    setContentEditable(prev => prev === "contentEditable" ? "" : "contentEditable");
  }, []);

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

  const handleIframeMessage = useCallback((data: any) => {
    if (!data) return;

    if (data.type === "create-new-email") {
      const keysToDelete = [
        "footer", "mailImages", "header", "preheader", "pmdate",
        "subjectline", "body", "mailHeaderImages", "mailFooterImages",
        "TrackerId", "CustomCss"
      ];
      keysToDelete.forEach(k => localStorage.removeItem(k));
      dispatch(getHeader(""));
      dispatch(getFooter(""));
      dispatch(getPreHeader(""));
      dispatch(getPM(""));

      const initialBlock = [{
        type: "BLOCK",
        code: EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({ positionOptions: { isFirst: true, isLast: true } })
      }];
      dispatch(getBody(initialBlock));
      safeLSSet("body", JSON.stringify(initialBlock));
    }
    else if (data.type === 'customMessage') {
      if (data.id === 'reload' || data === 'reload') {
        window.location.reload();
      } else if (typeof data.id === 'string' && data.id.includes('row')) {
        let pointer = data.id.split('row')[1] || safeLSGet('cursorPointer', '0') || 0;
        dispatch(getCursorPointer(pointer));
        safeLSSet('cursorPointer', String(pointer));
      }
    } else if (data.type === 'reorder') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr)) return;

      const reorderedItems = Array.from(itemsArr);
      const [movedItem] = reorderedItems.splice(data.oldIndex, 1);
      reorderedItems.splice(data.newIndex, 0, movedItem);

      safeLSSet("body", JSON.stringify(reorderedItems));
      dispatch(getBody(reorderedItems));
      setItems(reorderedItems);
    }
    else if (data.type === 'doubleclick' || data.type === 'edit-block') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr)) return;
      const movedItem = itemsArr[data.index];
      if (!movedItem) return;

      safeLSSet("native_editor_prev_code", movedItem.code || "");
      safeLSSet("native_editor_type_obj", JSON.stringify({ type: movedItem.type, index: data.index }));

      const hasPopup = typeof (window as any).init_popup_webview === "function";
      if (hasPopup) {
        (window as any).init_popup_webview("http://127.0.0.1:9732/TextEditor");
      } else {
        setToggleEditor(true);
      }

      setPrevCodeData({
        index: data.index,
        prevCode: movedItem.code || "",
        type: movedItem.type
      });
    }
    else if (data.type === 'delete-block' || data.type === 'delete-block-at-index') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr)) return;

      const targetIdx = typeof data.blockIndex === "number" && !isNaN(data.blockIndex)
        ? data.blockIndex
        : (typeof data.index === "number" && !isNaN(data.index) ? data.index : -1);

      if (targetIdx < 0 || targetIdx >= itemsArr.length) return;

      let newItems = itemsArr.filter((_: any, idx: number) => idx !== targetIdx);
      if (newItems.length === 0) {
        // Keep an empty block row so the canvas doesn't flip into the initial "Create or Open File" project picker
        newItems = [{
          type: "BLOCK",
          code: EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({ childContents: ["&nbsp;"], rowsCount: 1, colsCount: 1, isResponsive: false })
        }];
      }
      safeLSSet("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);
    }
    else if (data.type === 'copy-block-at-index') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr) || !itemsArr[data.blockIndex]) return;

      const targetBlock = itemsArr[data.blockIndex];
      const clonedBlock = JSON.parse(JSON.stringify(targetBlock));
      const newItems = Array.from(itemsArr);
      newItems.splice(data.blockIndex + 1, 0, clonedBlock);

      safeLSSet("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);

      try {
        if (navigator.clipboard && targetBlock.code) {
          navigator.clipboard.writeText(targetBlock.code);
        }
      } catch (e) {}
    }
    else if (data.type === 'cut-block-at-index') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr) || !itemsArr[data.blockIndex]) return;

      const targetBlock = itemsArr[data.blockIndex];
      try {
        if (navigator.clipboard && targetBlock.code) {
          navigator.clipboard.writeText(targetBlock.code);
        }
      } catch (e) {}

      const newItems = itemsArr.filter((_: any, idx: number) => idx !== data.blockIndex);
      safeLSSet("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);
    }
    else if (data.type === 'add-component-to-cell') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr) || !itemsArr[data.blockIndex]) return;

      const targetBlock = itemsArr[data.blockIndex];
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = targetBlock.code || "";
      
      const colIdx = typeof data.colIndex === "number" ? data.colIndex : 0;
      const cellRegex = new RegExp(`(<td[^>]*class="[^"]*grid-cell[^"]*"[^>]*data-col-index="${colIdx}"[^>]*>)([\\s\\S]*?)(<\\/td>)`, "i");
      const match = cellRegex.exec(targetBlock.code || "");
      if (match) {
        const existingContent = match[2].trim();
        let newContent = "";
        if (existingContent.includes("Child Block") || existingContent.includes("Drag element here") || existingContent.includes("Grid Cell") || existingContent === "&nbsp;" || existingContent === "") {
          newContent = `\n${data.code || ""}\n`;
        } else {
          newContent = `${existingContent}\n${data.code || ""}\n`;
        }
        targetBlock.code = targetBlock.code.replace(cellRegex, `$1${newContent}$3`);
      } else {
        const cellEl = tempDiv.querySelector(`td.grid-cell[data-col-index="${colIdx}"]`) || tempDiv.querySelector("td.grid-cell");
        if (cellEl) {
          const existingContent = cellEl.innerHTML.trim();
          if (existingContent.includes("Child Block") || existingContent.includes("Drag element here") || existingContent.includes("Grid Cell") || existingContent === "&nbsp;" || existingContent === "") {
            cellEl.innerHTML = `\n${data.code || ""}\n`;
          } else {
            cellEl.innerHTML = `${existingContent}\n${data.code || ""}\n`;
          }
          targetBlock.code = tempDiv.innerHTML;
        }
      }

      const newItems = itemsArr.map((b: any, i: number) => i === data.blockIndex ? { ...b, code: targetBlock.code } : b);
      safeLSSet("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);
    }
    else if (data.type === 'update-block-html') {
      let itemsStr = localStorage.getItem("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr)) return;
      const newItems = Array.from(itemsArr);
      if (newItems[data.index]) {
        newItems[data.index].code = data.code;
      }
      localStorage.setItem("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);
    }
    else if (data.type === 'bento-create-horizontal-block') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr) || !itemsArr[data.blockIndex]) return;

      const targetBlock = itemsArr[data.blockIndex];
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = targetBlock.code || "";
      
      const parentBlockTr = tempDiv.querySelector("tr.parent-block");
      const currentRows = parentBlockTr ? parseInt(parentBlockTr.getAttribute("data-rows") || "1", 10) : 1;
      const currentCols = parentBlockTr ? parseInt(parentBlockTr.getAttribute("data-cols") || "1", 10) : 1;
      
      const cells = Array.from(tempDiv.querySelectorAll("td.grid-cell"));
      let currentContents = cells.length > 0 ? cells.map(c => c.innerHTML.trim()) : [targetBlock.code || ""];

      const colIdx = typeof data.colIndex === "number" ? data.colIndex : currentCols - 1;
      const newColsCount = currentCols + 1;

      // Insert new column into each row
      const updatedContents: string[] = [];
      for (let r = 0; r < currentRows; r++) {
        for (let c = 0; c < currentCols; c++) {
          const oldIdx = r * currentCols + c;
          updatedContents.push(currentContents[oldIdx] || "&nbsp;");
          if (c === colIdx) {
            updatedContents.push("&nbsp;");
          }
        }
      }

      const isResponsive = parentBlockTr ? parentBlockTr.getAttribute("data-is-responsive") === "true" : false;

      const newCode = EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({
        childContents: updatedContents,
        rowsCount: currentRows,
        colsCount: newColsCount,
        isResponsive
      });

      const newItems = itemsArr.map((b: any, i: number) => i === data.blockIndex ? { ...b, code: newCode } : b);
      safeLSSet("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);
    }
    else if (data.type === 'bento-create-child-nested-block') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr) || !itemsArr[data.blockIndex]) return;

      const targetBlock = itemsArr[data.blockIndex];
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<table><tbody>${targetBlock.code || ""}</tbody></table>`, "text/html");
      
      const colIdx = typeof data.colIndex === "number" ? data.colIndex : 0;
      const targetCell = doc.querySelector(`td.grid-cell[data-col-index="${colIdx}"]`) || doc.querySelector("td.grid-cell");

      if (targetCell) {
        let existingTable = targetCell.querySelector("table");
        if (!existingTable) {
          const nestedHtml = `
            <table border="0" cellspacing="0" cellpadding="0" role="presentation" style="width: 100%; border-collapse: collapse; background-color: transparent;">
              <tbody>
                <tr style="height: auto;">
                  <td class="grid-cell nested-cell" data-nested-col-index="0" style="width: 50%; vertical-align: top; padding: 4px; position: relative;" valign="top">
                    &nbsp;
                  </td>
                  <td class="grid-cell nested-cell" data-nested-col-index="1" style="width: 50%; vertical-align: top; padding: 4px; position: relative;" valign="top">
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          `;
          targetCell.innerHTML = nestedHtml;
          const tbody = doc.querySelector("tbody");
          targetBlock.code = tbody ? tbody.innerHTML : doc.body.innerHTML;

          const newItems = itemsArr.map((b: any, i: number) => i === data.blockIndex ? { ...b, code: targetBlock.code } : b);
          safeLSSet("body", JSON.stringify(newItems));
          dispatch(getBody(newItems));
          setItems(newItems);
        }
      }
    }
    else if (data.type === 'bento-create-right-section') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr)) return;

      const newBlockCode = EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({
        childContents: [""],
        isResponsive: false
      });
      const newBlockItem = {
        type: "BLOCK",
        code: newBlockCode
      };

      const newItems = Array.from(itemsArr);
      const insertAt = typeof data.blockIndex === "number" ? data.blockIndex + 1 : newItems.length;
      newItems.splice(insertAt, 0, newBlockItem);

      safeLSSet("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);
    }
    else if (data.type === 'bento-clone-horizontal-block') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr) || !itemsArr[data.blockIndex]) return;

      const targetBlock = itemsArr[data.blockIndex];
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = targetBlock.code || "";
      const cells = Array.from(tempDiv.querySelectorAll("td.grid-cell"));
      let currentContents = cells.length > 0 ? cells.map(c => c.innerHTML.trim()) : [targetBlock.code || ""];

      const colIdx = typeof data.colIndex === "number" ? data.colIndex : 0;
      const contentToClone = currentContents[colIdx] || "";
      currentContents.splice(colIdx + 1, 0, contentToClone);

      const parentBlockTr = tempDiv.querySelector("tr.parent-block");
      const isResponsive = parentBlockTr ? parentBlockTr.getAttribute("data-is-responsive") === "true" : false;

      const newCode = EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({
        childContents: currentContents,
        isResponsive
      });

      const newItems = itemsArr.map((b: any, i: number) => i === data.blockIndex ? { ...b, code: newCode } : b);
      safeLSSet("body", JSON.stringify(newItems));
      dispatch(getBody(newItems));
      setItems(newItems);
    }
    else if (data.type === 'add-component-to-cell') {
      let itemsStr = safeLSGet("body");
      if (!itemsStr) return;
      let itemsArr = JSON.parse(itemsStr);
      if (!Array.isArray(itemsArr) || !itemsArr[data.blockIndex]) return;

      const targetBlock = { ...itemsArr[data.blockIndex] };
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<table><tbody>${targetBlock.code || ""}</tbody></table>`, "text/html");

      let targetCell: HTMLTableCellElement | null = null;

      if (data.isChild && typeof data.parentColIndex === "number") {
        // Target nested cell inside specific parent column
        // 1. Get ONLY top-level direct parent cells
        const mainRow = doc.querySelector("tr.child-row") || doc.querySelector("tr");
        const topCols = mainRow ? Array.from(mainRow.children).filter((el) => el.tagName.toLowerCase() === "td") as HTMLTableCellElement[] : [];
        const parentCell = topCols[data.parentColIndex];
        if (parentCell) {
          const nestedTable = parentCell.querySelector("table");
          if (nestedTable) {
            const nestedRow = nestedTable.querySelector("tr");
            const nestedCells = nestedRow
              ? (Array.from(nestedRow.children).filter((el) => el.tagName.toLowerCase() === "td") as HTMLTableCellElement[])
              : Array.from(nestedTable.querySelectorAll<HTMLTableCellElement>("td"));
            targetCell = nestedCells[data.colIndex] || null;
          }
        }
      } else if (typeof data.colIndex === "number") {
        // Target top-level parent column cell
        const mainRow = doc.querySelector("tr.child-row") || doc.querySelector("tr");
        const topCols = mainRow ? Array.from(mainRow.children).filter((el) => el.tagName.toLowerCase() === "td") as HTMLTableCellElement[] : [];
        targetCell = topCols[data.colIndex] || null;
      }

      if (targetCell) {
        const componentHtml = data.code || "";
        targetCell.innerHTML = componentHtml;
        const tbody = doc.querySelector("tbody");
        targetBlock.code = tbody ? tbody.innerHTML : doc.body.innerHTML;

        const newItems = itemsArr.map((b: any, i: number) => i === data.blockIndex ? { ...b, code: targetBlock.code } : b);
        safeLSSet("body", JSON.stringify(newItems));
        dispatch(getBody(newItems));
        setItems(newItems);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    const cleanupIpc = setupNativeIpcBridge(handleIframeMessage);
    const cleanupPopup = syncNativePopupWindowBounds();

    const editorChannel = new BroadcastChannel("editor_channel");
    editorChannel.onmessage = (event) => {
      if (event.data && event.data.type === "save") {
        const { code, typeObj } = event.data.payload;
        HandleCodeMode(code, typeObj);
        if (typeof (window as any).close_popup_webview === "function") {
          (window as any).close_popup_webview();
        }
      } else if (event.data && event.data.type === "open-saved-template-modal") {
        document.body?.classList.add("modal-blur-active");
      } else if (event.data && event.data.type === "close-saved-template-modal") {
        document.body?.classList.remove("modal-blur-active");
      }
    };

    return () => {
      cleanupIpc();
      cleanupPopup();
      editorChannel.close();
    };
  }, [handleIframeMessage, HandleCodeMode]);




  let dummy_std_temp = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
  <html lang="EN" id="Emailer">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      <title>${SubjectLine}</title>
      <script>${jqueryScript}</script>
      <script>${sortableJsScript}</script>
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
      data-interaction-mode="create"
      data-edit-submode="add"
      style="
        background-color: #f8fafc;
        margin: 0 auto;
        padding: 0;
        scrollbar-width: none;
      "
      yahoo="fix"
    >
      <style>
        html, body {
          -ms-overflow-style: none;
          scrollbar-width: none;
          overflow-x: hidden !important;
          width: 100% !important;
          max-width: 100% !important;
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
                width="${containerWidth}"
                height="100%"
                border="0"
                cellspacing="0"
                cellpadding="0"
                align="center"
                role="presentation"
                id="sortable-root"
                style="border-radius: 19px; overflow: hidden; height: 100%; min-height: 100vh; background-color: #ffffff; ${dummy_fullBody || safeBody.some((b: any) => b && b.type === "EMPTY_CANVAS") ? 'background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px); background-size: 16px 16px;' : ''}"
              >
                <tbody>
  
                  ${dummy_fullBody ? Header : ''}
  
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
                                        <button
                                          type="button"
                                          onclick="window.parent.postMessage({ type: 'open-pdf-to-html' }, '*')"
                                          style="background: #0284c7; color: #ffffff; border: none; padding: 11px 26px; font-size: 13px; font-weight: 700; border-radius: 10px; cursor: pointer; outline: none; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3); display: inline-block; margin: 0 auto;"
                                        >
                                          PDF to Html
                                        </button>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          `}
                  <tr>
                    <td style="border-radius: 19px; overflow: hidden; vertical-align: top;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border-radius: 19px; overflow: hidden;" role="presentation">
                        <tbody id="sortable-body" style="overflow: hidden; position: relative;">
                          ${dummy_fullBody}
                        </tbody>
                      </table>
                    </td>
                  </tr>
  
                  ${dummy_fullBody ? Footer : ''}
                  ${dummy_fullBody ? PMDate : ''}
  
                  <!-- Gmail App Fix -->
                 <tr class="gmail-fix">
                   <td>
                     <table
                       cellpadding="0"
                       cellspacing="0"
                       border="0"
                       align="center"
                       width="${containerWidth}"
                       role="presentation"
                     >
                       <tbody>
                         <tr>
                           <td
                             bgcolor="#f8f6f5"
                             height="1"
                             style="line-height: 1px; min-width: ${containerWidth}px"
                           >
                             <img
                               src="assets/trans.png"
                               width="${containerWidth}"
                               height="1"
                               alt=""
                               style="
                                 display: block;
                                 max-height: 1px;
                                 min-height: 1px;
                                 min-width: ${containerWidth}px;
                                 width: ${containerWidth}px;
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
              width="${containerWidth}"
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

  const isEmptyBody = (() => {
    let empty = true;
    if (Array.isArray(safeBody) && safeBody.length > 0 && safeBody.some((b: any) => b && b.type !== "EMPTY_CANVAS")) {
      empty = false;
    } else {
      try {
        const lsStr = localStorage.getItem("body");
        if (lsStr) {
          const parsed = JSON.parse(lsStr);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((b: any) => b && b.type !== "EMPTY_CANVAS")) {
            empty = false;
          }
        }
      } catch (e) {}
    }
    return empty;
  })();

  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);

  // Register global __onProjectFolderCreated callback for native Zig backend
  useEffect(() => {
    (window as any).__onProjectFolderCreated = (res: { path: string; indexPath: string }) => {
      console.log("[ProjectFolder] Native Zig created:", res.indexPath);

      try {
        localStorage.setItem("opened_file_path", res.indexPath);
      } catch (e) {}

      const keysToDelete = [
        "footer", "mailImages", "header", "preheader", "pmdate",
        "subjectline", "body", "mailHeaderImages", "mailFooterImages",
        "TrackerId", "CustomCss"
      ];
      for (const key of keysToDelete) {
        try { localStorage.removeItem(key); } catch (e) {}
      }

      dispatch(getHeader(""));
      dispatch(getFooter(""));
      dispatch(getPreHeader(""));
      dispatch(getPM(""));

      const newBody = [{
        type: "BLOCK",
        code: EMAIL_COMPONENTS_CONFIG["BLOCK"]?.generateHtml({ positionOptions: { isFirst: true, isLast: true } }) || ""
      }];

      localStorage.setItem("body", JSON.stringify(newBody));
      dispatch(getBody(newBody));
    };

    const handleMsg = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch (e) {}
      }
      if (data && data.type === "create-new-email") {
        setShowCreateDialog(true);
      } else if (data && data.type === "open-system-file-picker") {
        (window as any).__onNativeFileSelected = (res: { path: string; content: string }) => {
          console.log("[StandardTemplete] __onNativeFileSelected received:", res.path);
          let rawContent = res.content || "";
          let htmlContent = "";
          try {
            const binaryString = window.atob(rawContent);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            htmlContent = new TextDecoder("utf-8").decode(bytes);
          } catch (e) {
            htmlContent = rawContent;
          }

          let sectionItems: { type: string; code: string }[] = [];
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, "text/html");
            const sortableBody = doc.getElementById("sortable-body");
            if (sortableBody) {
              sortableBody.querySelectorAll(".bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box").forEach((el) => el.remove());
              const rows = Array.from(sortableBody.children).filter((el) => el.classList.contains("draggable-row") || el.tagName.toLowerCase() === "tr");
              rows.forEach((rowEl) => {
                const cleanRow = rowEl.cloneNode(true) as Element;
                cleanRow.querySelectorAll(".bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box").forEach((el) => el.remove());
                
                // Remove injected canvas editor attributes & classes
                cleanRow.removeAttribute("data-id");
                cleanRow.removeAttribute("id");
                cleanRow.removeAttribute("onclick");
                cleanRow.removeAttribute("style");
                cleanRow.classList.remove("draggable-row");
                cleanRow.querySelectorAll(".grid-cell").forEach(cell => {
                  cell.classList.remove("grid-cell");
                  cell.removeAttribute("data-editor-padding");
                });

                const rowTd = cleanRow.querySelector("td[id^='row']");
                let code = "";
                if (rowTd) {
                  const innerTable = rowTd.querySelector("table");
                  code = innerTable ? innerTable.outerHTML : rowTd.innerHTML;
                } else {
                  code = cleanRow.innerHTML;
                }
                if (code.trim()) {
                  sectionItems.push({ type: "BLOCK", code: code.trim() });
                }
              });
            } else {
              const tables = Array.from(doc.querySelectorAll("table"));
              for (const tbl of tables) {
                const trs = Array.from(tbl.querySelectorAll(":scope > tbody > tr, :scope > tr"));
                if (trs.length > 0) {
                  trs.forEach((trEl) => {
                    if (trEl.outerHTML.trim()) {
                      sectionItems.push({ type: "CUSTOM", code: trEl.outerHTML.trim() });
                    }
                  });
                  break;
                }
              }
            }
          } catch (err) {}

          if (sectionItems.length === 0) {
            sectionItems = [{ type: "CUSTOM", code: htmlContent }];
          }

          if (res.path) {
            try { localStorage.setItem("opened_file_path", res.path); } catch (e) {}
          }

          safeLSSet("body", JSON.stringify(sectionItems));
          dispatch(getBody(sectionItems));
          setItems(sectionItems);
        };

        if (typeof (window as any).open_file_dialog === "function") {
          (window as any).open_file_dialog();
        } else {
          // Standard HTML file input fallback if native binding is absent
          let fileInput = document.getElementById("hidden-fallback-file-input") as HTMLInputElement | null;
          if (!fileInput) {
            fileInput = document.createElement("input");
            fileInput.id = "hidden-fallback-file-input";
            fileInput.type = "file";
            fileInput.accept = ".html,.htm";
            fileInput.style.display = "none";
            document.body.appendChild(fileInput);
          }
          fileInput.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (re) => {
                const htmlContent = re.target?.result as string;
                if (htmlContent) {
                  let sectionItems: { type: string; code: string }[] = [];
                  try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlContent, "text/html");
                    const sortableBody = doc.getElementById("sortable-body");
                    if (sortableBody) {
                      sortableBody.querySelectorAll(".bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box").forEach((el) => el.remove());
                      const rows = Array.from(sortableBody.children).filter((el) => el.classList.contains("draggable-row") || el.tagName.toLowerCase() === "tr");
                      rows.forEach((rowEl) => {
                        const cleanRow = rowEl.cloneNode(true) as Element;
                        cleanRow.querySelectorAll(".bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box").forEach((el) => el.remove());
                        
                        // Strip injected editor attributes from node
                        cleanRow.removeAttribute("data-id");
                        cleanRow.removeAttribute("id");
                        cleanRow.removeAttribute("onclick");
                        if (cleanRow.classList.contains("draggable-row")) {
                          cleanRow.classList.remove("draggable-row");
                        }

                        let code = cleanRow.outerHTML;
                        if (code && code.trim()) {
                          sectionItems.push({ type: "CUSTOM", code: code.trim() });
                        }
                      });
                    } else {
                      const tables = Array.from(doc.querySelectorAll("table"));
                      for (const tbl of tables) {
                        const trs = Array.from(tbl.querySelectorAll(":scope > tbody > tr, :scope > tr"));
                        if (trs.length > 0) {
                          trs.forEach((trEl) => {
                            if (trEl.outerHTML.trim()) {
                              sectionItems.push({ type: "CUSTOM", code: trEl.outerHTML.trim() });
                            }
                          });
                          break;
                        }
                      }
                    }
                  } catch (err) {}

                  if (sectionItems.length === 0) {
                    sectionItems = [{ type: "CUSTOM", code: htmlContent }];
                  }

                  safeLSSet("body", JSON.stringify(sectionItems));
                  dispatch(getBody(sectionItems));
                  setItems(sectionItems);
                }
              };
              reader.readAsText(file);
            }
          };
          fileInput.click();
        }
      }
    };
    window.addEventListener("message", handleMsg);
    return () => {
      delete (window as any).__onProjectFolderCreated;
      window.removeEventListener("message", handleMsg);
    };
  }, [dispatch]);

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

      {showCreateDialog && (
        <CreateEmailDialog
          onCancel={() => setShowCreateDialog(false)}
          onCreate={(pmId) => {
            setShowCreateDialog(false);
            
            const initialBlock = {
              type: "BLOCK",
              code: EMAIL_COMPONENTS_CONFIG["BLOCK"]?.generateHtml({ positionOptions: { isFirst: true, isLast: true } }) || ""
            };
            const newBody = [initialBlock];
            try {
              localStorage.setItem("pmid", pmId);
              localStorage.setItem("body", JSON.stringify(newBody));
            } catch (e) {}

            // Invoke native Zig backend to create physical projects/<PMID>/ folder & index.html immediately!
            if (typeof (window as any).create_email_project === "function") {
              try {
                (window as any).create_email_project(pmId);
              } catch (err) {
                console.warn("[CreateEmailDialog] Native create_email_project call error:", err);
              }
            }

            dispatch(getPM(pmId));
            dispatch(getBody(newBody));
          }}
        />
      )}

      {isEmptyBody ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(2, 132, 199, 0.3)",
              marginBottom: "20px",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>

          <h2
            style={{
              margin: "0 0 10px 0",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#0f172a",
              textTransform: "uppercase",
            }}
          >
            WELCOME TO CONTENTGEN
          </h2>

          <p
            style={{
              margin: "0 0 28px 0",
              fontSize: "14px",
              color: "#64748b",
              maxWidth: "420px",
              lineHeight: 1.6,
              fontWeight: 400,
              textAlign: "center",
            }}
          >
            Open a previous template or select an HTML template file directly from your system to start editing.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => window.postMessage({ type: "open-system-file-picker" }, "*")}
              style={{
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                padding: "12px 24px",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
                transition: "all 0.15s ease",
              }}
            >
              Select Template
            </button>
            <button
              type="button"
              onClick={() => setShowCreateDialog(true)}
              style={{
                background: "#10b981",
                color: "#ffffff",
                border: "none",
                padding: "12px 24px",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                transition: "all 0.15s ease",
              }}
            >
              Create Email
            </button>
            <button
            type="button"
              onClick={() => window.parent.postMessage({ type: 'open-pdf-to-html' }, '*')}
              style={{
                background: "#10b981",
                color: "#ffffff",
                border: "none",
                padding: "12px 24px",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                transition: "all 0.15s ease",
              }}
            >
              Pdf To Html
            </button>
          </div>
        </div>
      ) : (
        <Preview data={{ finalCode: std_temp, handleContentEditable: handleContentEditable }} />
        
      )}
      {showPdfModal && (
        <PdfToHtml />
      )}
    </div>
  );
};

export default StandardTemplete;