declare global {
  interface Window {
    __interactionMode: "move" | "edit";
    setInteractionMode: (mode: "move" | "edit") => void;
    sortableInstance: any;
    handleEditBlock: (index: number, e?: Event) => void;
    handleDeleteBlock: (index: number, e?: Event) => void;
    getClassName: (event?: Event) => void;
    closeInWebviewModal: () => void;
    loadFooterListInWebview: () => void;
    selectFooterInWebview: (encodedCode: string) => void;
    $: any;
    Sortable: any;
    parent: any;
    chrome: any;
  }
}

// Injected Webview Script Runner for Email Canvas (Strongly Typed TypeScript)
(function () {
  console.log("%c [CHILD CANVAS RUNNER INJECTED]", "background: #0284c7; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;");

  // Log image load statuses and broken URLs
  window.addEventListener("DOMContentLoaded", () => {
    const images = Array.from(document.querySelectorAll("img"));
    console.log(`[CHILD CANVAS] Total <img> elements found: ${images.length}`);
    images.forEach((img, index) => {
      console.log(`[CHILD CANVAS] Image #${index + 1} SRC:`, img.src);
      img.addEventListener("error", () => {
        console.error(`[CHILD CANVAS] Failed to load image #${index + 1}:`, img.src);
      });
      img.addEventListener("load", () => {
        console.log(`[CHILD CANVAS] Successfully loaded image #${index + 1}:`, img.src);
      });
    });
  });
  function safeGetLocalStorage(key: string, fallback: string = ""): string {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key) || fallback;
      }
    } catch (e) {}
    return fallback;
  }

  function safeSetLocalStorage(key: string, val: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, val);
      }
    } catch (e) {}
  }

  function sendIpcMessage(payload: any): void {
    try {
      const jsonStr = typeof payload === "string" ? payload : JSON.stringify(payload);

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, "*");
      }
      try {
        const ch = new BroadcastChannel("webview_ipc");
        ch.postMessage(payload);
        ch.close();
      } catch (e) {}

      if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage(jsonStr);
      }
    } catch (err) {
      console.warn("[CHILD CANVAS] sendIpcMessage error:", err);
    }
  }

  let currentEditingRow: number | null = null;
  window.__interactionMode = (safeGetLocalStorage("interaction_mode", "move") as "move" | "edit") || "move";
  let activeSelectedTarget: HTMLElement | null = null;

  // Overlays for Element Inspection in Edit Mode with GPU Hardware Acceleration (translate3d)
  let hoverOverlay: HTMLElement | null = null;
  let hoverTagBadge: HTMLElement | null = null;
  let selectOverlay: HTMLElement | null = null;
  let selectTagBadge: HTMLElement | null = null;
  // Tracks the exact element highlighted during direct (double-click) edit
  let currentEditDirectTarget: HTMLElement | null = null;

  function ensureOverlays() {
    if (!hoverOverlay) {
      hoverOverlay = document.createElement("div");
      hoverOverlay.id = "nx-hover-overlay";
      hoverOverlay.style.cssText =
        "position:absolute; top:0; left:0; pointer-events:none; z-index:999990; border:2px dashed #06b6d4; background:rgba(6,182,212,0.06); transition:transform 0.05s ease-out; display:none; border-radius:4px; transform-origin: top left;";
      hoverTagBadge = document.createElement("div");
      hoverTagBadge.style.cssText =
        "position:absolute; top:-22px; left:-2px; background:#06b6d4; color:#ffffff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; text-transform:uppercase; white-space:nowrap; letter-spacing:0.5px; box-shadow:0 2px 6px rgba(0,0,0,0.2);";
      hoverOverlay.appendChild(hoverTagBadge);
      document.body.appendChild(hoverOverlay);
    }

    if (!selectOverlay) {
      selectOverlay = document.createElement("div");
      selectOverlay.id = "nx-select-overlay";
      selectOverlay.style.cssText =
        "position:absolute; top:0; left:0; pointer-events:none; z-index:999991; border:2px solid #3b82f6; background:rgba(59,130,246,0.1); box-shadow:0 0 14px rgba(59,130,246,0.4); transition:transform 0.05s ease-out; display:none; border-radius:4px; transform-origin: top left;";
      selectTagBadge = document.createElement("div");
      selectTagBadge.style.cssText =
        "position:absolute; top:-24px; left:-2px; background:#3b82f6; color:#ffffff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:10px; font-weight:700; padding:3px 8px; border-radius:4px; text-transform:uppercase; white-space:nowrap; letter-spacing:0.5px; box-shadow:0 4px 10px rgba(59,130,246,0.5);";
      selectOverlay.appendChild(selectTagBadge);
      document.body.appendChild(selectOverlay);
    }
  }

  function updateOverlayPos(
    overlay: HTMLElement | null,
    badge: HTMLElement | null,
    targetEl: HTMLElement | null,
    label: string
  ) {
    if (!targetEl || !overlay) return;
    const rect = targetEl.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const posX = rect.left + scrollX;
    const posY = rect.top + scrollY;

    // Use GPU-accelerated translate3d transforms for 60FPS overlay locking
    overlay.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
    overlay.style.width = Math.max(rect.width, 12) + "px";
    overlay.style.height = Math.max(rect.height, 12) + "px";
    overlay.style.display = "block";
    if (badge && label) badge.innerText = label;
  }

  function getBlockIndex(el: HTMLElement): number {
    const tr = el.closest(".draggable-row");
    if (!tr) return 0;
    const tbody = tr.parentElement;
    if (!tbody) return 0;
    return Array.prototype.indexOf.call(tbody.children, tr);
  }

  // Global helper function for HTML inline onclick handlers (e.g. onclick="getClassName(event)")
  window.getClassName = function (event?: Event) {
    if (window.__interactionMode !== "move") {
      return;
    }
    const clickedElement = event ? (event.currentTarget as HTMLElement | null) : null;
    if (clickedElement && clickedElement.id) {
      sendIpcMessage({
        id: clickedElement.id,
        type: "customMessage"
      });
    }
  };

  function updateSortableState(isMove: boolean) {
    const el = document.getElementById("sortable-body") || 
               document.querySelector("#start") || 
               document.querySelector("table.Container > tbody") || 
               document.querySelector("table#sortable-root > tbody") ||
               document.querySelector("body > table > tbody");

    if (el) {
      if (!isMove) {
        if (window.sortableInstance) {
          try {
            window.sortableInstance.destroy();
          } catch (e) {}
          window.sortableInstance = null;
        }
      } else {
        if (typeof window.Sortable !== "undefined") {
          if (window.sortableInstance) {
            try { window.sortableInstance.destroy(); } catch (e) {}
          }
          window.sortableInstance = new window.Sortable(el, {
            animation: 150,
            direction: "vertical",
            draggable: ".draggable-row",
            ghostClass: "sortable-ghost",
            forceFallback: true,
            fallbackTolerance: 0,
            touchStartThreshold: 0,
            delay: 0,
            onEnd: function (evt: any) {
              if (window.__interactionMode !== "move") return;
              sendIpcMessage({
                type: "reorder",
                oldIndex: evt.oldIndex,
                newIndex: evt.newIndex
              });
            }
          });
        } else {
          // Retry initializing Sortable once script finishes loading
          setTimeout(() => {
            if (window.__interactionMode === "move") {
              updateSortableState(true);
            }
          }, 150);
        }
      }
    }

    const rows = document.querySelectorAll<HTMLElement>(".draggable-row");
    rows.forEach((r) => {
      if (isMove) {
        r.style.cursor = "move";
        r.removeAttribute("draggable");
      } else {
        r.style.cursor = "default";
        r.removeAttribute("draggable");
      }
    });
  }

  // Live in-place mode switcher (Zero Webview Reloads)
  window.setInteractionMode = function (mode: "move" | "edit") {
    window.__interactionMode = mode || "move";
    safeSetLocalStorage("interaction_mode", window.__interactionMode);
    if (document.body) {
      document.body.setAttribute("data-interaction-mode", window.__interactionMode);
    }
    const isMove = window.__interactionMode === "move";
    updateSortableState(isMove);
    if (isMove) {
      if (hoverOverlay) hoverOverlay.style.display = "none";
      if (selectOverlay) selectOverlay.style.display = "none";
    }
  };

  // Intercept and cancel drag events only when NOT in MOVE mode
  document.addEventListener(
    "dragstart",
    function (e) {
      if (window.__interactionMode !== "move") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    false
  );

  function handleIncomingMsg(event: any) {
    let data = event ? event.data || event : null;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {}
    }
    if (!data) return;

    const msgType = data.type;
    if (msgType === "set-interaction-mode") {
      const newMode = data.mode || "move";
      if (typeof window.setInteractionMode === "function") {
        window.setInteractionMode(newMode);
      }
    } else if (msgType === "set-theme-mode") {
      const theme = data.theme || "light";
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (msgType === "update-element-code") {
      const idx = data.index;
      const newCode = data.code;
      const rowTd = document.getElementById("row" + idx);
      if (rowTd) {
        const tbody = rowTd.querySelector("table > tbody");
        if (tbody && newCode) {
          tbody.innerHTML = newCode;
        }
      }
    } else if (msgType === "trigger-erase-confirm") {
      if (confirm("Are you sure you want to Start New Email? This will erase the current draft.")) {
        sendIpcMessage({ type: "confirm-erase-action" });
      }
    }
  }

  const ipcChannel = new BroadcastChannel("webview_ipc");
  const editorChannel = new BroadcastChannel("editor_channel");

  ipcChannel.onmessage = handleIncomingMsg;
  window.addEventListener("message", handleIncomingMsg);
  if (typeof (window as any).chrome?.webview?.addEventListener === "function") {
    (window as any).chrome.webview.addEventListener("message", handleIncomingMsg);
  }

  editorChannel.onmessage = function (event) {
    if (event.data && event.data.type === "set-backdrop-blur") {
      if (event.data.blur) {
        document.body.classList.add("modal-blur-active");
      } else {
        document.body.classList.remove("modal-blur-active");
      }
    }
  };

  window.handleEditBlock = function (index: number, e?: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (currentEditingRow === index) {
      exitEditMode(index);
    } else {
      if (currentEditingRow !== null) {
        exitEditMode(currentEditingRow);
      }
      enterEditMode(index);
    }
  };

  window.handleDeleteBlock = function (index: number, e?: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (confirm("Are you sure you want to delete this block?")) {
      if (currentEditingRow === index) {
        exitEditMode(index);
      }
      sendIpcMessage({ type: "delete-block", index: index });
    }
  };

  function enterEditMode(index: number, directTarget?: HTMLElement) {
    currentEditingRow = index;
    currentEditDirectTarget = null;
    updateSortableState(false);

    const rowTd = document.getElementById("row" + index);
    if (!rowTd) return;

    const rowTr = rowTd.closest("tr");
    if (rowTr) {
      rowTr.style.cursor = "default";
      rowTr.classList.add("editing-active");
    }

    if (directTarget && rowTd.contains(directTarget)) {
      // Double-click: highlight ONLY the clicked element, not the whole block
      currentEditDirectTarget = directTarget;
      directTarget.style.outline = "2px solid #3b82f6";
      directTarget.style.outlineOffset = "1px";
      directTarget.style.boxShadow = "0 0 8px rgba(59,130,246,0.35)";
      directTarget.setAttribute("contenteditable", "true");
      directTarget.style.cursor = "text";
      directTarget.addEventListener("blur", onEditableBlur);
    } else {
      // Called programmatically (e.g. from handleEditBlock): highlight the whole block
      rowTd.style.outline = "3px solid #3b82f6";
      rowTd.style.outlineOffset = "-3px";
      rowTd.style.boxShadow = "0 0 15px rgba(59, 130, 246, 0.2)";
    }

    // Make all text-containing children contenteditable
    const TEXT_SELECTOR = "td, p, span, a, h1, h2, h3, h4, h5, h6, strong, em, b, i, u, s, li, dt, dd, label, sup, sub";
    const textNodes = rowTd.querySelectorAll<HTMLElement>(TEXT_SELECTOR);
    let firstEditable: HTMLElement | null = directTarget || null;

    textNodes.forEach((el) => {
      if (el === directTarget) return; // already handled
      let hasTextContent = false;
      for (let i = 0; i < el.childNodes.length; i++) {
        const child = el.childNodes[i];
        if (child.nodeType === Node.TEXT_NODE && (child.textContent || "").trim().length > 0) {
          hasTextContent = true;
          break;
        }
      }
      if (hasTextContent || el.children.length === 0) {
        el.setAttribute("contenteditable", "true");
        el.style.cursor = "text";
        el.style.outline = "none";
        if (!firstEditable) firstEditable = el;
        el.addEventListener("blur", onEditableBlur);
      }
    });

    if (firstEditable) {
      (firstEditable as HTMLElement).focus();
      try {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(firstEditable);
        range.collapse(false);
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
      } catch (e) {}
    }
    sendIpcMessage({ type: "enter-edit-mode" });
  }

  function exitEditMode(index: number) {
    if (currentEditingRow === null) return;

    // Clear the direct-target highlight if one was set
    if (currentEditDirectTarget) {
      currentEditDirectTarget.style.outline = "";
      currentEditDirectTarget.style.outlineOffset = "";
      currentEditDirectTarget.style.boxShadow = "";
      currentEditDirectTarget = null;
    }

    const rowTd = document.getElementById("row" + index);
    if (rowTd) {
      rowTd.style.outline = "";
      rowTd.style.outlineOffset = "";
      rowTd.style.boxShadow = "";

      const rowTr = rowTd.closest("tr");
      if (rowTr) {
        rowTr.style.cursor = "default";
        rowTr.classList.remove("editing-active");
      }

      const textNodes = rowTd.querySelectorAll<HTMLElement>("[contenteditable]");
      textNodes.forEach((el) => {
        el.removeAttribute("contenteditable");
        el.style.cursor = "";
        el.style.outline = "";
        el.removeEventListener("blur", onEditableBlur);
      });
    }

    updateSortableState(window.__interactionMode === "move");
    currentEditingRow = null;
    sendIpcMessage({ type: "exit-edit-mode" });
  }

  function onEditableBlur() {
    setTimeout(() => {
      const activeEl = document.activeElement as HTMLElement | null;
      const index = currentEditingRow;
      if (index === null) return;

      const rowTd = document.getElementById("row" + index);
      if (rowTd && activeEl && rowTd.contains(activeEl)) {
        return;
      }

        if (rowTd) {
          const clone = rowTd.cloneNode(true) as HTMLElement;
          clone.querySelectorAll("[contenteditable]").forEach((editableEl) => {
            editableEl.removeAttribute("contenteditable");
            (editableEl as HTMLElement).style.outline = "";
            (editableEl as HTMLElement).style.outlineOffset = "";
            (editableEl as HTMLElement).style.cursor = "";
            (editableEl as HTMLElement).style.boxShadow = "";
            if (!(editableEl as HTMLElement).getAttribute("style")?.trim()) {
              editableEl.removeAttribute("style");
            }
          });

          sendIpcMessage({
            type: "update-block-html",
            index: index,
            code: clone.innerHTML
          });
        }
      exitEditMode(index);
    }, 200);
  }

  function initEditorScript() {
    if (document.body) {
      document.body.setAttribute("data-interaction-mode", window.__interactionMode);
    }

    document.addEventListener("contextmenu", function () {
      sendIpcMessage({ type: "customMessage", id: "reload" });
    });

    if (typeof window.$ !== "undefined") {
      const $target = window.$(".great");
      if ($target && $target.length) {
        window.$("html, body").animate({ scrollTop: $target.offset().top }, 500);
      }
    }

    // Hover overlay in EDIT mode
    document.addEventListener(
      "mouseover",
      function (e) {
        if (window.__interactionMode !== "edit") return;
        if (currentEditingRow !== null) return; // Suppress hover overlay during direct inline text editing
        const target = e.target as HTMLElement | null;
        if (
          !target ||
          target.id === "nx-hover-overlay" ||
          target.id === "nx-select-overlay" ||
          target.isContentEditable ||
          target.closest("[contenteditable='true']")
        )
          return;
        ensureOverlays();
        const tag = target.tagName.toLowerCase();
        const idStr = target.id ? "#" + target.id : "";
        const clsStr =
          target.className && typeof target.className === "string"
            ? "." + target.className.trim().split(/\s+/)[0]
            : "";
        updateOverlayPos(hoverOverlay, hoverTagBadge, target, "<" + tag + idStr + clsStr + ">");
      },
      true
    );

    document.addEventListener(
      "mouseout",
      function () {
        if (window.__interactionMode !== "edit") return;
        if (hoverOverlay) hoverOverlay.style.display = "none";
      },
      true
    );

    // Single-click element selection in EDIT mode
    document.addEventListener(
      "click",
      function (e) {
        if (window.__interactionMode !== "edit") return;
        if (currentEditingRow !== null) return; // Ignore click events while directly editing inline text
        const target = e.target as HTMLElement | null;
        if (
          !target || 
          target.id === "nx-hover-overlay" || 
          target.id === "nx-select-overlay" ||
          target.isContentEditable ||
          target.closest("[contenteditable='true']")
        ) return;

        ensureOverlays();
        activeSelectedTarget = target;
        const tag = target.tagName.toLowerCase();
        const blockIdx = getBlockIndex(target);
        updateOverlayPos(selectOverlay, selectTagBadge, target, "<" + tag + ">");

        const rowTd = document.getElementById("row" + blockIdx);
        const blockTbody = rowTd ? rowTd.querySelector("table > tbody") : null;
        const blockCode = blockTbody ? blockTbody.innerHTML : target.outerHTML;

        const payload = {
          type: "element-selected",
          element: {
            tagName: tag,
            id: target.id || "",
            className: typeof target.className === "string" ? target.className : "",
            outerHTML: target.outerHTML,
            innerHTML: target.innerHTML,
            blockIndex: blockIdx,
            blockCode: blockCode,
            elementCode: target.outerHTML  // just the clicked element for display in dock
          }
        };
        sendIpcMessage(payload);
      },
      true
    );

    document.addEventListener(
      "dblclick",
      function (e) {
        if (window.__interactionMode !== "edit") return;
        if (currentEditingRow !== null) return; // Prevent double trigger if already inline editing
        const target = e.target as HTMLElement | null;
        if (
          !target || 
          target.id === "nx-hover-overlay" || 
          target.id === "nx-select-overlay" ||
          target.isContentEditable ||
          target.closest("[contenteditable='true']")
        ) return;
        e.stopPropagation();
        e.preventDefault();
        // Hide overlays — we are now directly editing, not just selecting
        if (hoverOverlay) hoverOverlay.style.display = "none";
        if (selectOverlay) selectOverlay.style.display = "none";
        const blockIdx = getBlockIndex(target);
        // Pass the actual double-clicked element so it becomes contenteditable directly
        enterEditMode(blockIdx, target);
      },
      true
    );

    // Force-apply current mode from localStorage on script initialization
    const initialMode = (safeGetLocalStorage("interaction_mode", "move") as "move" | "edit") || "move";
    window.setInteractionMode(initialMode);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEditorScript);
  } else {
    initEditorScript();
  }
})();

