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
import { getBody, getHeader, getFooter, getPreHeader, getPM } from "../../Redux/ProductReducer/action";
import "./preview.css";

interface PreviewProps {
  data?: {
    finalCode?: string;
    handleContentEditable?: () => void;
  };
}

declare global {
  interface Window {
    init_child_canvas?: () => void;
    sync_child_bounds?: (x: number, y: number, w: number, h: number, visible: boolean) => void;
    update_child_html?: (html: string) => void;
  }
}

interface SelectedElementData {
  tagName: string;
  id: string;
  className: string;
  outerHTML: string;
  innerHTML: string;
  blockIndex: number;
  blockCode?: string;
}

const Preview: React.FC<PreviewProps> = () => {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dispatch = useDispatch();

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

  const modeRef = useRef(interactionMode);
  useEffect(() => {
    modeRef.current = interactionMode;
  }, [interactionMode]);

  const Template = useSelector((selector: any) => selector.ProductReducer.DummeyTemplate);
  const CleanTemplate = useSelector((selector: any) => selector.ProductReducer.Template);
  const BrandThemeColor = useSelector((selector: any) => selector.ProductReducer.BrandThemeColor);

  let templateModified = Template ? Template.replace(/\${BrandThemeColor}/g, BrandThemeColor) : "";

  // Broadcast interaction mode & submode changes
  const broadcastInteractionMode = useCallback((mode: string, submode: string = "default") => {
    try {
      const payload = { type: "set-interaction-mode", mode, editSubmode: submode };
      const channel = new BroadcastChannel("webview_ipc");
      channel.postMessage(payload);
      channel.close();

      if (typeof (window as any).set_interaction_mode === "function") {
        (window as any).set_interaction_mode(mode, submode);
      }

      if (typeof (window as any).eval_child_js === "function") {
        (window as any).eval_child_js(`if(window.setInteractionMode) window.setInteractionMode('${mode}', '${submode}');`);
      }
    } catch (e) {}
  }, []);

  const handleModeChange = (newMode: "create" | "edit") => {
    setInteractionMode(newMode);
    const activeSub = newMode === "create" ? createSubmode : editSubmode;
    broadcastInteractionMode(newMode, activeSub);
    if (newMode === "create") {
      setSelectedElement(null);
      setIsDockOpen(false);
    }
  };

  const handleCreateSubmodeChange = (sub: "add" | "move") => {
    setCreateSubmode(sub);
    broadcastInteractionMode("create", sub);
  };

  const handleSubmodeChange = (sub: "default" | "text" | "assets") => {
    setEditSubmode(sub);
    broadcastInteractionMode("edit", sub);
  };

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
        setIsDockOpen(true); // Open bottom inspector code dock automatically!
      } else if (data.type === "create-new-email") {
        console.log("[CreateEmail] Initializing new Grid email...");
        const keysToDelete = [
          "footer", "mailImages", "header", "preheader", "pmdate",
          "subjectline", "body", "mailHeaderImages", "mailFooterImages",
          "TrackerId", "CustomCss"
        ];
        for (let i = 0; i < keysToDelete.length; i++) {
          localStorage.removeItem(keysToDelete[i]);
        }
        dispatch(getHeader(""));
        dispatch(getFooter(""));
        dispatch(getPreHeader(""));
        dispatch(getPM(""));

        const initialGridRow = `<tr class="grid-fixed-row">
  <td align="center" valign="top" style="padding: 10px 0; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff;">
      <tbody>
        <tr>
          <td class="grid-cell" style="width: 100%; vertical-align: top; padding: 10px;" valign="top">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; border-collapse: collapse; border: 1px dashed #cbd5e1; border-radius: 6px; background-color: #f8fafc;">
              <tbody>
                <tr>
                  <td align="center" valign="middle" style="padding: 24px 12px; text-align: center;">
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 13px; color: #64748b; font-weight: 600;">
                      Grid Cell 1
                    </p>
                    <span style="font-family: Arial, sans-serif; font-size: 11px; color: #94a3b8;">Drag or add element here</span>
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

        dispatch(getBody([{ type: "GRID", code: initialGridRow }]));
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

          let updatedBody = [...currentBody];

          if (isAtomicComponent) {
            const targetBlock = { ...updatedBody[targetIndex] };
            if (targetBlock && targetBlock.code) {
              const componentHtml = payload.code || (config ? config.generateHtml() : "");
              if (targetBlock.code.includes('class="grid-cell"') || targetBlock.code.includes("grid-cell")) {
                targetBlock.code = targetBlock.code.replace(/(<td[^>]*class="[^"]*grid-cell[^"]*"[^>]*>)([\s\S]*?)(<\/td>)/i, `$1\n${componentHtml}\n$3`);
              } else {
                targetBlock.code += `\n${componentHtml}`;
              }
              updatedBody[targetIndex] = targetBlock;
            }
          } else {
            const newBlock = {
              type: blockType,
              code: payload.code || (config ? config.generateHtml() : "")
            };
            updatedBody.splice(targetIndex + 1, 0, newBlock);
          }

          localStorage.setItem("body", JSON.stringify(updatedBody));
          dispatch(getBody(updatedBody));
          dispatch(getCursorPointer(targetIndex));
          (window as any).__activeDragPayload = null;
        }
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
              const rows = Array.from(sortableBody.children);
              rows.forEach((rowEl) => {
                const rowTd = rowEl.querySelector("td[id^='row']");
                let code = "";
                if (rowTd) {
                  const innerTable = rowTd.querySelector("table");
                  code = innerTable ? innerTable.outerHTML : rowTd.innerHTML;
                } else {
                  code = rowEl.innerHTML;
                }
                if (code.trim()) {
                  sectionItems.push({ type: "CUSTOM", code });
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

  // Theme State (Dark / Light Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("theme_mode") === "dark";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme_mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme_mode", "light");
    }

    // Broadcast theme change to child webview
    try {
      const channel = new BroadcastChannel("webview_ipc");
      channel.postMessage({ type: "set-theme-mode", theme });
      channel.close();
    } catch (e) {}

    if (typeof (window as any).eval_child_js === "function") {
      (window as any).eval_child_js(
        `if (document.documentElement) {
          if ('${theme}' === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }`
      );
    }
  }, [isDarkMode]);

  // Sync mode whenever template updates — delay so child webview has time
  // to finish loading HTML and executing canvas-runner.js. Retry at 700ms.
  useEffect(() => {
    const t1 = setTimeout(() => broadcastInteractionMode(modeRef.current, editSubmode), 300);
    const t2 = setTimeout(() => broadcastInteractionMode(modeRef.current, editSubmode), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [templateModified, broadcastInteractionMode, editSubmode]);

  // When user toggles mode button, send immediately (child is already loaded)
  useEffect(() => {
    broadcastInteractionMode(interactionMode, editSubmode);
  }, [interactionMode, editSubmode, broadcastInteractionMode]);

  // Editor Code State & History for Undo/Redo
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [history, setHistory] = useState<{ items: any[]; editedCode: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Handle Code Change in Bottom Inspector Editor Dock (Without instant reload/re-render)
  const handleCodeChange = (newCode: string | undefined) => {
    const code = newCode || "";
    setEditedCode(code);
    setHasUnsavedChanges(true);
  };

  // Save changes to localStorage, Redux, and update child DOM directly in-place without page or webview reload
  const handleSaveCode = useCallback(() => {
    try {
      const items = JSON.parse(localStorage.getItem("body") || "[]");
      if (selectedElement && Array.isArray(items) && items[selectedElement.blockIndex]) {
        const newItems = Array.from(items);
        const originalEl = selectedElement.elementCode || selectedElement.outerHTML || "";
        const fullBlock = selectedElement.blockCode || "";

        let updatedBlock: string;
        if (originalEl && fullBlock && fullBlock.includes(originalEl)) {
          updatedBlock = fullBlock.replace(originalEl, editedCode);
        } else {
          updatedBlock = editedCode;
        }

        newItems[selectedElement.blockIndex].code = updatedBlock;
        localStorage.setItem("body", JSON.stringify(newItems));
        dispatch(getBody(newItems));

        // Push state to Undo/Redo history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ items: newItems, editedCode });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        // Update child webview DOM directly in-place without reloading document or image assets
        if (typeof (window as any).eval_child_js === "function") {
          const escaped = editedCode.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
          
          (window as any).eval_child_js(
            `(function(){
              var rowTd = document.getElementById('row${selectedElement.blockIndex}');
              if (!rowTd) return;
              
              // If we have an active focused element, update its outerHTML directly
              var activeEl = document.querySelector('[data-selected="true"]') || (rowTd.querySelector('.editing-active'));
              if (!activeEl && window.__lastSelectedElementId) {
                activeEl = document.getElementById(window.__lastSelectedElementId);
              }
              
              if (activeEl && activeEl !== rowTd) {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = \`${escaped}\`;
                if (tempDiv.firstElementChild) {
                  activeEl.parentNode.replaceChild(tempDiv.firstElementChild, activeEl);
                } else {
                  activeEl.innerHTML = \`${escaped}\`;
                }
              } else {
                var tb = rowTd.querySelector('table > tbody');
                if (tb) tb.innerHTML = \`${escaped}\`;
                else rowTd.innerHTML = \`${escaped}\`;
              }
            })()`
          );
        }
      }

      setHasUnsavedChanges(false);

      // Save to disk if native function available
      if (openedFilePath && typeof (window as any).save_file_to_disk === "function") {
        let rawSaveHtml = CleanTemplate || templateModified || "";

        const sanitizeHtml = (htmlStr: string): string => {
          let clean = htmlStr
            .replace(/\s*data-interaction-mode=["'][^"']*["']/gi, "")
            .replace(/\s*class=["']([^"']*\b)(?:draggable-row|editing-active)(\b[^"']*)["']/gi, (match, p1, p2) => {
              const cleanedClass = (p1 + " " + p2).trim().replace(/\s+/g, " ");
              return cleanedClass ? ` class="${cleanedClass}"` : "";
            })
            .replace(/\s*contenteditable=["'][^"']*["']/gi, "")
            .replace(/\s*onclick=["']getClassName\(event\)["']/gi, "")
            .replace(/\s*data-id=["'][^"']*["']/gi, "")
            .replace(/outline-offset:\s*[^;]+;?/gi, "")
            .replace(/outline:\s*[^;]+;?/gi, "")
            .replace(/box-shadow:\s*[^;]+;?/gi, "")
            .replace(/<div\s+id=["']nx-(?:hover|select)-overlay["'][\s\S]*?<\/div>/gi, "");

          clean = clean.replace(
            /(<img[^>]+src=["'])http:\/\/127\.0\.0\.1:9732\/[^\n"']*(assets\/[^"']*)(["'])/gi,
            "$1$2$3"
          );
          clean = clean.replace(/http:\/\/127\.0\.0\.1:9732\//gi, "");

          return clean;
        };

        const sanitizedHtml = sanitizeHtml(rawSaveHtml);
        (window as any).save_file_to_disk(openedFilePath, sanitizedHtml);
        console.log("[FileSave] Sanitized production HTML saved to disk:", openedFilePath);
      }
    } catch (e) {
      console.warn("Failed to save code:", e);
    }
  }, [selectedElement, editedCode, history, historyIndex, dispatch, openedFilePath, templateModified, CleanTemplate]);

  // Keyboard shortcut listener for Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveCode]);

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setEditedCode(prev.editedCode);
      localStorage.setItem("body", JSON.stringify(prev.items));
      dispatch(getBody(prev.items));
      setHasUnsavedChanges(historyIndex - 1 > 0);

      if (typeof (window as any).update_child_html === "function") {
        (window as any).update_child_html(Template || "");
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setEditedCode(next.editedCode);
      localStorage.setItem("body", JSON.stringify(next.items));
      dispatch(getBody(next.items));
      setHasUnsavedChanges(true);

      if (typeof (window as any).update_child_html === "function") {
        (window as any).update_child_html(Template || "");
      }
    }
  };

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

  // Synchronize native WebView2 window bounds with the DOM element bounding box via ResizeObserver & RAF
  useEffect(() => {
    if (!containerRef.current) return;

    let animFrameId: number | null = null;

    const syncBounds = () => {
      if (!containerRef.current) return;

      const hasBinding = typeof (window as any).sync_child_bounds === "function";
      const isSavedTemplateModalActive = document.body.classList.contains("modal-blur-active");
      
      if (isSavedTemplateModalActive || isGlobalDragging) {
        if (hasBinding) {
          (window as any).sync_child_bounds("0,0,0,0,false");
        }
        return;
      }

      const isFooterModalActive = document.body.classList.contains("footer-modal-open");
      const rect = containerRef.current.getBoundingClientRect();

      const borderWidth = 2;
      let targetX = Math.round(rect.left + borderWidth);
      let targetY = Math.round(rect.top + borderWidth);
      let w = Math.max(0, Math.round(rect.width - borderWidth * 2));
      let targetH = Math.max(0, Math.round(rect.height - borderWidth * 2));

      if (isFooterModalActive) {
        targetY = Math.max(16, (window.innerHeight - targetH) / 2);
      }

      if (targetY + targetH > window.innerHeight) {
        targetH = Math.max(0, window.innerHeight - targetY - 16);
      }

      const numWidth = parseInt(activeViewWidth, 10) || 700;
      const payload = `${targetX},${targetY},${w},${targetH},true,${numWidth}`;
      if (hasBinding) (window as any).sync_child_bounds(payload);
    };

    // Smoothly poll bounds via requestAnimationFrame during CSS width transition (350ms)
    const startTime = performance.now();
    const smoothTrackTransition = () => {
      syncBounds();
      if (performance.now() - startTime < 400) {
        animFrameId = requestAnimationFrame(smoothTrackTransition);
      }
    };
    animFrameId = requestAnimationFrame(smoothTrackTransition);

    const observer = new ResizeObserver(syncBounds);
    observer.observe(containerRef.current);

    const mutationObserver = new MutationObserver(syncBounds);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", syncBounds);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", syncBounds);
    };
  }, [activeViewWidth]);

  // Update HTML content in the native child webview ONLY when templateModified changes
  useEffect(() => {
    const hasBinding = typeof (window as any).update_child_html === "function";
    if (hasBinding) {
      (window as any).update_child_html(templateModified || "");
      setTimeout(() => {
        broadcastInteractionMode(modeRef.current, editSubmode);
      }, 50);
    }
  }, [templateModified, broadcastInteractionMode, editSubmode]);

  const hasNativeBinding = typeof (window as any).update_child_html === "function";

  const bodyItems = useSelector((selector: any) => selector.ProductReducer.Body);
  const hasCanvasContent = Array.isArray(bodyItems) && bodyItems.length > 0;

  // Compute dynamic top toolbar width: matches selected desktop width in Desktop mode, locks to 700px in Mobile mode to prevent collisions
  const topBarWidth = deviceMode === "desktop" ? `${desktopWidth}px` : "700px";

  return (
    <div className="frameContainer">
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

                {/* Width Controls: 600, 650, 700 for Desktop; Stepped Gear Range Slider (320 to 480 step=10) for Mobile */}
                {deviceMode === "desktop" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    {["600", "650", "700"].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setDesktopWidth(w)}
                        style={{
                          background: desktopWidth === w ? "var(--bg-hover, rgba(0,0,0,0.06))" : "transparent",
                          color: desktopWidth === w ? "var(--brand-primary, #0284c7)" : "var(--text-muted)",
                          border: "none",
                          borderRadius: "12px",
                          padding: "2px 7px",
                          fontSize: "11px",
                          fontWeight: desktopWidth === w ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out"
                        }}
                      >
                        {w}
                      </button>
                    ))}
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

              {/* Mode Toggle Bar (CREATE / EDIT) without icons */}
              <div 
                className="light-3d-toggle-bar"
                style={{ position: "relative" }}
              >
                <div className={`sliding-pill-indicator ${interactionMode}`} />
                <button
                  type="button"
                  className={`light-3d-btn move-btn ${interactionMode === "create" ? "active" : ""}`}
                  onClick={() => handleModeChange("create")}
                  title="Create Mode: Drag-and-drop layout blocks and components"
                  style={{ padding: "5px 16px" }}
                >
                  CREATE
                </button>

                <button
                  type="button"
                  className={`light-3d-btn edit-btn ${interactionMode === "edit" ? "active" : ""}`}
                  onClick={() => handleModeChange("edit")}
                  title="Edit Mode: Inspect and edit elements"
                  style={{ padding: "5px 16px" }}
                >
                  EDIT
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
          transition: "width 0.35s ease-in-out"
        }}>
          {/* Main Webview Canvas Container */}
          <div className="iframeContainer" style={{ flex: 1, minHeight: 0 }}>
            <div 
              ref={containerRef} 
              className="native-webview-placeholder" 
              style={{ width: "100%", height: "100%" }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsGlobalDragging(false);
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

                    let targetIndex = Math.max(0, currentBody.length - 1);
                    if (containerRef.current && typeof e.clientY === "number" && currentBody.length > 0) {
                      const rect = containerRef.current.getBoundingClientRect();
                      const relY = Math.max(0, e.clientY - rect.top);
                      const totalH = rect.height || 1;
                      const slotH = totalH / currentBody.length;
                      targetIndex = Math.min(currentBody.length - 1, Math.max(0, Math.floor(relY / slotH)));
                    }

                    let updatedBody = [...currentBody];

                    if (isAtomicComponent) {
                      const targetBlock = { ...updatedBody[targetIndex] };
                      if (targetBlock && targetBlock.code) {
                        const componentHtml = parsed.code || (config ? config.generateHtml() : "");
                        if (targetBlock.code.includes('class="grid-cell"') || targetBlock.code.includes("grid-cell")) {
                          targetBlock.code = targetBlock.code.replace(/(<td[^>]*class="[^"]*grid-cell[^"]*"[^>]*>)([\s\S]*?)(<\/td>)/i, `$1\n${componentHtml}\n$3`);
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
                      updatedBody.splice(targetIndex + 1, 0, newBlock);
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
          </div>

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