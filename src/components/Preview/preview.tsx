import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import { 
  Move, 
  Edit3, 
  Copy, 
  Check, 
  Wand2, 
  X,
  RotateCcw,
  RotateCw,
  Save,
  Tablet
} from "lucide-react";
import { getBody, getHeader, getFooter, getPreHeader, getPM, getCursorPointer } from "../../Redux/ProductReducer/action";
import { EMAIL_COMPONENTS_CONFIG } from "../../config/componentsConfig";
import { useShadowModeEngine } from "../../hooks/useShadowModeEngine";
import CreateEmailDialog from "./CreateEmailDialog";
import DndEmailCanvas from "../DndEngine/DndEmailCanvas";
import gskSanitizer from "../../config/sanitizers/gsk.json";
import jnjSanitizer from "../../config/sanitizers/jnj.json";
import "./preview.css";

interface PreviewProps {
  data?: {
    finalCode?: string;
    handleContentEditable?: () => void;
  };
}



import { useCanvasEngine } from "../../hooks/useCanvasEngine";

interface SelectedElementData {
  tagName: string;
  id: string;
  className: string;
  outerHTML: string;
  innerHTML: string;
  blockIndex: number;
  blockCode?: string;
}

const Preview: React.FC<PreviewProps> = ({ data }) => {
  const { addHorizontalBlock, addRightSection, cloneHorizontalBlock, updateBlockColumnWidths, updateChildColumnWidths, updateParentGridMatrix, deleteBlock, deleteColumn, clearCellContent } = useCanvasEngine();
  // Device Mode State ('desktop' | 'mobile')
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [desktopWidth, setDesktopWidth] = useState<string>("700");
  const [mobileWidth, setMobileWidth] = useState<number>(375);

  // Compute active view width dynamically
  const activeViewWidth = deviceMode === "desktop" ? desktopWidth : String(mobileWidth);

  // Edit mode state & submode state ("create" | "edit", "add" | "move", "default" | "text" | "assets")
  const [interactionMode, setInteractionMode] = useState<"create" | "edit">("create");
  const [createSubmode, setCreateSubmode] = useState<"add" | "move">("add");
  const [editSubmode, setEditSubmode] = useState<"default" | "text" | "assets">("default");
  const [selectedElement, setSelectedElement] = useState<SelectedElementData | null>(null);
  const [editedCode, setEditedCode] = useState<string>("");
  const [isDockOpen, setIsDockOpen] = useState<boolean>(false);
  const [isGlobalDragging, setIsGlobalDragging] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const historyRef = useRef<{ items: any[]; editedCode: string }[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [history, setHistory] = useState<{ items: any[]; editedCode: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [currentPmId, setCurrentPmId] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const dispatch = useDispatch();
  // Refs so mode engine callbacks always see latest values without re-creating
  const editedCodeRef = useRef<string>("");

  const Template = useSelector((selector: any) => selector.ProductReducer.DummeyTemplate);
  const CleanTemplate = useSelector((selector: any) => selector.ProductReducer.Template);
  const BrandThemeColor = useSelector((selector: any) => selector.ProductReducer.BrandThemeColor);

  const templateModified = Template ? Template.replace(/\${BrandThemeColor}/g, BrandThemeColor) : "";

  // Register safe global getClassName function to handle legacy inline onclick attributes in template rows
  useEffect(() => {
    (window as any).getClassName = (event: any) => {
      // Only open code editor dock in EDIT mode!
      if (interactionMode !== "edit") return;
      const target = event ? event.currentTarget || event.target : null;
      if (target) {
        setSelectedElement({
          tagName: (target.tagName || "tr").toLowerCase(),
          id: target.id || "",
          className: typeof target.className === "string" ? target.className : "",
          outerHTML: target.outerHTML || "",
          innerHTML: target.innerHTML || "",
          blockIndex: 0
        });
        setEditedCode(target.outerHTML || "");
        setIsDockOpen(true);
      }
    };
  }, [interactionMode]);

  // Mount & Update Shadow DOM Canvas (Zero iframe, zero CSS bleed)
  useEffect(() => {
    if (!containerRef.current) return;
    if (!shadowRootRef.current) {
      shadowRootRef.current = containerRef.current.attachShadow({ mode: "open" });
    }
    if (shadowRootRef.current) {
      shadowRootRef.current.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            background: #ffffff;
            box-sizing: border-box;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE/Edge */
          }
          :host::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
            width: 0;
            height: 0;
          }
          .drag-target-active {
            outline: 2.5px dashed #0284c7 !important;
            outline-offset: -3px !important;
            background-color: rgba(2, 132, 199, 0.12) !important;
            box-shadow: 0 0 15px rgba(2, 132, 199, 0.25) !important;
            transition: all 0.15s ease !important;
          }
          .sortable-ghost {
            opacity: 0.35;
            background: rgba(2, 132, 199, 0.08);
          }
          .sortable-chosen {
            outline: 2px solid #0284c7;
          }
        </style>
        ${templateModified || ""}
      `;

      // Button click delegation — only action buttons (Select Template / Create Email)
      const shadowRoot = shadowRootRef.current;
      const handleButtonClick = (e: MouseEvent) => {
        const path = e.composedPath ? e.composedPath() : [];
        const btn = path.find((n) => n instanceof HTMLElement && (n as HTMLElement).tagName.toLowerCase() === "button") as HTMLButtonElement | undefined;
        if (!btn) return;
        const text = (btn.textContent || "").trim().toLowerCase();
        if (text.includes("select template")) {
          e.preventDefault(); e.stopPropagation();
          window.postMessage({ type: "open-system-file-picker" }, "*");
        } else if (text.includes("create email")) {
          e.preventDefault(); e.stopPropagation();
          window.postMessage({ type: "create-new-email" }, "*");
        }
      };
      shadowRoot.addEventListener("click", handleButtonClick);
      return () => shadowRoot.removeEventListener("click", handleButtonClick);
    }
  }, [templateModified]);

  // Keep refs in sync so useShadowModeEngine always reads latest values
  useEffect(() => { editedCodeRef.current = editedCode; }, [editedCode]);

  // Shadow DOM–scoped mode engine (ADD / MOVE / EDIT) — zero bleed to outer React UI
  const Body = useSelector((selector: any) => selector?.ProductReducer?.Body || []);
  useShadowModeEngine({
    shadowRootRef,
    interactionMode,
    createSubmode,
    editSubmode,
    body: Body,
    dispatch,
    setSelectedElement: (el) => setSelectedElement(el as any),
    setEditedCode,
    setIsDockOpen,
    isDockOpen,
  });

  const lastRecordedBodyJsonRef = useRef<string>("");
  const isUndoRedoActionRef = useRef<boolean>(false);
  const savedHistoryIndexRef = useRef<number>(0);

  // Sync Body array changes into history stack for Undo/Redo
  useEffect(() => {
    if (!Array.isArray(Body) || Body.length === 0) return;

    const bodyJson = JSON.stringify(Body);
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      lastRecordedBodyJsonRef.current = bodyJson;
      return;
    }

    if (bodyJson !== lastRecordedBodyJsonRef.current) {
      lastRecordedBodyJsonRef.current = bodyJson;

      const curIdx = historyIndexRef.current;
      const currentHistory = curIdx >= 0 ? historyRef.current.slice(0, curIdx + 1) : [];
      currentHistory.push({ items: Body, editedCode: editedCodeRef.current });
      const trimmed = currentHistory.slice(-50);
      const newIdx = trimmed.length - 1;

      historyRef.current = trimmed;
      historyIndexRef.current = newIdx;
      setHistory(trimmed);
      setHistoryIndex(newIdx);
      setHasUnsavedChanges(true);
    }
  }, [Body]);

  useEffect(() => {
    const handleDragStart = () => setIsGlobalDragging(true);
    const handleDragEnd = () => setIsGlobalDragging(false);

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    window.addEventListener("dragstart", handleDragStart, true);
    window.addEventListener("dragend", handleDragEnd, true);
    window.addEventListener("drop", handleDragEnd, true);
    window.addEventListener("dragover", handleDragOver, true);
    window.addEventListener("dragenter", handleDragOver, true);
    document.addEventListener("dragover", handleDragOver, true);
    document.addEventListener("dragenter", handleDragOver, true);

    return () => {
      window.removeEventListener("dragstart", handleDragStart, true);
      window.removeEventListener("dragend", handleDragEnd, true);
      window.removeEventListener("drop", handleDragEnd, true);
      window.removeEventListener("dragover", handleDragOver, true);
      window.removeEventListener("dragenter", handleDragOver, true);
      document.removeEventListener("dragover", handleDragOver, true);
      document.removeEventListener("dragenter", handleDragOver, true);
    };
  }, []);


  const handleModeChange = (newMode: "create" | "edit") => {
    setInteractionMode(newMode);
    if (newMode === "create") {
      setSelectedElement(null);
      setIsDockOpen(false);
    }
  };

  const handleCreateSubmodeChange = (sub: "add" | "move") => setCreateSubmode(sub);
  const handleSubmodeChange = (sub: "default" | "text" | "assets") => setEditSubmode(sub);


  const [openedFilePath, setOpenedFilePath] = useState<string>(() => {
    try {
      return localStorage.getItem("opened_file_path") || "";
    } catch (e) {
      return "";
    }
  });

  // Listen for element selection and IPC messages from standardTemplete inside webview
  useEffect(() => {
    const handleIncomingMessage = (event: any) => {
      let data = event ? event.data || event : null;
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch (e) {}
      }
      if (!data) return;
      if (data.type === "reorder") {
        const { oldIndex, newIndex } = data;
        if (typeof oldIndex === "number" && typeof newIndex === "number" && oldIndex !== newIndex) {
          try {
            const items = JSON.parse(localStorage.getItem("body") || "[]");
            if (Array.isArray(items) && oldIndex < items.length && newIndex < items.length) {
              const newItems = Array.from(items);
              const [movedItem] = newItems.splice(oldIndex, 1);
              newItems.splice(newIndex, 0, movedItem);
              localStorage.setItem("body", JSON.stringify(newItems));
              dispatch(getBody(newItems));

              // Push to Undo/Redo history and set unsaved changes red dot
              setHistory(prev => {
                const updated = prev.slice(0, historyIndex + 1);
                updated.push({ items: newItems, editedCode });
                return updated;
              });
              setHistoryIndex(prev => prev + 1);
              setHasUnsavedChanges(true);
            }
          } catch (e) {
            console.error("Reorder failed:", e);
          }
        }
      } else if (data.type === "confirm-erase-action") {
        try {
          localStorage.removeItem("opened_file_path");
        } catch (e) {}
        setOpenedFilePath("");
        setHasUnsavedChanges(false);
        setInteractionMode("create");
        setCreateSubmode("add");
        setEditSubmode("default");
        setSelectedElement(null);
        setIsDockOpen(false);
        setEditedCode("");
      } else if (data.type === "bento-create-horizontal-block") {
        const { blockIndex, colIndex } = data;
        console.log("[PREVIEW IPC] Received bento-create-horizontal-block signal! blockIndex:", blockIndex, "colIndex:", colIndex);
        addHorizontalBlock(blockIndex, colIndex);
        setHasUnsavedChanges(true);
      } else if (data.type === "bento-create-right-section") {
        const { blockIndex } = data;
        console.log("[PREVIEW IPC] Received bento-create-right-section signal! blockIndex:", blockIndex);
        addRightSection(blockIndex);
        setHasUnsavedChanges(true);
      } else if (data.type === "bento-clone-horizontal-block") {
        const { blockIndex, colIndex } = data;
        console.log("[PREVIEW IPC] Received bento-clone-horizontal-block signal! blockIndex:", blockIndex, "colIndex:", colIndex);
        cloneHorizontalBlock(blockIndex, colIndex);
        setHasUnsavedChanges(true);
      } else if (data.type === "bento-update-col-widths") {
        const { blockIndex, colWidths } = data;
        updateBlockColumnWidths(blockIndex, colWidths);
        setHasUnsavedChanges(true);
      } else if (data.type === "bento-update-child-col-widths") {
        const { blockIndex, parentColIndex, childWidths } = data;
        updateChildColumnWidths(blockIndex, parentColIndex, childWidths);
        setHasUnsavedChanges(true);
      } else if (data.type === "bento-update-grid-matrix") {
        const { blockIndex, rows, cols } = data;
        updateParentGridMatrix(blockIndex, rows, cols);
        setHasUnsavedChanges(true);
      } else if (data.type === "update-block-html") {
        const { index, code } = data;
        if (typeof index === "number" && typeof code === "string") {
          try {
            const items = JSON.parse(localStorage.getItem("body") || "[]");
            if (Array.isArray(items) && items[index]) {
              const newItems = Array.from(items);
              newItems[index].code = code;
              localStorage.setItem("body", JSON.stringify(newItems));
              dispatch(getBody(newItems));

              // Push to Undo/Redo history and set unsaved changes red dot
              setHistory(prev => {
                const updated = prev.slice(0, historyIndex + 1);
                updated.push({ items: newItems, editedCode });
                return updated;
              });
              setHistoryIndex(prev => prev + 1);
              setHasUnsavedChanges(true);
            }
          } catch (e) {
            console.error("update-block-html error:", e);
          }
        }
      } else if (data.type === "element-selected" && data.element) {
        const el = data.element;
        setSelectedElement(el);
        // Show only the clicked element's code in the editor, not the whole block
        setEditedCode(el.elementCode || el.outerHTML || "");
      } else if (data.type === "update-element-html") {
        const { newOuterHTML } = data;
        if (typeof newOuterHTML === "string") {
          try {
            const shadowRoot = shadowRootRef.current;
            const activeEl = (shadowRoot as any)?.__activeSelectedElement as HTMLElement | undefined;

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = newOuterHTML;
            const newEl = tempDiv.firstElementChild as HTMLElement | null;

            // 1. Live Canvas DOM Mutation
            if (activeEl && shadowRoot?.contains(activeEl) && newEl) {
              activeEl.replaceWith(newEl);
              (shadowRoot as any).__activeSelectedElement = newEl;
            }

            // 2. Persist updated block code to localStorage.body & Redux state so re-renders retain edited images/text
            const items = JSON.parse(localStorage.getItem("body") || "[]");
            const idx = typeof data.blockIndex === "number" ? data.blockIndex : 0;
            if (Array.isArray(items) && items[idx] && newEl) {
              const blockDiv = document.createElement("div");
              blockDiv.innerHTML = items[idx].code || "";
              const elId = newEl.getAttribute("data-el-id");
              const targetNode = (elId ? blockDiv.querySelector(`[data-el-id="${elId}"]`) : null)
                || blockDiv.querySelector("img")
                || blockDiv.querySelector("a")
                || blockDiv.firstElementChild;
              if (targetNode) {
                targetNode.replaceWith(newEl.cloneNode(true));
                items[idx].code = blockDiv.innerHTML;
              } else {
                items[idx].code = newOuterHTML;
              }
              localStorage.setItem("body", JSON.stringify(items));
              dispatch(getBody(items));
            }

            // 3. Immediately serialize live canvas DOM and save directly to file on disk!
            saveProductionHtmlToDisk();

            setHasUnsavedChanges(true);
          } catch (e) {
            console.error("update-element-html direct mutation error:", e);
            setHasUnsavedChanges(true);
          }
        }
      } else if (data.type === "add-section-at-index") {
        const { blockIndex, position } = data;
        let currentBody: any[] = [];
        try {
          currentBody = JSON.parse(localStorage.getItem("body") || "[]") || [];
        } catch (e) {}

        const newBlock = {
          type: "BLOCK",
          code: EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml()
        };

        const targetIdx = typeof blockIndex === "number" ? blockIndex : 0;
        const insertIdx = position === "above" ? Math.max(0, targetIdx) : targetIdx + 1;

        currentBody.splice(insertIdx, 0, newBlock);
        localStorage.setItem("body", JSON.stringify(currentBody));
        dispatch(getBody(currentBody));
        saveProductionHtmlToDisk(currentBody);
      } else if (data.type === "drop-component-in-cell") {
        const blockType = data.blockType || "CIMG";
        const config = EMAIL_COMPONENTS_CONFIG[blockType];
        const componentHtml = data.code || (config ? config.generateHtml() : "");

        let currentBody: any[] = [];
        try {
          currentBody = JSON.parse(localStorage.getItem("body") || "[]") || [];
        } catch (e) {}

        if (currentBody.length === 0) {
          const initialParent = {
            type: "BLOCK",
            code: EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({ positionOptions: { isFirst: true, isLast: true } })
          };
          currentBody = [initialParent];
        }

        const blockIdx = Math.min(currentBody.length - 1, Math.max(0, data.blockIndex || 0));
        const colIdx = data.colIndex || 0;
        const targetBlock = { ...currentBody[blockIdx] };
        const updatedBody = Array.from(currentBody);

        const parser = new DOMParser();
        const doc = parser.parseFromString(`<table><tbody>${targetBlock.code || ""}</tbody></table>`, "text/html");

        let cell = doc.querySelector(`.grid-cell[data-col-index="${colIdx}"]`) || doc.querySelector(".grid-cell");
        if (cell) {
          let wrappedComponent = componentHtml.trim();
          if (wrappedComponent.startsWith("<tr") && !wrappedComponent.includes("<table")) {
            wrappedComponent = `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; border-collapse: collapse;"><tbody>${wrappedComponent}</tbody></table>`;
          }
          cell.innerHTML = wrappedComponent;

          const tbody = doc.querySelector("tbody");
          targetBlock.code = tbody ? tbody.innerHTML : doc.body.innerHTML;
          updatedBody[blockIdx] = targetBlock;
        }

        localStorage.setItem("body", JSON.stringify(updatedBody));
        dispatch(getBody(updatedBody));
        dispatch(getCursorPointer(blockIdx));
        (window as any).__activeDragPayload = null;
        setTimeout(() => saveProductionHtmlToDisk(updatedBody), 100);
      } else if (data.type === "child-mouse-up" || data.type === "drop-new-block") {
        const payload = (window as any).__activeDragPayload || (data.blockType ? { blockType: data.blockType, code: data.code } : null);
        if (payload && (payload.type === "ADD_BLOCK" || payload.blockType)) {
          const blockType = payload.blockType || "BLOCK";
          const config = EMAIL_COMPONENTS_CONFIG[blockType];
          const isAtomicComponent = config && config.category === "component";

          let currentBody: any[] = [];
          try {
            currentBody = JSON.parse(localStorage.getItem("body") || "[]") || [];
          } catch (e) {}

          if (currentBody.length === 0) {
            const initialParent = {
              type: "BLOCK",
              code: EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml()
            };
            currentBody = [initialParent];
          }

          let targetIndex = Math.max(0, currentBody.length - 1);
          if (containerRef.current && typeof data.clientY === "number" && currentBody.length > 0) {
            const rect = containerRef.current.getBoundingClientRect();
            const relY = Math.max(0, data.clientY - rect.top);
            const totalH = rect.height || 1;
            const slotH = totalH / currentBody.length;
            targetIndex = Math.min(currentBody.length - 1, Math.max(0, Math.floor(relY / slotH)));
          }

          const componentHtml = payload.code || (config ? config.generateHtml() : "");
          const updatedBody = Array.from(currentBody);

          if (isAtomicComponent && currentBody.length > 0) {
            const blockIdx = Math.min(currentBody.length - 1, Math.max(0, targetIndex));
            const targetBlock = { ...currentBody[blockIdx] };

            const parser = new DOMParser();
            const doc = parser.parseFromString(`<table><tbody>${targetBlock.code || ""}</tbody></table>`, "text/html");

            let cell = doc.querySelector('.grid-cell[data-col-index="0"]') || doc.querySelector(".grid-cell");
            if (cell) {
              let wrappedComponent = componentHtml.trim();
              if (wrappedComponent.startsWith("<tr") && !wrappedComponent.includes("<table")) {
                wrappedComponent = `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; border-collapse: collapse;"><tbody>${wrappedComponent}</tbody></table>`;
              }
              cell.innerHTML = wrappedComponent;

              const tbody = doc.querySelector("tbody");
              targetBlock.code = tbody ? tbody.innerHTML : doc.body.innerHTML;
              updatedBody[blockIdx] = targetBlock;
            }
          } else {
            // Drop new standalone layout BLOCK row
            let blockHtml = componentHtml;
            if (!blockHtml.includes("parent-block")) {
              blockHtml = EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({ childContents: [componentHtml] });
            }
            updatedBody.splice(targetIndex + 1, 0, { type: blockType, code: blockHtml });
          }

          localStorage.setItem("body", JSON.stringify(updatedBody));
          dispatch(getBody(updatedBody));
          dispatch(getCursorPointer(targetIndex));
          (window as any).__activeDragPayload = null;
        }
      } else if (data.type === "delete-block" || data.type === "delete-block-at-index") {
        const targetIdx = typeof data.blockIndex === "number" && !isNaN(data.blockIndex)
          ? data.blockIndex
          : (typeof data.index === "number" && !isNaN(data.index) ? data.index : -1);
        if (targetIdx >= 0) {
          deleteBlock(targetIdx);
        }
      } else if (data.type === "delete-column-at-index") {
        if (typeof data.blockIndex === "number" && typeof data.colIndex === "number") {
          deleteColumn(data.blockIndex, data.colIndex, data.isChild, data.parentColIdx);
        }
      } else if (data.type === "clear-cell-at-index") {
        if (typeof data.blockIndex === "number" && typeof data.colIndex === "number") {
          clearCellContent(data.blockIndex, data.colIndex, data.isChild, data.parentColIdx);
        }
      } else if (data.type === "canvas-undo") {
        handleUndo();
      } else if (data.type === "canvas-redo") {
        handleRedo();
      } else if (data.type === "open-system-file-picker") {
        console.log("[FilePicker] Triggered. Calling native open_file_dialog()");
        (window as any).__onNativeFileSelected = (res: { path: string; content: string }) => {
          console.log("[FilePicker] __onNativeFileSelected payload received");
          let rawContent = res.content || "";
          
          let htmlContent = "";
          try {
            // First decode Base64 into UTF-8 bytes using TextDecoder
            const binaryString = window.atob(rawContent);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            htmlContent = new TextDecoder("utf-8").decode(bytes);
          } catch (e) {
            htmlContent = rawContent;
          }

          // Fix double/triple UTF-8 mojibake encoding artifacts (e.g. ÃÃÂ¡ => á, Ã¡ => á)
          const fixMojibake = (str: string): string => {
            let result = str;
            for (let attempt = 0; attempt < 3; attempt++) {
              if (result.includes("Ã") || result.includes("Â") || result.includes("ï¿½")) {
                try {
                  const bytes = new Uint8Array(Array.from(result, char => char.charCodeAt(0) & 0xFF));
                  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
                  if (decoded && decoded !== result && !decoded.includes("\uFFFD")) {
                    result = decoded;
                  } else {
                    break;
                  }
                } catch (err) {
                  break;
                }
              } else {
                break;
              }
            }
            return result;
          };

          htmlContent = fixMojibake(htmlContent);

          const rawPath = res.path || "";
          if (rawPath) {
            try {
              localStorage.setItem("opened_file_path", rawPath);
            } catch (e) {}
            setOpenedFilePath(rawPath);
            const normalized = rawPath.replace(/\\/g, "/");
            const lastSlashIndex = normalized.lastIndexOf("/");
            if (lastSlashIndex !== -1) {
              const dirPath = normalized.substring(0, lastSlashIndex + 1);
              // Route image requests directly through Zig's embedded HTTP disk server on 127.0.0.1:9732
              const baseUri = "http://127.0.0.1:9732/" + dirPath.replace(/^\//, "");
              console.log("[FilePicker] Embedded HTTP disk baseUri:", baseUri);

              htmlContent = htmlContent.replace(
                /(<img[^>]+src=["'])(?!(?:https?:\/\/|data:|file:\/\/\/))([^"']*)(["'])/gi,
                (match, p1, p2, p3) => {
                  const cleanImg = p2.replace(/^\.\//, "");
                  const fullImgSrc = `${baseUri}${cleanImg}`;
                  console.log("[FilePicker] Rewriting img src:", p2, "==>", fullImgSrc);
                  return `${p1}${fullImgSrc}${p3}`;
                }
              );
            }
          }
          // Parse top-level body rows or major content sections into separate draggable array items
          let sectionItems: { type: string; code: string }[] = [];
          try {
            const parser = new DOMParser();
            // Prepend meta charset=utf-8 to guarantee DOMParser processes Spanish / special characters correctly
            const utf8SafeContent = htmlContent.includes("charset=") 
              ? htmlContent 
              : `<meta charset="utf-8">\n${htmlContent}`;
            const doc = parser.parseFromString(utf8SafeContent, "text/html");
            
            // 1. First check for #sortable-body (Online/Template format)
            const sortableBody = doc.getElementById("sortable-body");
            if (sortableBody) {
              // Strip helper drop box elements first
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
              // 2. Local exported files: Find main body container (e.g. #start, .Container, table > tbody)
              const containerTbody = doc.querySelector("#start") || doc.querySelector("table.Container > tbody") || doc.querySelector("table#sortable-root > tbody");
              let candidateRows: Element[] = [];

              if (containerTbody) {
                candidateRows = Array.from(containerTbody.children).filter(el => el.tagName.toLowerCase() === "tr");
              } else {
                // Find all tables and pick the main email layout table with multiple tr children
                const tables = Array.from(doc.querySelectorAll("table"));
                for (const tbl of tables) {
                  const trs = Array.from(tbl.querySelectorAll(":scope > tbody > tr, :scope > tr"));
                  if (trs.length > 1) {
                    candidateRows = trs;
                    break;
                  }
                }
              }

              candidateRows.forEach((trEl) => {
                const code = trEl.outerHTML;
                if (code && code.trim()) {
                  sectionItems.push({ type: "CUSTOM", code: code.trim() });
                }
              });

              // Fallback: if sectionItems is still empty, parse all direct table or top-level section blocks
              if (sectionItems.length === 0) {
                const topBlocks = doc.querySelectorAll("body > table, body > div");
                if (topBlocks.length > 0) {
                  topBlocks.forEach((block) => {
                    if (block.outerHTML.trim()) {
                      sectionItems.push({ type: "CUSTOM", code: block.outerHTML });
                    }
                  });
                }
              }
            }
          } catch (e) {
            console.warn("[FilePicker] Section parsing error:", e);
          }

          if (sectionItems.length === 0) {
            sectionItems = [{ type: "CUSTOM", code: htmlContent }];
          }

          localStorage.setItem("body", JSON.stringify(sectionItems));
          window.location.reload();
        };

        if (typeof (window as any).open_file_dialog === "function") {
          (window as any).open_file_dialog();
        } else {
          console.error("[FilePicker] ERROR: Native open_file_dialog function is NOT bound to window!");
          alert("Native open_file_dialog is not available. Please rebuild the native host application.");
        }
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("webview_ipc");
      channel.onmessage = handleIncomingMessage;
    } catch (e) {
      console.warn("BroadcastChannel init failed:", e);
    }
    window.addEventListener("message", handleIncomingMessage);

    if (typeof (window as any).chrome?.webview?.addEventListener === "function") {
      (window as any).chrome.webview.addEventListener("message", handleIncomingMessage);
    }

    // Primary IPC path: Zig relay calls eval_in_parent → window.__onChildMessage(jsonObj)
    // This is the only channel that works across separate native WebView2 windows.
    (window as any).__onChildMessage = (data: any) => {
      handleIncomingMessage({ data });
    };

    return () => {
      if (channel) channel.close();
      window.removeEventListener("message", handleIncomingMessage);
      if (typeof (window as any).chrome?.webview?.removeEventListener === "function") {
        (window as any).chrome.webview.removeEventListener("message", handleIncomingMessage);
      }
      delete (window as any).__onChildMessage;
    };
  }, []);

  // Register __onProjectFolderCreated — fires when Zig finishes creating the project folder
  useEffect(() => {
    (window as any).__onProjectFolderCreated = (res: { path: string; indexPath: string }) => {
      console.log("[ProjectFolder] Created:", res.indexPath);

      // Set file path for future Ctrl+S saves
      try { localStorage.setItem("opened_file_path", res.indexPath); } catch (e) {}
      setOpenedFilePath(res.indexPath);

      // Derive pmId from path (last path segment)
      const normalized = res.path.replace(/\\/g, "/");
      const parts = normalized.split("/");
      const pmId = parts[parts.length - 1] || "";
      setCurrentPmId(pmId);
      (window as any).__currentPmId = pmId;

      // Clear canvas
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
        code: EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({ positionOptions: { isFirst: true, isLast: true } })
      }];
      dispatch(getBody(newBody));
      localStorage.setItem("body", JSON.stringify(newBody));
      setTimeout(() => {
        saveProductionHtmlToDisk(newBody);
      }, 100);

      // Dismiss dialog
      setShowCreateDialog(false);
      setHasUnsavedChanges(false);
    };
    return () => { delete (window as any).__onProjectFolderCreated; };
  }, [dispatch]);

  // Theme State (Dark / Light Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("theme_mode") === "dark";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme_mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme_mode", "light");
    }
  }, [isDarkMode]);



  // Handle Code Change in Bottom Inspector Editor Dock (Without instant reload/re-render)
  const handleCodeChange = (newCode: string | undefined) => {
    const code = newCode || "";
    setEditedCode(code);
    setHasUnsavedChanges(true);
  };

  // Option A: Live DOM Serializer Helper (with complete production HTML sanitization)
  const getLiveCanvasHtml = (): string => {
    const shadowRoot = shadowRootRef.current;
    if (!shadowRoot) return "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = shadowRoot.innerHTML;

    // 1. Remove editor overlays & placeholder rows
    const overlays = tempDiv.querySelectorAll("#nx-hover-overlay, #nx-select-overlay, #live-drop-indicator, #empty-canvas-welcome-row, script, style[data-editor-style], .bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box");
    overlays.forEach(el => el.remove());

    // 2. Clean interactive editor attributes & classes from all nodes
    tempDiv.querySelectorAll("*").forEach(el => {
      // Strip editor IDs
      const elId = el.getAttribute("id");
      if (elId && (elId === "sortable-root" || elId === "sortable-body" || elId.startsWith("row"))) {
        el.removeAttribute("id");
      }

      el.removeAttribute("contenteditable");
      el.removeAttribute("data-interaction-mode");
      el.removeAttribute("data-selected");
      el.removeAttribute("data-editing-active");
      el.removeAttribute("data-el-id");
      el.removeAttribute("data-id");
      el.removeAttribute("data-block-id");
      el.removeAttribute("data-col-index");
      el.removeAttribute("data-is-responsive");
      el.removeAttribute("data-editor-padding");
      el.removeAttribute("onclick");

      // Clean inline editor styles (e.g. outline, box-shadow, dot grid background, editor height/radius, editor borders)
      const style = el.getAttribute("style");
      if (style) {
        const cleanStyle = style
          .replace(/outline-offset:\s*[^;]+;?/gi, "")
          .replace(/outline:\s*[^;]+;?/gi, "")
          .replace(/box-shadow:\s*[^;]+;?/gi, "")
          .replace(/background-image:\s*radial-gradient\([^)]+\);?/gi, "")
          .replace(/background-size:\s*16px\s+16px;?/gi, "")
          .replace(/border-radius:\s*19px;?/gi, "")
          .replace(/overflow:\s*hidden;?/gi, "")
          .replace(/border:\s*1px\s+dashed\s+blue;?/gi, "")
          .replace(/border:\s*[^;]*dashed[^;]*;?/gi, "")
          .replace(/animation:\s*pulse-border[^;]+;?/gi, "")
          .trim();
        if (cleanStyle) {
          el.setAttribute("style", cleanStyle);
        } else {
          el.removeAttribute("style");
        }
      }

      // Clean editor helper classes
      if (el.className && typeof el.className === "string") {
        const cleaned = el.className
          .replace(/\b(draggable-row|editing-active|hover-active|selected-active|parent-block|fixed-grid-row|child-row|grid-cell|element-row)\b/g, "")
          .trim()
          .replace(/\s+/g, " ");
        if (cleaned) {
          el.setAttribute("class", cleaned);
        } else {
          el.removeAttribute("class");
        }
      }
    });

    // 3. Unwrap inner editor container table so rows sit directly in main 700px container tbody
    const sortableBody = tempDiv.querySelector("#sortable-body") || tempDiv.querySelector("#start");
    if (sortableBody) {
      // Remove any leftover outer email wrapper tables if present inside sortable-body
      sortableBody.querySelectorAll("#sortable-root, table.Container").forEach(tbl => {
        const parent = tbl.parentElement;
        if (parent) {
          while (tbl.firstChild) {
            parent.insertBefore(tbl.firstChild, tbl);
          }
          tbl.remove();
        }
      });

      const rows = Array.from(sortableBody.children)
        .map(child => child.outerHTML)
        .join("\n");
      if (rows.trim()) return rows;
    }

    const sortableRoot = tempDiv.querySelector("table") || tempDiv;
    return sortableRoot ? sortableRoot.outerHTML : tempDiv.innerHTML;
  };

  // Direct Production HTML Saver (Option A: Serializes live canvas DOM)
  const saveProductionHtmlToDisk = useCallback(() => {
    const targetFilePath = openedFilePath || localStorage.getItem("opened_file_path") || "";
    console.log("[saveProductionHtmlToDisk] Option A Live DOM Serializer invoked. targetFilePath:", targetFilePath);
    if (!targetFilePath) {
      console.warn("[saveProductionHtmlToDisk] ABORTED: targetFilePath is empty!");
      return;
    }
    if (typeof (window as any).save_file_to_disk !== "function") {
      console.warn("[saveProductionHtmlToDisk] ABORTED: window.save_file_to_disk function missing!");
      return;
    }

    try {
      const liveBodyHtml = getLiveCanvasHtml();
      console.log("[saveProductionHtmlToDisk] Live canvas DOM HTML length:", liveBodyHtml.length);
      if (!liveBodyHtml) return;

      const subjectLine = localStorage.getItem("subjectline") || "";
      const preHeader = localStorage.getItem("preheader") || "";
      const customCss = localStorage.getItem("CustomCss") || "";

      // Determine active company from project metadata or localStorage (defaults to GSK)
      const activeCompany = (localStorage.getItem("active_company") || "GSK").toUpperCase();
      const activeSanitizer = activeCompany.includes("JNJ") || activeCompany.includes("J&J") || activeCompany.includes("JOHNSON") 
        ? jnjSanitizer 
        : gskSanitizer;

      console.log("[saveProductionHtmlToDisk] Active company sanitizer selected:", activeCompany);

      const htmlAttrsStr = Object.entries(activeSanitizer.htmlAttributes)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");

      const bodyAttrsStr = Object.entries(activeSanitizer.bodyAttributes)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");

      const outerBg = activeSanitizer.wrapperTable.outerBgcolor 
        ? `bgcolor="${activeSanitizer.wrapperTable.outerBgcolor}"` 
        : "";

      const rawSaveHtml = `${activeSanitizer.doctype}
<html ${htmlAttrsStr}>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <title>${subjectLine}</title>
  <style type="text/css">
${activeSanitizer.cssReset}
  </style>
  ${customCss}
</head>
<body ${bodyAttrsStr}>
  <!--[if !mso 9]><!-->
  <div data-test="pre-header" style="display: none; font-size: 1px; color: #151515; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preHeader}
  </div>
  <!--<![endif]-->
  <table width="100%" ${outerBg} border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody>
      <tr>
        <td class="Wrapper" align="center" valign="top">
          <table bgcolor="${activeSanitizer.wrapperTable.containerBgcolor}" class="${activeSanitizer.wrapperTable.containerClass}" width="${activeSanitizer.wrapperTable.containerWidth}" border="0" cellspacing="0" cellpadding="0" align="center" role="presentation">
            <tbody id="start">
              ${liveBodyHtml}
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

      let cleanHtml = rawSaveHtml
        .replace(/(<img[^>]+src=["'])http:\/\/127\.0\.0\.1:9732\/[^\n"']*(assets\/[^"']*)(["'])/gi, "$1$2$3")
        .replace(/(<img[^>]+src=["'])file:\/\/\/[^\n"']*(assets\/[^"']*)(["'])/gi, "$1$2$3")
        .replace(/http:\/\/127\.0\.0\.1:9732\//gi, "");

      const base64Html = btoa(unescape(encodeURIComponent(cleanHtml)));
      console.log("[saveProductionHtmlToDisk] Writing live DOM payload to disk. base64 len:", base64Html.length);
      (window as any).save_file_to_disk(targetFilePath, base64Html);
      console.log("[saveProductionHtmlToDisk] SUCCESS: Live DOM written to file on disk:", targetFilePath);
    } catch (e) {
      console.error("[saveProductionHtmlToDisk] ERROR:", e);
    }
  }, [openedFilePath]);

  const handleSaveCode = useCallback(() => {
    savedHistoryIndexRef.current = historyIndexRef.current;
    setHasUnsavedChanges(false);
    saveProductionHtmlToDisk();
  }, [saveProductionHtmlToDisk]);

  const handleUndo = useCallback(() => {
    const curIdx = historyIndexRef.current;
    const historyList = historyRef.current;
    if (curIdx > 0 && historyList.length > 0) {
      const targetIdx = curIdx - 1;
      const targetState = historyList[targetIdx];
      if (targetState && targetState.items) {
        isUndoRedoActionRef.current = true;
        historyIndexRef.current = targetIdx;
        setHistoryIndex(targetIdx);
        setEditedCode(targetState.editedCode || "");
        lastRecordedBodyJsonRef.current = JSON.stringify(targetState.items);
        localStorage.setItem("body", JSON.stringify(targetState.items));
        dispatch(getBody(targetState.items));
        setHasUnsavedChanges(targetIdx !== savedHistoryIndexRef.current);
      }
    }
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    const curIdx = historyIndexRef.current;
    const historyList = historyRef.current;
    if (curIdx < historyList.length - 1 && historyList.length > 0) {
      const targetIdx = curIdx + 1;
      const targetState = historyList[targetIdx];
      if (targetState && targetState.items) {
        isUndoRedoActionRef.current = true;
        historyIndexRef.current = targetIdx;
        setHistoryIndex(targetIdx);
        setEditedCode(targetState.editedCode || "");
        lastRecordedBodyJsonRef.current = JSON.stringify(targetState.items);
        localStorage.setItem("body", JSON.stringify(targetState.items));
        dispatch(getBody(targetState.items));
        setHasUnsavedChanges(targetIdx !== savedHistoryIndexRef.current);
      }
    }
  }, [dispatch]);

  // Keyboard shortcut listener for Ctrl+S (Save), Ctrl+Z (Undo), Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in code editor textarea/inputs
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.getAttribute("contenteditable") === "true");

      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (!isCmdOrCtrl) return;

      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveCode();
      } else if (e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          // Redo: Ctrl+Shift+Z
          if (!isInput) {
            e.preventDefault();
            handleRedo();
          }
        } else {
          // Undo: Ctrl+Z
          if (!isInput) {
            e.preventDefault();
            handleUndo();
          }
        }
      } else if (e.key.toLowerCase() === "y") {
        // Redo: Ctrl+Y
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveCode, handleUndo, handleRedo]);

  // Initialize native child WebView2 canvas container
  useEffect(() => {
    if (typeof (window as any).init_child_canvas === "function") {
      (window as any).init_child_canvas();
    }
  }, []);

  // Track current device state in refs to prevent closure stale state bugs during modal open/close
  const currentDeviceModeRef = useRef(deviceMode);
  const currentDesktopWidthRef = useRef(desktopWidth);
  const currentMobileWidthRef = useRef(mobileWidth);

  useEffect(() => {
    currentDeviceModeRef.current = deviceMode;
    currentDesktopWidthRef.current = desktopWidth;
    currentMobileWidthRef.current = mobileWidth;
  }, [deviceMode, desktopWidth, mobileWidth]);

  // Save user's prior device view state before modal auto-expands to 700px desktop
  const savedViewStateRef = useRef<{ deviceMode: "desktop" | "mobile"; desktopWidth: string; mobileWidth: number } | null>(null);

  // Auto-expand canvas to 700px desktop when child webview modal opens, and restore on close
  useEffect(() => {
    const handleModalOpen = () => {
      if (!savedViewStateRef.current) {
        savedViewStateRef.current = {
          deviceMode: currentDeviceModeRef.current,
          desktopWidth: currentDesktopWidthRef.current,
          mobileWidth: currentMobileWidthRef.current
        };
        setDeviceMode("desktop");
        setDesktopWidth("700");
      }
    };

    const handleModalClose = () => {
      if (savedViewStateRef.current) {
        const prior = savedViewStateRef.current;
        savedViewStateRef.current = null;
        setDeviceMode(prior.deviceMode);
        setDesktopWidth(prior.desktopWidth);
        setMobileWidth(prior.mobileWidth);
      }
    };

    const handleModalStateCheck = () => {
      const isModalActive = document.body.classList.contains("footer-modal-open") || document.body.classList.contains("modal-blur-active");
      if (isModalActive) {
        handleModalOpen();
      } else {
        handleModalClose();
      }
    };

    const observer = new MutationObserver(handleModalStateCheck);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    const editorChannel = new BroadcastChannel("editor_channel");
    editorChannel.onmessage = (e) => {
      if (!e.data) return;
      const t = e.data.type;
      if (t === "open-footer-modal" || t === "open-saved-template-modal" || t === "open-confirm-modal" || t === "open-canvas-modal") {
        handleModalOpen();
      } else if (t === "close-footer-modal" || t === "close-saved-template-modal" || t === "close-confirm-modal" || t === "close-canvas-modal") {
        setTimeout(handleModalClose, 150);
      }
    };

    return () => {
      observer.disconnect();
      editorChannel.close();
    };
  }, []);

  // Update HTML content in the native child webview ONLY when templateModified changes
  useEffect(() => {
    const hasBinding = typeof (window as any).update_child_html === "function";
    if (hasBinding) {
      (window as any).update_child_html(templateModified || "");
    }
  }, [templateModified]);

  const hasNativeBinding = typeof (window as any).update_child_html === "function";

  const bodyItems = useSelector((selector: any) => selector.ProductReducer.Body);
  const hasCanvasContent = Array.isArray(bodyItems) && bodyItems.length > 0;

  // Compute dynamic top toolbar width: matches selected desktop width in Desktop mode, locks to 700px in Mobile mode to prevent collisions
  const topBarWidth = deviceMode === "desktop" ? `${desktopWidth}px` : "700px";

  // Handler for CreateEmailDialog → calls native IPC and initializes initial default Block section
  const handleProjectCreate = useCallback((pmId: string) => {
    const initialItems = [{
      type: "BLOCK",
      code: EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({ positionOptions: { isFirst: true, isLast: true } })
    }];
    localStorage.setItem("body", JSON.stringify(initialItems));
    dispatch(getBody(initialItems));

    if (typeof (window as any).create_email_project === "function") {
      (window as any).create_email_project(pmId);
    } else {
      console.error("[ProjectCreate] create_email_project IPC not available — rebuild native host.");
    }

    setTimeout(() => {
      saveProductionHtmlToDisk(initialItems);
      setShowCreateDialog(false);
    }, 150);
  }, [dispatch, saveProductionHtmlToDisk]);

  return (
    <div className="frameContainer">
      {/* PM ID Creation Dialog — rendered as a portal over the entire canvas */}
      {showCreateDialog && (
        <CreateEmailDialog
          onCancel={() => setShowCreateDialog(false)}
          onCreate={handleProjectCreate}
        />
      )}
      {/* Top Action Bar (Dynamically matches webview width in Desktop mode; 600px in Mobile mode to prevent collision) */}
      {hasCanvasContent && (
        <div style={{
          width: topBarWidth,
          maxWidth: "100%",
          margin: "0 auto 10px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 50,
          position: "relative",
          transition: "width 0.35s ease-in-out"
        }}>
            {/* Left Controls Group: Device Toggle Icon, Preset/Slider Controls, Status Dot, Undo/Redo, Save */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              {/* Left Capsule: Device Icon, Preset Selector/Slider, Status Dot, Undo, Redo, Save */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--bg-card)",
                border: "1.5px solid var(--border-color)",
                borderRadius: "999px",
                padding: "3px 8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
              }}>
                {/* Device Icon Toggle Button */}
                <button
                  type="button"
                  onClick={() => setDeviceMode(prev => prev === "desktop" ? "mobile" : "desktop")}
                  title={`Current: ${deviceMode.toUpperCase()} mode (Click to switch to ${deviceMode === "desktop" ? "Mobile" : "Desktop"})`}
                  style={{
                    background: "transparent",
                    color: "var(--text-main)",
                    border: "none",
                    padding: "4px 6px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s ease"
                  }}
                >
                  <Tablet size={15} style={{ transform: deviceMode === "mobile" ? "rotate(0deg)" : "rotate(90deg)", transition: "transform 0.25s ease-in-out" }} />
                </button>

                <div style={{ width: "1px", height: "14px", background: "var(--border-color)", margin: "0 1px" }} />

                {/* Width Controls: 700px fixed for Desktop; Stepped Gear Range Slider (320 to 480 step=10) for Mobile */}
                {deviceMode === "desktop" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, color: "var(--brand-primary, #0284c7)", padding: "2px 8px" }}>
                    <span>700px</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>
                    <input
                      type="range"
                      min="320"
                      max="480"
                      step="10"
                      value={mobileWidth}
                      onChange={(e) => setMobileWidth(Number(e.target.value))}
                      style={{
                        width: "70px",
                        accentColor: "var(--brand-primary, #0284c7)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      title={`Mobile Width: ${mobileWidth}px (Stepped Gear)`}
                    />
                    <span style={{ fontSize: "10px", minWidth: "28px", transition: "all 0.2s ease" }}>{mobileWidth}px</span>
                  </div>
                )}

                <div style={{ width: "1px", height: "14px", background: "var(--border-color)", margin: "0 1px" }} />

                {/* Green/Red Unsaved Changes Status Dot */}
                <div 
                  title={hasUnsavedChanges ? "Unsaved changes pending (Press Ctrl+S to Save)" : "All changes saved"}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: hasUnsavedChanges ? "#ef4444" : "#22c55e",
                    boxShadow: hasUnsavedChanges ? "0 0 6px #ef4444" : "0 0 6px #22c55e",
                    transition: "all 0.3s ease",
                    marginLeft: "2px",
                    marginRight: "2px"
                  }} 
                />

                <div style={{ width: "1px", height: "14px", background: "var(--border-color)", margin: "0 1px" }} />

                {/* Undo Button */}
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Undo (Ctrl+Z)"
                  style={{
                    background: "transparent",
                    color: "var(--text-main)",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: historyIndex <= 0 ? "not-allowed" : "pointer",
                    opacity: historyIndex <= 0 ? 0.35 : 1,
                    padding: "3px 4px",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <RotateCcw size={13} />
                </button>

                {/* Redo Button */}
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo (Ctrl+Y)"
                  style={{
                    background: "transparent",
                    color: "var(--text-main)",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: historyIndex >= history.length - 1 ? "not-allowed" : "pointer",
                    opacity: historyIndex >= history.length - 1 ? 0.35 : 1,
                    padding: "3px 4px",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <RotateCw size={13} />
                </button>

                {/* Simple Monochrome Save Button */}
                <button
                  type="button"
                  onClick={handleSaveCode}
                  disabled={!hasUnsavedChanges}
                  title="Save Changes (Ctrl+S)"
                  style={{
                    background: "transparent",
                    color: "var(--text-main)",
                    border: "none",
                    padding: "3px 4px",
                    borderRadius: "6px",
                    cursor: hasUnsavedChanges ? "pointer" : "default",
                    opacity: hasUnsavedChanges ? 1 : 0.4,
                    display: "flex",
                    alignItems: "center",
                    transition: "opacity 0.2s ease"
                  }}
                >
                  <Save size={13} />
                </button>
              </div>
            </div>

            {/* Right Controls Group: Edit Submodes (DEFAULT | TEXT | ASSETS) & Move/Edit Toggle Bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              {/* Submode pill selector: active when CREATE mode is selected */}
              {interactionMode === "create" && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "var(--bg-card)",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "999px",
                  padding: "2px 4px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                }}>
                  {(["add", "move"] as const).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleCreateSubmodeChange(sub)}
                      style={{
                        background: createSubmode === sub ? "var(--brand-primary, #0284c7)" : "transparent",
                        color: createSubmode === sub ? "#ffffff" : "var(--text-muted)",
                        border: "none",
                        borderRadius: "999px",
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      title={sub === "add" ? "ADD Mode: Default arrow cursor for drag-and-drop" : "MOVE Mode: Move pointer cursor"}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}

              {/* Submode pill selector: active when SELECT (EDIT) mode is selected */}
              {interactionMode === "edit" && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "var(--bg-card)",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "999px",
                  padding: "2px 4px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                }}>
                  {(["default", "text", "assets"] as const).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubmodeChange(sub)}
                      style={{
                        background: editSubmode === sub ? "var(--brand-primary, #0284c7)" : "transparent",
                        color: editSubmode === sub ? "#ffffff" : "var(--text-muted)",
                        border: "none",
                        borderRadius: "999px",
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}

              {/* Mode Toggle Bar (BUILD / CODE) */}
              <div 
                className="light-3d-toggle-bar"
                style={{ position: "relative" }}
              >
                <div className={`sliding-pill-indicator ${interactionMode}`} />
                <button
                  type="button"
                  className={`light-3d-btn move-btn ${interactionMode === "create" ? "active" : ""}`}
                  onClick={() => handleModeChange("create")}
                  title="BUILD Mode: Drag-and-drop layout blocks, hover highlight any element, configure via right property panel"
                  style={{ padding: "5px 16px" }}
                >
                  BUILD
                </button>

                <button
                  type="button"
                  className={`light-3d-btn edit-btn ${interactionMode === "edit" ? "active" : ""}`}
                  onClick={() => {
                    handleModeChange("edit");
                    setIsDockOpen(true);
                  }}
                  title="CODE Mode: Inspect elements and edit full HTML source code in bottom editor"
                  style={{ padding: "5px 16px" }}
                >
                  CODE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Centered Canvas Column matching Active View Width (Clean Smooth Width Animation) */}
        <div style={{
          width: `${activeViewWidth}px`,
          maxWidth: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          position: "relative",
          boxSizing: "border-box",
          transition: "width 0.35s ease-in-out"
        }}>
          {/* Shadow DOM Direct React Canvas Container (Zero iframe) */}
          <div
            className="shadow-dom-canvas-container"
            ref={containerRef}
            style={{
              flex: 1,
              minHeight: 0,
              position: "relative",
              overflow: "visible",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              borderRadius: "16px",
              border: "2px solid #cbd5e1",
              background: "#ffffff",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.08)",
              boxSizing: "border-box"
            }}
            onDragEnter={(e) => {
              if (interactionMode !== "create" || createSubmode !== "add") return;
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDragOver={(e) => {
              if (interactionMode !== "create" || createSubmode !== "add") return;
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "copy";

              const shadowRoot = shadowRootRef.current;
              if (!shadowRoot) return;

              // Clear previous drag target highlights & insertion lines
              const oldTargets = shadowRoot.querySelectorAll(".drag-target-active, #drop-indicator-line");
              oldTargets.forEach((el) => {
                el.classList.remove("drag-target-active");
                if (el.id === "drop-indicator-line") el.remove();
              });

              const payload = (window as any).__activeDragPayload;
              const isAtomic = payload && EMAIL_COMPONENTS_CONFIG[payload.blockType]?.category === "component";

              const target = shadowRoot.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
              if (target) {
                if (isAtomic) {
                  const cell = target.closest(".grid-cell, td, th") as HTMLElement | null;
                  if (cell) cell.classList.add("drag-target-active");
                } else {
                  const row = target.closest("tr.draggable-row, tr[id^='row'], tr.parent-block, tr.grid-fixed-row") as HTMLElement | null;
                  if (row) {
                    const rect = row.getBoundingClientRect();
                    const isTopHalf = e.clientY < rect.top + rect.height / 2;

                    let indicator = shadowRoot.querySelector("#drop-indicator-line") as HTMLElement | null;
                    if (!indicator) {
                      indicator = document.createElement("div");
                      indicator.id = "drop-indicator-line";
                      indicator.style.cssText = `
                        height: 4px;
                        background: linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #0284c7 100%);
                        border-radius: 4px;
                        box-shadow: 0 0 12px rgba(2, 132, 199, 0.9);
                        margin: 6px 0;
                        transition: all 0.15s ease;
                        pointer-events: none;
                      `;
                    }

                    if (isTopHalf) {
                      row.parentNode?.insertBefore(indicator, row);
                    } else {
                      row.parentNode?.insertBefore(indicator, row.nextSibling);
                    }
                  }
                }
              }
            }}
            onDragLeave={() => {
              const shadowRoot = shadowRootRef.current;
              if (shadowRoot) {
                const oldTargets = shadowRoot.querySelectorAll(".drag-target-active, #drop-indicator-line");
                oldTargets.forEach((el) => {
                  el.classList.remove("drag-target-active");
                  if (el.id === "drop-indicator-line") el.remove();
                });
              }
            }}
            onDrop={(e) => {
              if (interactionMode !== "create" || createSubmode !== "add") {
                e.preventDefault();
                e.stopPropagation();
                setIsGlobalDragging(false);
                return;
              }
              e.preventDefault();
              e.stopPropagation();
              setIsGlobalDragging(false);

              const shadowRoot = shadowRootRef.current;
              if (shadowRoot) {
                const oldTargets = shadowRoot.querySelectorAll(".drag-target-active, #drop-indicator-line");
                oldTargets.forEach((el) => {
                  el.classList.remove("drag-target-active");
                  if (el.id === "drop-indicator-line") el.remove();
                });
              }

              try {
                const rawData = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("Text");
                let parsed: any = null;
                if (rawData) {
                  try { parsed = JSON.parse(rawData); } catch (err) {}
                }
                if (!parsed || !parsed.blockType) {
                  parsed = (window as any).__activeDragPayload;
                }
                if (parsed && (parsed.type === "ADD_BLOCK" || parsed.blockType)) {
                  const blockType = parsed.blockType || "BLOCK";
                  const config = EMAIL_COMPONENTS_CONFIG[blockType];
                  const isAtomicComponent = config && config.category === "component";

                  let currentBody: any[] = [];
                  try {
                    currentBody = JSON.parse(localStorage.getItem("body") || "[]") || [];
                  } catch (err) {}

                  if (currentBody.length === 0) {
                    const initialParent = {
                      type: "BLOCK",
                      code: EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml()
                    };
                    currentBody = [initialParent];
                  }

                  let targetIndex = -1;
                  let targetColIndex = 0;
                  let parentColIndex = -1;
                  let isChildDrop = false;
                  let isTopHalfRow = false;

                  if (shadowRoot && typeof e.clientX === "number" && typeof e.clientY === "number") {
                    const targetEl = shadowRoot.elementFromPoint(e.clientX, e.clientY);
                    if (targetEl) {
                      // 1. Resolve target section row index
                      const rowEl = targetEl.closest(".draggable-row, tr[data-id], tr.parent-block, tr.grid-fixed-row, tr.fixed-grid-row, .parent-block");
                      if (rowEl) {
                        const dataId = rowEl.getAttribute("data-id");
                        const idAttr = rowEl.getAttribute("id");
                        if (dataId) {
                          targetIndex = parseInt(dataId, 10) - 1;
                        } else if (idAttr && idAttr.startsWith("row")) {
                          targetIndex = parseInt(idAttr.replace("row", ""), 10);
                        } else {
                          const allRows = Array.from(shadowRoot.querySelectorAll(".draggable-row, tr[data-id]"));
                          const foundIdx = allRows.indexOf(rowEl);
                          if (foundIdx !== -1) targetIndex = foundIdx;
                        }

                        const rect = rowEl.getBoundingClientRect();
                        isTopHalfRow = (e.clientY - rect.top) < (rect.height / 2);
                      }

                      // 2. Resolve target child column and nested child index
                      const dropBoxEl = targetEl.closest(".bento-child-drop-box");

                      if (dropBoxEl) {
                        const colAttr = dropBoxEl.getAttribute("data-col-idx");
                        const parentAttr = dropBoxEl.getAttribute("data-parent-col-idx");
                        if (parentAttr !== null) {
                          parentColIndex = parseInt(parentAttr, 10);
                          isChildDrop = true;
                          targetColIndex = colAttr !== null ? parseInt(colAttr, 10) : 0;
                        } else if (colAttr !== null) {
                          targetColIndex = parseInt(colAttr, 10);
                        }
                      } else {
                        const nestedCellEl = targetEl.closest("td.nested-cell, [data-nested-col-index]");
                        if (nestedCellEl) {
                          isChildDrop = true;
                          const nestedAttr = nestedCellEl.getAttribute("data-nested-col-index");
                          targetColIndex = nestedAttr !== null ? parseInt(nestedAttr, 10) : 0;

                          const parentColEl = nestedCellEl.closest("tr.child-row > td.grid-cell, td[data-col-index]");
                          if (parentColEl) {
                            const pColAttr = parentColEl.getAttribute("data-col-index");
                            parentColIndex = pColAttr !== null ? parseInt(pColAttr, 10) : 0;
                          }
                        } else {
                          const cellEl = targetEl.closest(".grid-cell, td[data-col-index]");
                          if (cellEl) {
                            const colAttr = cellEl.getAttribute("data-col-index");
                            if (colAttr !== null) {
                              targetColIndex = parseInt(colAttr, 10);
                            } else {
                              const parentTr = cellEl.closest("tr");
                              if (parentTr) {
                                const cellsInRow = Array.from(parentTr.querySelectorAll("td"));
                                const foundCellIdx = cellsInRow.indexOf(cellEl as HTMLTableCellElement);
                                if (foundCellIdx !== -1) targetColIndex = foundCellIdx;
                              }
                            }
                          }
                        }
                      }
                    }
                  }

                  if (targetIndex < 0 || targetIndex >= currentBody.length) {
                    targetIndex = Math.max(0, currentBody.length - 1);
                  }

                  let updatedBody = [...currentBody];

                  if (isAtomicComponent) {
                    const targetBlock = { ...updatedBody[targetIndex] };
                    if (targetBlock && targetBlock.code) {
                      const componentHtml = parsed.code || (config ? config.generateHtml() : "");
                      
                      // Use clean DOMParser to target the exact child cell without breaking nested table structures
                      const parser = new DOMParser();
                      const doc = parser.parseFromString(`<table><tbody>${targetBlock.code}</tbody></table>`, "text/html");
                      
                      let targetCell: HTMLTableCellElement | null = null;

                      // 1. Strict hierarchy resolution
                      const mainRow = doc.querySelector("tr.child-row") || doc.querySelector("tr");
                      const topCols = mainRow
                        ? (Array.from(mainRow.children).filter((el) => el.tagName.toLowerCase() === "td") as HTMLTableCellElement[])
                        : [];

                      if (isChildDrop && parentColIndex >= 0) {
                        const parentCol = topCols[parentColIndex];
                        if (parentCol) {
                          const nestedTable = parentCol.querySelector("table");
                          if (nestedTable) {
                            const nestedRow = nestedTable.querySelector("tr");
                            const nestedCells = nestedRow
                              ? (Array.from(nestedRow.children).filter((el) => el.tagName.toLowerCase() === "td") as HTMLTableCellElement[])
                              : Array.from(nestedTable.querySelectorAll<HTMLTableCellElement>("td"));
                            targetCell = nestedCells[targetColIndex] || null;
                          }
                        }
                      } else {
                        targetCell = topCols[targetColIndex] || null;
                      }

                      if (targetCell) {
                        const existingInner = targetCell.innerHTML.trim();
                        if (existingInner === "" || existingInner === "&nbsp;") {
                          targetCell.innerHTML = componentHtml;
                        } else {
                          targetCell.innerHTML = `${existingInner}\n${componentHtml}`;
                        }
                        const tbody = doc.querySelector("tbody");
                        targetBlock.code = tbody ? tbody.innerHTML : doc.body.innerHTML;
                      } else {
                        targetBlock.code += `\n${componentHtml}`;
                      }

                      updatedBody[targetIndex] = targetBlock;
                    }
                  } else {
                    const newBlock = {
                      type: blockType,
                      code: parsed.code || (config ? config.generateHtml() : "")
                    };
                    const insertAt = isTopHalfRow ? targetIndex : targetIndex + 1;
                    updatedBody.splice(insertAt, 0, newBlock);
                  }

                  localStorage.setItem("body", JSON.stringify(updatedBody));
                  dispatch(getBody(updatedBody));
                  dispatch(getCursorPointer(targetIndex));
                  (window as any).__activeDragPayload = null;
                }
              } catch (err) {
                console.warn("Parent drop error:", err);
              }
            }}
          />

          {/* Inspector Code Dock */}
          <div className={`bottom-inspector-dock ${isDockOpen ? "open" : "closed"}`}>
            <button
              type="button"
              className="dock-close-btn"
              onClick={() => setIsDockOpen(false)}
              title="Close inspector dock"
            >
              <X size={13} />
            </button>

            {/* Code Editor Body */}
            <div className="dock-editor-body">
              {selectedElement ? (
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  language="html"
                  theme="vs-dark"
                  value={editedCode}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: "on",
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    padding: { top: 8, bottom: 8 },
                    automaticLayout: true
                  }}
                />
              ) : (
                <textarea
                  className="dock-textarea-fallback"
                  placeholder="Click any element in Edit mode to view and edit code..."
                  value={editedCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

export default Preview;