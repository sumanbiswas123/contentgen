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
  Save
} from "lucide-react";
import { getBody } from "../../Redux/ProductReducer/action";
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
  const [viewWidth] = useState<string>("660");
  const [interactionMode, setInteractionMode] = useState<"move" | "edit">("move");
  const [selectedElement, setSelectedElement] = useState<SelectedElementData | null>(null);
  const [editedCode, setEditedCode] = useState<string>("");
  const [isDockOpen, setIsDockOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dispatch = useDispatch();

  const modeRef = useRef(interactionMode);
  useEffect(() => {
    modeRef.current = interactionMode;
  }, [interactionMode]);

  const Template = useSelector((selector: any) => selector.ProductReducer.DummeyTemplate);
  const CleanTemplate = useSelector((selector: any) => selector.ProductReducer.Template);
  const BrandThemeColor = useSelector((selector: any) => selector.ProductReducer.BrandThemeColor);

  let templateModified = Template ? Template.replace(/\${BrandThemeColor}/g, BrandThemeColor) : "";

  // Broadcast interaction mode change to webview iframe and child windows seamlessly in-place
  const broadcastInteractionMode = useCallback((mode: "move" | "edit") => {
    try {
      const payload = { type: "set-interaction-mode", mode };
      const channel = new BroadcastChannel("webview_ipc");
      channel.postMessage(payload);
      channel.close();

      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(payload, "*");
        if ((iframeRef.current.contentWindow as any).setInteractionMode) {
          (iframeRef.current.contentWindow as any).setInteractionMode(mode);
        }
      }

      if (typeof (window as any).set_interaction_mode === "function") {
        (window as any).set_interaction_mode(mode);
      }

      if (typeof (window as any).eval_child_js === "function") {
        (window as any).eval_child_js(`if(window.setInteractionMode) window.setInteractionMode('${mode}');`);
      }
    } catch (e) {
      console.warn("Broadcast error:", e);
    }
  }, []);

  const handleModeChange = (mode: "move" | "edit") => {
    setInteractionMode(mode);
    broadcastInteractionMode(mode);
    if (mode === "move") {
      setIsDockOpen(false);
    }
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
        setIsDockOpen(true);
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
    const t1 = setTimeout(() => broadcastInteractionMode(modeRef.current), 300);
    const t2 = setTimeout(() => broadcastInteractionMode(modeRef.current), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [templateModified, broadcastInteractionMode]);

  // When user toggles mode button, send immediately (child is already loaded)
  useEffect(() => {
    broadcastInteractionMode(interactionMode);
  }, [interactionMode, broadcastInteractionMode]);

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
          const blockIndex = selectedElement.blockIndex;
          const elementId = selectedElement.id ? `'${selectedElement.blockIndex}'` : "null";
          
          (window as any).eval_child_js(
            `(function(){
              var rowTd = document.getElementById('row${blockIndex}');
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

      // If a local file was opened from disk, save sanitized production HTML directly back to that file
      if (openedFilePath && typeof (window as any).save_file_to_disk === "function") {
        let rawSaveHtml = CleanTemplate || templateModified || "";

        // Sanitize canvas-runner & Sortable editing attributes from saved output
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

          // Strip http://127.0.0.1:9732/ absolute disk prefixes from image src attributes
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

      // Directly update native webview html content to visually undo in canvas
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

      // Directly update native webview html content to visually redo in canvas
      if (typeof (window as any).update_child_html === "function") {
        (window as any).update_child_html(Template || "");
      }
    }
  };

  // Format HTML Code in Inspector Dock
  const handleFormatCode = () => {
    try {
      let formatted = editedCode
        .replace(/></g, ">\n<")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join("\n");
      setEditedCode(formatted);
      setHasUnsavedChanges(true);
    } catch (e) {
      console.warn("Format failed:", e);
    }
  };

  // Copy HTML to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(editedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Initialize native child WebView2 canvas container
  useEffect(() => {
    if (typeof (window as any).init_child_canvas === "function") {
      (window as any).init_child_canvas();
    }
  }, []);

  // Synchronize native WebView2 window bounds with the DOM element bounding box via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    // Ultra-smooth time-based cubic ease-out lerp for native Win32 webview window
    let animFrameId: number | null = null;
    let animStartTime: number | null = null;
    let startBounds = { x: 0, y: 0, w: 0, h: 0 };
    let currentBounds = { x: 0, y: 0, w: 0, h: 0 };
    let targetBounds = { x: 0, y: 0, w: 0, h: 0 };
    let isAnimating = false;

    // Fast cubic ease-out curve: 1 - (1 - t)^3
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateBounds = (now: number) => {
      if (!animStartTime) animStartTime = now;
      const duration = 240; // 240ms duration
      const elapsed = now - animStartTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = easeOutCubic(progress);

      currentBounds.x = startBounds.x + (targetBounds.x - startBounds.x) * ease;
      currentBounds.y = startBounds.y + (targetBounds.y - startBounds.y) * ease;
      currentBounds.w = startBounds.w + (targetBounds.w - startBounds.w) * ease;
      currentBounds.h = startBounds.h + (targetBounds.h - startBounds.h) * ease;

      const hasBinding = typeof (window as any).sync_child_bounds === "function";
      const payload = `${Math.round(currentBounds.x)},${Math.round(currentBounds.y)},${Math.round(currentBounds.w)},${Math.round(currentBounds.h)},true,${Math.round(currentBounds.w)}`;
      if (hasBinding) (window as any).sync_child_bounds(payload);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animateBounds);
      } else {
        isAnimating = false;
        animStartTime = null;
      }
    };

    const syncBounds = () => {
      if (!containerRef.current) return;

      const hasBinding = typeof (window as any).sync_child_bounds === "function";
      const isSavedTemplateModalActive = document.body.classList.contains("modal-blur-active");
      
      if (isSavedTemplateModalActive) {
        if (hasBinding) {
          (window as any).sync_child_bounds("0,0,0,0,false");
        }
        return;
      }

      const isFooterModalActive = document.body.classList.contains("footer-modal-open");
      const rect = containerRef.current.getBoundingClientRect();
      const numWidth = parseInt(viewWidth, 10);
      
      // Ensure child webview width never exceeds the container DOM bounding rect width
      let w = Math.min(numWidth, Math.floor(rect.width));
      if (w < 0) w = 0;

      // Center child webview evenly in remaining left space
      const panelWidth = 520;
      const leftAvailableArea = window.innerWidth - panelWidth;
      let targetX = isFooterModalActive
        ? Math.max(16, (leftAvailableArea - w) / 2)
        : rect.left + (rect.width - w) / 2;

      if (!isFooterModalActive) {
        if (targetX < rect.left) targetX = rect.left;
        broadcastInteractionMode(modeRef.current);
      } else {
        broadcastInteractionMode("view");
      }
      
      let targetY = rect.top;
      let targetH = rect.height;

      if (isFooterModalActive) {
        targetY = Math.max(16, (window.innerHeight - rect.height) / 2);
      }

      if (targetY + targetH > window.innerHeight) {
        targetH = window.innerHeight - targetY - 16;
      }
      if (targetH < 0) targetH = 0;
      if (w < 0) w = 0;

      targetBounds = { x: targetX, y: targetY, w, h: targetH };

      // Initialize current bounds if first run
      if (currentBounds.w === 0 && currentBounds.h === 0) {
        currentBounds = { ...targetBounds };
        startBounds = { ...targetBounds };
        const payload = `${Math.round(currentBounds.x)},${Math.round(currentBounds.y)},${Math.round(currentBounds.w)},${Math.round(currentBounds.h)},true,${numWidth}`;
        if (hasBinding) (window as any).sync_child_bounds(payload);
        return;
      }

      // If OPENING footer modal: position instantly without Lerp
      if (isFooterModalActive) {
        currentBounds = { ...targetBounds };
        startBounds = { ...targetBounds };
        const payload = `${Math.round(currentBounds.x)},${Math.round(currentBounds.y)},${Math.round(currentBounds.w)},${Math.round(currentBounds.h)},true,${numWidth}`;
        if (hasBinding) (window as any).sync_child_bounds(payload);
        return;
      }

      // If CLOSING footer modal: animate smoothly back to original position
      startBounds = { ...currentBounds };
      animStartTime = null;
      if (!isAnimating) {
        isAnimating = true;
        animFrameId = requestAnimationFrame(animateBounds);
      }
    };

    const observer = new ResizeObserver(syncBounds);
    observer.observe(containerRef.current);

    const mutationObserver = new MutationObserver(syncBounds);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", syncBounds);
    syncBounds();

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", syncBounds);
      if (typeof (window as any).sync_child_bounds === "function") {
        (window as any).sync_child_bounds("0,0,0,0,false");
      }
    };
  }, [viewWidth]);

  // Update HTML content in the native child webview
  useEffect(() => {
    const hasBinding = typeof (window as any).update_child_html === "function";
    if (hasBinding) {
      (window as any).update_child_html(templateModified || "");
      // Immediately sync current interaction mode to the newly loaded document
      setTimeout(() => {
        broadcastInteractionMode(modeRef.current);
      }, 50);
    }
  }, [templateModified, broadcastInteractionMode]);

  const hasNativeBinding = typeof (window as any).update_child_html === "function";

  const bodyItems = useSelector((selector: any) => selector.ProductReducer.Body);
  const hasCanvasContent = Array.isArray(bodyItems) && bodyItems.length > 0;

  return (
    <div className="frameContainer">
      {/* Centered Canvas Column matching Exact Webview viewWidth (660px) */}
      <div style={{
        width: `${viewWidth}px`,
        maxWidth: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative"
      }}>
        {/* Top Action Bar (Aligned with Webview Edges & Centered MOVE/EDIT Toggle) */}
        {hasCanvasContent && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "10px",
            zIndex: 50,
            position: "relative"
          }}>
            {/* Top Left: Ultra-Minimalist Icon Capsule (Flush with Webview Left Edge) */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-color)",
              borderRadius: "999px",
              padding: "4px 10px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
            }}>
              {/* Show Status Dot & Save Icon only for Local Files */}
              {openedFilePath && (
                <>
                  <div 
                    title={hasUnsavedChanges ? "Unsaved changes pending (Press Ctrl+S to Save)" : "All changes saved"}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: hasUnsavedChanges ? "#ef4444" : "#22c55e",
                      boxShadow: hasUnsavedChanges ? "0 0 8px #ef4444" : "0 0 8px #22c55e",
                      transition: "all 0.3s ease"
                    }} 
                  />

                  <div style={{ width: "1px", height: "14px", background: "var(--border-color)", margin: "0 2px" }} />
                </>
              )}

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
                  padding: "3px 5px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <RotateCcw size={14} />
              </button>

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
                  padding: "3px 5px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <RotateCw size={14} />
              </button>

              {openedFilePath && (
                <button
                  type="button"
                  onClick={handleSaveCode}
                  disabled={!hasUnsavedChanges}
                  title="Save Changes (Ctrl+S)"
                  style={{
                    background: hasUnsavedChanges ? "var(--grad-brand)" : "transparent",
                    color: hasUnsavedChanges ? "#ffffff" : "var(--text-muted)",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: hasUnsavedChanges ? "pointer" : "default",
                    opacity: hasUnsavedChanges ? 1 : 0.4,
                    boxShadow: hasUnsavedChanges ? "0 2px 8px rgba(2, 132, 199, 0.3)" : "none",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <Save size={14} />
                </button>
              )}
            </div>

            {/* Absolute Centered 2-Way Mode Toggle (MOVE | EDIT) */}
            <div 
              className="light-3d-toggle-bar"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)"
              }}
            >
              <div className={`sliding-pill-indicator ${interactionMode}`} />
              <button
                type="button"
                className={`light-3d-btn move-btn ${interactionMode === "move" ? "active" : ""}`}
                onClick={() => handleModeChange("move")}
                title="Move Mode: Reorder blocks via drag-and-drop"
              >
                MOVE
              </button>

              <button
                type="button"
                className={`light-3d-btn edit-btn ${interactionMode === "edit" ? "active" : ""}`}
                onClick={() => handleModeChange("edit")}
                title="Edit Mode: Click elements to inspect and edit code in bottom dock"
              >
                EDIT
              </button>
            </div>
          </div>
        )}

        {/* Main Webview Canvas Container */}
        <div className="iframeContainer" style={{ flex: 1, minHeight: 0 }}>
          <div 
            ref={containerRef} 
            className="native-webview-placeholder" 
            style={{ width: "100%", height: "100%" }} 
          >
            {!hasNativeBinding && (
              <iframe
                ref={iframeRef}
                className="iframe-fallback-web"
                title="Email Template Webview"
                srcDoc={templateModified}
                onLoad={() => broadcastInteractionMode(interactionMode)}
              />
            )}
          </div>
        </div>

        {/* Inspector Code Dock (Flex Panel: Smoothly Pushes Webview Height Up) */}
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