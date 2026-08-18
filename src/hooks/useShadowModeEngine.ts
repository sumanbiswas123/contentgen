import { useEffect, useRef } from "react";
import Sortable from "sortablejs";
import { getBody, getCursorPointer } from "../Redux/ProductReducer/action";

export interface SelectedElementData {
  tagName: string;
  id: string;
  className: string;
  outerHTML: string;
  innerHTML: string;
  blockIndex: number;
  blockCode?: string;
  elementCode?: string;
}

interface ShadowModeEngineOptions {
  shadowRootRef: React.MutableRefObject<ShadowRoot | null>;
  interactionMode: "create" | "edit";
  createSubmode: "add" | "move";
  editSubmode: "default" | "text" | "assets";
  body: any[];
  dispatch: (action: any) => void;
  setSelectedElement: (el: SelectedElementData | null) => void;
  setEditedCode: (code: string) => void;
  setIsDockOpen: (open: boolean) => void;
  setHasUnsavedChanges: (v: boolean) => void;
  setHistory: (fn: (prev: any[]) => any[]) => void;
  setHistoryIndex: (fn: (prev: number) => number) => void;
  historyIndexRef: React.MutableRefObject<number>;
  editedCodeRef: React.MutableRefObject<string>;
}

/**
 * Shadow DOM–scoped Mode Engine
 * Handles ADD / MOVE / EDIT modes entirely within the parent React window,
 * scoped to the Shadow Root — zero bleed to the outer React UI.
 */
export function useShadowModeEngine({
  shadowRootRef,
  interactionMode,
  createSubmode,
  editSubmode,
  body,
  dispatch,
  setSelectedElement,
  setEditedCode,
  setIsDockOpen,
  setHasUnsavedChanges,
  setHistory,
  setHistoryIndex,
  historyIndexRef,
  editedCodeRef,
}: ShadowModeEngineOptions) {
  const sortableRef = useRef<Sortable | null>(null);
  const hoverOverlayRef = useRef<HTMLDivElement | null>(null);
  const selectOverlayRef = useRef<HTMLDivElement | null>(null);

  function positionOverlay(overlay: HTMLDivElement | null, target: HTMLElement) {
    if (!overlay || !target) return;
    const shadowRoot = shadowRootRef.current;
    if (!shadowRoot) return;
    const targetRect = target.getBoundingClientRect();
    const hostContainer = (shadowRoot.host || shadowRoot) as HTMLElement;
    const hostRect = hostContainer.getBoundingClientRect();

    overlay.style.top = `${targetRect.top - hostRect.top}px`;
    overlay.style.left = `${targetRect.left - hostRect.left}px`;
    overlay.style.width = `${targetRect.width}px`;
    overlay.style.height = `${targetRect.height}px`;
    overlay.style.display = "block";
  }

  function clearSelectedDropBoxes(exceptMenu?: HTMLElement) {
    const shadowRoot = shadowRootRef.current;
    if (!shadowRoot) return;
    shadowRoot.querySelectorAll<HTMLElement>(".bento-child-drop-box, .bento-parent-block-drop-box").forEach((box) => {
      box.removeAttribute("data-selected-drop-box");
      box.style.background = "#f4f4f5";
      box.style.borderColor = "#d4d4d8";
    });
    shadowRoot.querySelectorAll<HTMLElement>(".bento-block-menu").forEach((m) => {
      if (m !== exceptMenu) {
        m.style.display = "none";
      }
    });
  }

  function highlightSelectedDropBox(box: HTMLElement, exceptMenu?: HTMLElement) {
    const shadowRoot = shadowRootRef.current;
    if (!shadowRoot) return;
    clearSelectedDropBoxes(exceptMenu);
    box.setAttribute("data-selected-drop-box", "true");
    box.style.background = "#e0f2fe";
    box.style.borderColor = "#0284c7";
  }

  function getBlockIndex(el: Element): number {
    const shadowRoot = shadowRootRef.current;
    if (!shadowRoot) return 0;
    const bodyContainer = shadowRoot.querySelector("#sortable-body");
    if (!bodyContainer) return 0;

    let curr: Element | null = el;
    while (curr && curr !== bodyContainer) {
      if (curr.parentElement === bodyContainer && curr.tagName.toLowerCase() === "tr") {
        const topLevelBlocks = Array.from(bodyContainer.children).filter((child) => child.tagName.toLowerCase() === "tr");
        const idx = topLevelBlocks.indexOf(curr);
        return idx >= 0 ? idx : 0;
      }
      curr = curr.parentElement;
    }
    return 0;
  }

  function getTopLevelSectionTr(path: EventTarget[]): HTMLElement | undefined {
    const shadowRoot = shadowRootRef.current;
    const bodyContainer = shadowRoot?.querySelector("#sortable-body");
    if (!bodyContainer) return undefined;

    // Must be a DIRECT child <tr> of #sortable-body!
    for (const n of path) {
      if (n instanceof HTMLElement && n.tagName.toLowerCase() === "tr" && n.parentElement === bodyContainer) {
        return n;
      }
    }
    return undefined;
  }

  function getGridCellTd(path: EventTarget[]): HTMLElement | undefined {
    return path.find(
      (n) => n instanceof HTMLElement && (n as HTMLElement).classList.contains("grid-cell")
    ) as HTMLElement | undefined;
  }

  function updateSelectedPlusButton(sectionRow?: HTMLElement, gridCell?: HTMLElement) {
    const shadowRoot = shadowRootRef.current;
    if (!shadowRoot) return;
    let activeSelectEl = selectOverlayRef.current || (shadowRoot.querySelector("#nx-select-overlay") as HTMLDivElement | null);
    if (!activeSelectEl) return;
    const btnRightPlus = activeSelectEl.querySelector("#btn-add-bento-right") as HTMLElement | null;
    const menuPopup = activeSelectEl.querySelector("#bento-context-menu") as HTMLElement | null;
    if (!btnRightPlus) return;

    if (!sectionRow) {
      btnRightPlus.style.display = "none";
      if (menuPopup) menuPopup.style.display = "none";
      return;
    }

    const blockIdx = getBlockIndex(sectionRow);
    const colIdx = gridCell ? parseInt(gridCell.getAttribute("data-col-index") || "0", 10) : 0;

    btnRightPlus.style.display = "block";
    btnRightPlus.onclick = (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      if (menuPopup) {
        if (typeof (menuPopup as any).__setupMenuContent === "function") {
          (menuPopup as any).__setupMenuContent(!!gridCell);
        }
        menuPopup.setAttribute("data-target-block", String(blockIdx));
        menuPopup.setAttribute("data-target-col", String(colIdx));
        const currentDisplay = menuPopup.style.display;
        menuPopup.style.display = currentDisplay === "flex" ? "none" : "flex";
      }
    };
  }

  // -----------------------------------------------------------------
  // MOVE MODE: Sortable.js section row reordering
  // -----------------------------------------------------------------
  useEffect(() => {
    const shadowRoot = shadowRootRef.current;
    const isMoveMode = interactionMode === "create" && createSubmode === "move";
    const isAddOrMoveMode = interactionMode === "create";

    // Always clean up existing Sortable first
    if (sortableRef.current) {
      try { sortableRef.current.destroy(); } catch (e) {}
      sortableRef.current = null;
    }

    if (!isAddOrMoveMode || !shadowRoot) return;

    function renderPermanentAddSectionButtons() {
      if (!shadowRoot) return;

      const tbody =
        (shadowRoot.getElementById("sortable-body") as HTMLElement | null) ||
        shadowRoot.getElementById("sortable-root")?.querySelector<HTMLElement>("tbody") ||
        shadowRoot.querySelector<HTMLElement>("tbody");

      if (!tbody) return;

      // Clean up previous permanent section add bars and helper drop rows/boxes
      tbody.querySelectorAll(".bento-permanent-add-section-bar").forEach((el) => el.remove());
      tbody.querySelectorAll(".bento-permanent-add-section-row").forEach((el) => el.remove());
      tbody.querySelectorAll(".bento-child-drop-row").forEach((el) => el.remove());
      tbody.querySelectorAll(".bento-parent-block-drop-row").forEach((el) => el.remove());
      tbody.querySelectorAll(".bento-parent-block-drop-box").forEach((el) => el.remove());

      const sectionRows = Array.from(tbody.querySelectorAll<HTMLElement>(".draggable-row"));
      sectionRows.forEach((row, blockIdx) => {
        // Find top-level column cells
        const topLevelColCells = Array.from(row.querySelectorAll<HTMLElement>("tr.child-row > td.grid-cell"));

        const createDropBoxElement = (container: HTMLElement, label: string, colIndex: number, isChild: boolean, parentColIdx?: number) => {
          container.style.position = "relative";
          container.style.verticalAlign = "bottom";
          container.setAttribute("data-editor-padding", "true");

          let box = container.querySelector(":scope > .bento-child-drop-box") as HTMLElement | null;
          if (!box) {
            box = document.createElement("div");
            box.className = "bento-child-drop-box";
            box.setAttribute("data-block-idx", String(blockIdx));
            box.setAttribute("data-col-idx", String(colIndex));
            if (parentColIdx !== undefined) {
              box.setAttribute("data-parent-col-idx", String(parentColIdx));
            }
            box.style.cssText =
              "box-sizing:border-box; height:36px; border:1px solid #d4d4d8; background:#f4f4f5; border-radius:0px; display:flex; align-items:center; justify-content:center; position:absolute; bottom:6px; left:6px; right:6px; cursor:pointer; pointer-events:auto; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; user-select:none; -webkit-user-select:none;";
            box.innerHTML = `
              <span style="font-size:11px; font-weight:${isChild ? "500" : "600"}; color:${isChild ? "#52525b" : "#475569"}; letter-spacing:0.1px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${label}</span>
              <div class="bento-block-menu" style="position:absolute; top:-36px; right:0px; background:transparent; border:none; box-shadow:none; display:none; gap:3px; padding:0; z-index:100000; pointer-events:auto;">
                <button type="button" class="btn-block-add-below" title="Add Block Below" style="background:#ffffff; color:#334155; border:1px solid #cbd5e1; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button type="button" class="btn-block-copy" title="Copy Block" style="background:#ffffff; color:#334155; border:1px solid #cbd5e1; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button type="button" class="btn-block-cut" title="Cut Block" style="background:#ffffff; color:#334155; border:1px solid #cbd5e1; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.47" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
                </button>
                <button type="button" class="btn-block-delete" title="Delete Block" style="background:#ffffff; color:#334155; border:1px solid #cbd5e1; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            `;

            const menu = box.querySelector(".bento-block-menu") as HTMLElement | null;
            const btnAdd = box.querySelector(".btn-block-add-below") as HTMLElement | null;
            const btnCopy = box.querySelector(".btn-block-copy") as HTMLElement | null;
            const btnCut = box.querySelector(".btn-block-cut") as HTMLElement | null;
            const btnDelete = box.querySelector(".btn-block-delete") as HTMLElement | null;

            box.onclick = (evt) => {
              evt.stopPropagation();
              evt.preventDefault();
              const isAlreadyOpen = menu ? menu.style.display === "flex" : false;
              if (isAlreadyOpen) {
                clearSelectedDropBoxes();
                if (menu) menu.style.display = "none";
                const activeSelectEl = selectOverlayRef.current || (shadowRoot.querySelector("#nx-select-overlay") as HTMLDivElement | null);
                if (activeSelectEl) activeSelectEl.style.display = "none";
                updateSelectedPlusButton(undefined, undefined);
                setSelectedElement(null);
                return;
              }
              clearSelectedDropBoxes(menu || undefined);
              if (menu) menu.style.display = "flex";
              highlightSelectedDropBox(box!, menu || undefined);

              // Simultaneously select the host block or column to frame it and show the right-side plus button!
              const selectTarget = container || row;
              const activeSelectEl = selectOverlayRef.current || (shadowRoot.querySelector("#nx-select-overlay") as HTMLDivElement | null);
              if (activeSelectEl && selectTarget) {
                positionOverlay(activeSelectEl, selectTarget);
                activeSelectEl.style.border = "2px solid #0284c7";
                activeSelectEl.style.background = "transparent";
                activeSelectEl.style.boxShadow = "none";

                // If container is a child/column cell, pass it as gridCell to updateSelectedPlusButton
                const hostGridCell = container.classList.contains("grid-cell") || container.tagName.toLowerCase() === "td" ? container : undefined;
                updateSelectedPlusButton(row, hostGridCell);

                (shadowRoot as any).__activeSelectedElement = selectTarget;
                (shadowRoot as any).__activeSelectedDropBox = box;
                (shadowRoot as any).__activeSelectedBlockIndex = blockIdx;

                setSelectedElement({
                  tagName: selectTarget.tagName.toLowerCase(),
                  id: selectTarget.id || "",
                  className: typeof selectTarget.className === "string" ? selectTarget.className : "",
                  outerHTML: selectTarget.outerHTML,
                  innerHTML: selectTarget.innerHTML,
                  blockIndex: blockIdx,
                  blockCode: row.outerHTML,
                  elementCode: selectTarget.outerHTML,
                });
              }
            };

            if (btnAdd) {
              btnAdd.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                window.postMessage({ type: "bento-create-right-section", blockIndex: blockIdx }, "*");
              };
            }
            if (btnCopy) {
              btnCopy.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                window.postMessage({ type: "copy-block-at-index", blockIndex: blockIdx }, "*");
              };
            }
            if (btnCut) {
              btnCut.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                window.postMessage({ type: "cut-block-at-index", blockIndex: blockIdx }, "*");
              };
            }
            if (btnDelete) {
              btnDelete.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                window.postMessage({ type: "delete-block-at-index", blockIndex: blockIdx }, "*");
              };
            }

            container.appendChild(box);
          }
        };

        topLevelColCells.forEach((topCell, colIdx) => {
          const nestedTable = topCell.querySelector("table");
          if (nestedTable) {
            // 1. Render Column 1 header drop box on parent column
            createDropBoxElement(topCell, `Column ${colIdx + 1}: Drag components here`, colIdx, false);

            // 2. Render Child 1 & Child 2 inside nested cells
            const nestedCells = Array.from(nestedTable.querySelectorAll<HTMLElement>("td.nested-cell, td.grid-cell"));
            nestedCells.forEach((childCell, childIdx) => {
              createDropBoxElement(childCell, `Child ${childIdx + 1}`, childIdx, true, colIdx);
            });
          } else {
            // Standard single-level Column drop box
            createDropBoxElement(topCell, `Column ${colIdx + 1}: Drag components here`, colIdx, false);
          }
        });

        // 3. Render the Outer Most Parent Block Drop Box across the entire section row
        // Labeled "Block: Drag components here" with Add Below, Copy, Cut, Delete menu
        const mainWrapperTd = row.querySelector(":scope > td") as HTMLElement | null;
        if (mainWrapperTd && topLevelColCells.length >= 1) {
          let parentDropBox = row.querySelector(".bento-parent-block-drop-box") as HTMLElement | null;
          if (!parentDropBox) {
            mainWrapperTd.style.position = "relative";
            mainWrapperTd.style.paddingBottom = "46px";

            parentDropBox = document.createElement("div");
            parentDropBox.className = "bento-parent-block-drop-box";
            parentDropBox.setAttribute("data-block-idx", String(blockIdx));
            parentDropBox.style.cssText =
              "box-sizing:border-box; height:34px; border:1px dashed #94a3b8; background:#f8fafc; border-radius:0px; display:flex; align-items:center; justify-content:center; position:absolute; bottom:6px; left:6px; right:6px; cursor:pointer; pointer-events:auto; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; user-select:none; -webkit-user-select:none; z-index:10;";
            parentDropBox.innerHTML = `
              <span style="font-size:11px; font-weight:700; color:#334155; letter-spacing:0.2px;">Block: Drag components here</span>
              <div class="bento-block-menu" style="position:absolute; top:-36px; right:0px; background:transparent; border:none; box-shadow:none; display:none; gap:3px; padding:0; z-index:100000; pointer-events:auto;">
                <button type="button" class="btn-block-add-below" title="Add Block Below" style="background:#ffffff; color:#334155; border:1px solid #cbd5e1; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button type="button" class="btn-block-copy" title="Copy Block" style="background:#ffffff; color:#334155; border:1px solid #cbd5e1; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button type="button" class="btn-block-cut" title="Cut Block" style="background:#ffffff; color:#334155; border:1px solid #cbd5e1; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.47" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
                </button>
                <button type="button" class="btn-block-delete" title="Delete Block" style="background:#ffffff; color:#334155; border:1px solid #cbd5e1; width:28px; height:28px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            `;

            const pMenu = parentDropBox.querySelector(".bento-block-menu") as HTMLElement | null;
            const pBtnAdd = parentDropBox.querySelector(".btn-block-add-below") as HTMLElement | null;
            const pBtnCopy = parentDropBox.querySelector(".btn-block-copy") as HTMLElement | null;
            const pBtnCut = parentDropBox.querySelector(".btn-block-cut") as HTMLElement | null;
            const pBtnDelete = parentDropBox.querySelector(".btn-block-delete") as HTMLElement | null;

            parentDropBox.onclick = (evt) => {
              evt.stopPropagation();
              evt.preventDefault();
              const isAlreadyOpen = pMenu ? pMenu.style.display === "flex" : false;
              if (isAlreadyOpen) {
                clearSelectedDropBoxes();
                if (pMenu) pMenu.style.display = "none";
                const activeSelectEl = selectOverlayRef.current || (shadowRoot.querySelector("#nx-select-overlay") as HTMLDivElement | null);
                if (activeSelectEl) activeSelectEl.style.display = "none";
                updateSelectedPlusButton(undefined, undefined);
                setSelectedElement(null);
                return;
              }
              clearSelectedDropBoxes(pMenu || undefined);
              if (pMenu) pMenu.style.display = "flex";
              highlightSelectedDropBox(parentDropBox!, pMenu || undefined);

              // Select the entire parent section row
              const activeSelectEl = selectOverlayRef.current || (shadowRoot.querySelector("#nx-select-overlay") as HTMLDivElement | null);
              if (activeSelectEl && row) {
                positionOverlay(activeSelectEl, row);
                activeSelectEl.style.border = "2px solid #0284c7";
                activeSelectEl.style.background = "transparent";
                activeSelectEl.style.boxShadow = "none";
                updateSelectedPlusButton(row, undefined);

                (shadowRoot as any).__activeSelectedElement = row;
                (shadowRoot as any).__activeSelectedDropBox = parentDropBox;
                (shadowRoot as any).__activeSelectedBlockIndex = blockIdx;

                setSelectedElement({
                  tagName: "tr",
                  id: row.id || "",
                  className: typeof row.className === "string" ? row.className : "",
                  outerHTML: row.outerHTML,
                  innerHTML: row.innerHTML,
                  blockIndex: blockIdx,
                  blockCode: row.outerHTML,
                  elementCode: row.outerHTML,
                });
              }
            };

            if (pBtnAdd) {
              pBtnAdd.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                window.postMessage({ type: "bento-create-right-section", blockIndex: blockIdx }, "*");
              };
            }
            if (pBtnCopy) {
              pBtnCopy.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                window.postMessage({ type: "copy-block-at-index", blockIndex: blockIdx }, "*");
              };
            }
            if (pBtnCut) {
              pBtnCut.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                window.postMessage({ type: "cut-block-at-index", blockIndex: blockIdx }, "*");
              };
            }
            if (pBtnDelete) {
              pBtnDelete.onclick = (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                window.postMessage({ type: "delete-block-at-index", blockIndex: blockIdx }, "*");
              };
            }

            mainWrapperTd.appendChild(parentDropBox);
          }
        }
      });
    }

    function bindSortable() {
      if (!shadowRoot) return;

      renderPermanentAddSectionButtons();

      if (!isMoveMode) return;

      // Destroy stale instance before rebinding
      if (sortableRef.current) {
        try { sortableRef.current.destroy(); } catch (e) {}
        sortableRef.current = null;
      }

      const tbody =
        (shadowRoot.getElementById("sortable-body") as HTMLElement | null) ||
        shadowRoot.getElementById("sortable-root")?.querySelector<HTMLElement>("tbody") ||
        shadowRoot.querySelector<HTMLElement>("tbody");

      // Only bind when actual draggable section rows exist
      if (!tbody || !tbody.querySelector(".draggable-row")) return;

      // Give every section row a grab cursor
      tbody.querySelectorAll<HTMLElement>(".draggable-row").forEach((r) => {
        r.style.cursor = "grab";
      });

      sortableRef.current = new Sortable(tbody, {
        animation: 150,
        draggable: ".draggable-row",
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        onEnd(evt) {
          const oldIdx = evt.oldIndex;
          const newIdx = evt.newIndex;
          if (typeof oldIdx !== "number" || typeof newIdx !== "number" || oldIdx === newIdx) return;
          // Post a standard IPC reorder message — handled by standardTemplete.tsx
          window.postMessage({ type: "reorder", oldIndex: oldIdx, newIndex: newIdx }, "*");
        },
      });
    }

    // Initial bind
    bindSortable();

    // Watch the Shadow Root's direct children for replacement (innerHTML reset).
    // Fires synchronously after each DOM mutation → always rebinds to fresh tbody.
    const observer = new MutationObserver(() => {
      bindSortable();
    });

    // childList:true at the root level catches the full innerHTML swap
    observer.observe(shadowRoot, { childList: true, subtree: false });

    return () => {
      observer.disconnect();
      if (sortableRef.current) {
        try { sortableRef.current.destroy(); } catch (e) {}
        sortableRef.current = null;
      }
      if (shadowRoot) {
        shadowRoot.querySelectorAll<HTMLElement>(".draggable-row").forEach((r) => {
          r.style.cursor = "";
        });
        shadowRoot.querySelectorAll(".bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box").forEach((el) => el.remove());
      }
    };
  // Only needs to re-run when the interaction mode changes — MutationObserver
  // handles all DOM changes internally.
  }, [interactionMode, createSubmode, shadowRootRef]);

  // -----------------------------------------------------------------
  // Prevent link navigation on <a> elements across all modes inside Shadow DOM
  useEffect(() => {
    const shadowRoot = shadowRootRef.current;
    if (!shadowRoot) return;

    const handleCanvasButtonClick = (e: MouseEvent) => {
      const path = e.composedPath ? e.composedPath() : [];
      const link = path.find((n) => n instanceof HTMLElement && (n as HTMLElement).tagName.toLowerCase() === "a");
      if (link) {
        e.preventDefault();
      }

      const btn = path.find((n) => n instanceof HTMLElement && (n as HTMLElement).tagName.toLowerCase() === "button") as HTMLElement | undefined;
      if (btn) {
        if (btn.id === "btn-create-email" || btn.innerText?.includes("Create Email")) {
          e.preventDefault();
          e.stopPropagation();
          window.postMessage({ type: "create-new-email" }, "*");
        } else if (btn.innerText?.includes("Select Template")) {
          e.preventDefault();
          e.stopPropagation();
          window.postMessage({ type: "open-system-file-picker" }, "*");
        }
      }
    };

    shadowRoot.addEventListener("click", handleCanvasButtonClick as EventListener, true);
    return () => {
      shadowRoot.removeEventListener("click", handleCanvasButtonClick as EventListener, true);
    };
  }, [shadowRootRef]);

  // BUILD & CODE MODE: Shadow Root–scoped hover + click element selection
  // Only fires on elements INSIDE the shadow root canvas, never outside.
  // -----------------------------------------------------------------
  useEffect(() => {
    const shadowRoot = shadowRootRef.current;
    if (!shadowRoot) return;

    // Inject scoped editor stylesheet into Shadow Root DOM for canvas-only drop box padding
    let editorStyle = shadowRoot.querySelector("style[data-editor-style='true']");
    if (!editorStyle) {
      editorStyle = document.createElement("style");
      editorStyle.setAttribute("data-editor-style", "true");
      editorStyle.textContent = `
        td.grid-cell[data-editor-padding="true"] {
          padding-bottom: 48px !important;
        }
      `;
      shadowRoot.appendChild(editorStyle);
    }

    // Set default arrow cursor and relative positioning for canvas
    const hostEl = shadowRoot.host as HTMLElement;
    if (hostEl) {
      hostEl.style.cursor = "default";
      hostEl.style.position = "relative";
    }

    // Create hover & select overlays directly inside the Shadow Root DOM so they are scoped to canvas
    let hoverEl = hoverOverlayRef.current;
    if (!hoverEl || !shadowRoot.contains(hoverEl)) {
      if (hoverEl && hoverEl.parentElement) hoverEl.remove();
      hoverEl = document.createElement("div");
      hoverEl.id = "nx-hover-overlay";
      hoverEl.style.cssText =
        "position:absolute; pointer-events:none; z-index:999990; border:2px dashed #0284c7; background:rgba(2,132,199,0.05); border-radius:4px; display:none; box-sizing:border-box;";

      // Vertical Visual Resizing Drag Divider Line
      const dividerLine = document.createElement("div");
      dividerLine.id = "bento-resize-divider";
      dividerLine.style.cssText =
        "position:absolute; top:0px; bottom:0px; right:0px; width:4px; background:#0284c7; border-radius:2px; cursor:ew-resize; pointer-events:auto; display:none; z-index:999998; opacity:0.85;";
      hoverEl.appendChild(dividerLine);

      shadowRoot.appendChild(hoverEl);
      hoverOverlayRef.current = hoverEl;
    }

    let selectEl = selectOverlayRef.current;
    if (!selectEl || !shadowRoot.contains(selectEl)) {
      if (selectEl && selectEl.parentElement) selectEl.remove();
      selectEl = document.createElement("div");
      selectEl.id = "nx-select-overlay";
      selectEl.style.cssText =
        "position:absolute; pointer-events:none; z-index:999991; border:2px solid #0284c7; background:transparent; box-shadow:none; border-radius:4px; display:none; box-sizing:border-box;";

      // Right-side Bento Block Creation (+) Button for Selected Blocks
      const btnRightPlus = document.createElement("button");
      btnRightPlus.id = "btn-add-bento-right";
      btnRightPlus.type = "button";
      btnRightPlus.innerHTML = "+";
      btnRightPlus.title = "Add or Clone Block to Right";
      btnRightPlus.style.cssText =
        "position:absolute; top:50%; right:2px; transform:translateY(-50%); width:24px; height:24px; background:#0284c7; color:#ffffff; border:1.5px solid #ffffff; border-radius:50%; font-size:15px; font-weight:700; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.25); pointer-events:auto; display:none; line-height:20px; text-align:center; z-index:999999;";
      selectEl.appendChild(btnRightPlus);

      // Contextual Popup Menu on Right Plus Click
      const menuPopup = document.createElement("div");
      menuPopup.id = "bento-context-menu";
      menuPopup.style.cssText =
        "position:absolute; top:50%; right:30px; transform:translateY(-50%); background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.2); padding:6px; display:none; flex-direction:column; gap:4px; z-index:1000000; pointer-events:auto; width:165px;";

      const dispatchBentoAction = (actionType: string) => {
        const bIdxStr = menuPopup.getAttribute("data-target-block");
        const cIdxStr = menuPopup.getAttribute("data-target-col");
        const blockIndex = bIdxStr !== null && !isNaN(parseInt(bIdxStr, 10)) ? parseInt(bIdxStr, 10) : 0;
        const colIndex = cIdxStr !== null && !isNaN(parseInt(cIdxStr, 10)) ? parseInt(cIdxStr, 10) : 0;

        menuPopup.style.display = "none";

        const payload = { type: actionType, blockIndex, index: blockIndex, colIndex };

        window.postMessage(payload, "*");
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(payload, "*");
        }

        try {
          const bc = new BroadcastChannel("webview_ipc");
          bc.postMessage(payload);
          bc.close();
        } catch (e) {}

        try {
          if ((window as any).chrome?.webview?.postMessage) {
            (window as any).chrome.webview.postMessage(JSON.stringify(payload));
          }
        } catch (e) {}
      };

      const setupMenuContent = (isChild: boolean) => {
        if (isChild) {
          menuPopup.style.width = "165px";
          menuPopup.innerHTML = `
            <button id="bento-opt-create-right" style="background:transparent; border:none; padding:7px 10px; text-align:left; font-size:12px; font-weight:600; color:#1e293b; cursor:pointer; border-radius:4px; display:flex; align-items:center; gap:6px;">
              <span style="color:#0284c7; font-weight:bold;">➕</span> Create Right Block
            </button>
            <button id="bento-opt-create-child" style="background:transparent; border:none; padding:7px 10px; text-align:left; font-size:12px; font-weight:600; color:#1e293b; cursor:pointer; border-radius:4px; display:flex; align-items:center; gap:6px;">
              <span style="color:#8b5cf6; font-weight:bold;">🧱</span> Create Child Block
            </button>
            <button id="bento-opt-clone" style="background:transparent; border:none; padding:7px 10px; text-align:left; font-size:12px; font-weight:600; color:#1e293b; cursor:pointer; border-radius:4px; display:flex; align-items:center; gap:6px;">
              <span style="color:#10b981; font-weight:bold;">📋</span> Clone to Right
            </button>
            <div style="height:1px; background:#e2e8f0; margin:2px 0;"></div>
            <button id="bento-opt-delete" style="background:transparent; border:none; padding:7px 10px; text-align:left; font-size:12px; font-weight:600; color:#ef4444; cursor:pointer; border-radius:4px; display:flex; align-items:center; gap:6px;">
              <span style="color:#ef4444; font-weight:bold;">🗑️</span> Delete Block
            </button>
          `;

          menuPopup.querySelector("#bento-opt-create-right")?.addEventListener("click", (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            dispatchBentoAction("bento-create-horizontal-block");
          });

          menuPopup.querySelector("#bento-opt-create-child")?.addEventListener("click", (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            dispatchBentoAction("bento-create-child-nested-block");
          });

          menuPopup.querySelector("#bento-opt-clone")?.addEventListener("click", (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            dispatchBentoAction("bento-clone-horizontal-block");
          });

          menuPopup.querySelector("#bento-opt-delete")?.addEventListener("click", (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            dispatchBentoAction("delete-block-at-index");
          });
        } else {
          menuPopup.style.width = "155px";
          menuPopup.innerHTML = `
            <button id="bento-opt-create" style="background:transparent; border:none; padding:8px 10px; text-align:left; font-size:12px; font-weight:600; color:#1e293b; cursor:pointer; border-radius:4px; display:flex; align-items:center; gap:6px;">
              <span style="color:#0284c7; font-weight:bold;">+</span> Create Empty Block
            </button>
            <button id="bento-opt-clone" style="background:transparent; border:none; padding:8px 10px; text-align:left; font-size:12px; font-weight:600; color:#1e293b; cursor:pointer; border-radius:4px; display:flex; align-items:center; gap:6px;">
              <span style="color:#10b981; font-weight:bold;">📋</span> Clone to Right
            </button>
            <div style="height:1px; background:#e2e8f0; margin:2px 0;"></div>
            <button id="bento-opt-delete" style="background:transparent; border:none; padding:8px 10px; text-align:left; font-size:12px; font-weight:600; color:#ef4444; cursor:pointer; border-radius:4px; display:flex; align-items:center; gap:6px;">
              <span style="color:#ef4444; font-weight:bold;">🗑️</span> Delete Block
            </button>
          `;

          menuPopup.querySelector("#bento-opt-create")?.addEventListener("click", (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            dispatchBentoAction("bento-create-right-section");
          });

          menuPopup.querySelector("#bento-opt-clone")?.addEventListener("click", (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            dispatchBentoAction("bento-clone-horizontal-block");
          });

          menuPopup.querySelector("#bento-opt-delete")?.addEventListener("click", (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            dispatchBentoAction("delete-block-at-index");
          });
        }
      };

      (menuPopup as any).__setupMenuContent = setupMenuContent;
      selectEl.appendChild(menuPopup);

      shadowRoot.appendChild(selectEl);
      selectOverlayRef.current = selectEl;
    }

    const SKIP_TAGS = new Set(["html", "body", "style", "script", "head"]);

    function matchesSubmode(el: Element): boolean {
      if (el.closest && el.closest("#empty-canvas-welcome-row")) return false;
      const tag = el.tagName.toLowerCase();
      if (editSubmode === "assets") {
        return ["img", "svg", "video", "canvas", "picture", "figure"].includes(tag);
      }
      if (editSubmode === "text") {
        const textTags = ["p", "span", "a", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "b", "i", "u", "li", "td", "th", "label"];
        if (textTags.includes(tag)) return true;
        for (let i = 0; i < el.childNodes.length; i++) {
          if (el.childNodes[i].nodeType === Node.TEXT_NODE && (el.childNodes[i].textContent || "").trim().length > 0) return true;
        }
        return false;
      }
      return true; // "default" — match everything
    }

    const isMoveMode = (interactionMode === "create" && createSubmode === "move");

    const handleMouseHover = (e: MouseEvent) => {
      if (!hoverEl) return;

      // IMMEDIATELY HIDE OVERLAYS IF A MODAL IS ACTIVE OR DIALOG IS OPEN ANYWHERE (LOCAL OR PARENT WINDOW)
      const isModalOpen =
        document.body.classList.contains("modal-blur-active") ||
        !!document.querySelector(".modal-backdrop, .modal-blur-active, [role='dialog'], .fixed.inset-0") ||
        (window.parent && window.parent !== window && (
          window.parent.document.body.classList.contains("modal-blur-active") ||
          !!window.parent.document.querySelector(".modal-backdrop, .modal-blur-active, [role='dialog'], .fixed.inset-0")
        ));

      if (isModalOpen) {
        hoverEl.style.display = "none";
        if (selectEl) selectEl.style.display = "none";
        return;
      }

      const path = e.composedPath ? e.composedPath() : [];

      // FIX FLICKER: If the mouse pointer is currently hovering over hover or select overlay controls, DO NOT recalculate!
      if (path.some((n) => n === hoverEl || n === selectEl || (n instanceof HTMLElement && (hoverEl.contains(n as Node) || selectEl.contains(n as Node))))) {
        return;
      }

      const sectionRow = getTopLevelSectionTr(path);
      const gridCell = getGridCellTd(path);

      const dividerLine = hoverEl.querySelector("#bento-resize-divider") as HTMLElement | null;

      if (!sectionRow || sectionRow.id === "empty-canvas-welcome-row" || sectionRow.closest("#empty-canvas-welcome-row")) {
        if (dividerLine) dividerLine.style.display = "none";
        hoverEl.style.display = "none";
        return;
      }

      const blockIdx = getBlockIndex(sectionRow);
      const allCellsInRow = Array.from(sectionRow.querySelectorAll("td.grid-cell"));
      const isMultiCellRow = allCellsInRow.length > 1;

      // In ADD mode (createSubmode === "add"), show vertical resize dividers between adjacent cells persistently!
      const isAddMode = interactionMode === "create" && createSubmode === "add";

      if (gridCell) {
        // CHILD BLOCK CELL: Highlight child cell on hover!
        const colIdx = parseInt(gridCell.getAttribute("data-col-index") || "0", 10);

        // Find if this cell is a nested child cell or a top-level parent column
        const isNestedCell = gridCell.classList.contains("nested-cell");
        const parentRowContainer = isNestedCell 
          ? gridCell.closest("tr") 
          : sectionRow.querySelector("tr.child-row") || sectionRow.querySelector("tr");

        const siblingCells = parentRowContainer 
          ? (Array.from(parentRowContainer.children).filter(el => el.tagName.toLowerCase() === "td") as HTMLElement[])
          : allCellsInRow;

        const cellIndexInSiblings = siblingCells.indexOf(gridCell);

        // Show visual resize divider line on the right edge of this cell (if cellIndex < last sibling)
        if (dividerLine) {
          if (cellIndexInSiblings >= 0 && cellIndexInSiblings < siblingCells.length - 1) {
            dividerLine.style.display = "block";
            dividerLine.style.pointerEvents = "auto";
            dividerLine.style.cursor = "ew-resize";
            dividerLine.onmousedown = (dragEvt) => {
              dragEvt.stopPropagation();
              dragEvt.preventDefault();

              const startX = dragEvt.clientX;
              const parentTableEl = gridCell.closest("table") as HTMLTableElement | null;
              if (!parentTableEl) return;

              const totalAvailableWidth = parentTableEl.getBoundingClientRect().width || (isNestedCell ? 330 : 660);
              const curCell = siblingCells[cellIndexInSiblings];
              const nextCell = siblingCells[cellIndexInSiblings + 1];

              if (!curCell || !nextCell) return;

              const curCellStartPx = curCell.getBoundingClientRect().width;
              const nextCellStartPx = nextCell.getBoundingClientRect().width;
              const combinedWidthPx = curCellStartPx + nextCellStartPx;

              // Capture live resizing overlay
              if (hoverEl) hoverEl.style.display = "none";
              document.body.style.cursor = "ew-resize";
              document.body.style.userSelect = "none";

              const onMouseMove = (moveEvt: MouseEvent) => {
                moveEvt.preventDefault();
                const deltaX = moveEvt.clientX - startX;

                // Minimum cell width constraint: 10% or 30px
                const minPx = Math.max(30, combinedWidthPx * 0.1);
                const maxPx = combinedWidthPx - minPx;

                const newCurPx = Math.max(minPx, Math.min(maxPx, curCellStartPx + deltaX));
                const newNextPx = combinedWidthPx - newCurPx;

                const curPct = Math.round((newCurPx / totalAvailableWidth) * 1000) / 10;
                const nextPct = Math.round((newNextPx / totalAvailableWidth) * 1000) / 10;

                curCell.style.width = `${curPct}%`;
                curCell.style.maxWidth = `${curPct}%`;
                nextCell.style.width = `${nextPct}%`;
                nextCell.style.maxWidth = `${nextPct}%`;
              };

              const onMouseUp = () => {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
                document.body.style.cursor = "default";
                document.body.style.userSelect = "auto";

                // Clean clone of the root sectionRow ensuring zero temp elements are saved
                const cleanClone = sectionRow.cloneNode(true) as HTMLElement;
                cleanClone.querySelectorAll(".bento-child-drop-box, .bento-parent-block-drop-box, .bento-permanent-add-section-bar").forEach(el => el.remove());

                window.postMessage({
                  type: "update-block-html",
                  index: blockIdx,
                  code: cleanClone.outerHTML
                }, "*");
              };

              window.addEventListener("mousemove", onMouseMove);
              window.addEventListener("mouseup", onMouseUp);
            };
          } else {
            dividerLine.style.display = "none";
          }
        }

        hoverEl.style.border = "2px dashed #0284c7";
        hoverEl.style.background = "transparent";
        positionOverlay(hoverEl, gridCell);
      } else {
        // PARENT ROW / SINGLE BLOCK HOVER
        if (dividerLine) dividerLine.style.display = "none";

        hoverEl.style.border = "2px dashed #0284c7";
        hoverEl.style.background = "transparent";
        positionOverlay(hoverEl, sectionRow);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (hoverEl) {
        const related = e.relatedTarget as Node | null;
        if (related && hoverEl.contains(related)) return; // Don't hide if moving onto overlay controls
        hoverEl.style.display = "none";
      }
    };

    const handleClick = (e: MouseEvent) => {
      const path = e.composedPath ? e.composedPath() : [];
      let activeSelectEl = selectOverlayRef.current || (shadowRoot.querySelector("#nx-select-overlay") as HTMLDivElement | null);

      // If clicked inside select overlay controls (like + button or bento menu), preserve selection!
      if (activeSelectEl && path.some((n) => n === activeSelectEl || (n instanceof HTMLElement && activeSelectEl.contains(n as Node)))) {
        return;
      }

      // Clear previous active drag box highlights whenever a click occurs
      clearSelectedDropBoxes();

      if (isMoveMode) {
        // In MOVE mode, prevent opening element inspector dock for inner elements
        const sectionRow = getTopLevelSectionTr(path);
        const gridCell = getGridCellTd(path);
        if (sectionRow && sectionRow.id !== "empty-canvas-welcome-row" && !sectionRow.closest("#empty-canvas-welcome-row") && activeSelectEl) {
          positionOverlay(activeSelectEl, sectionRow);
          activeSelectEl.style.border = "2px solid #0284c7";
          activeSelectEl.style.background = "transparent";
          activeSelectEl.style.boxShadow = "none";
          updateSelectedPlusButton(sectionRow, gridCell);
        } else if (activeSelectEl) {
          activeSelectEl.style.display = "none";
          updateSelectedPlusButton(undefined, undefined);
        }
        return;
      }

      const isWelcomeCard = path.some((n) => n instanceof HTMLElement && ((n as HTMLElement).id === "empty-canvas-welcome-row" || (n as HTMLElement).closest("#empty-canvas-welcome-row")));
      if (isWelcomeCard) {
        if (activeSelectEl) {
          activeSelectEl.style.display = "none";
          updateSelectedPlusButton(undefined, undefined);
        }
        const btn = path.find((n) => n instanceof HTMLElement && (n as HTMLElement).tagName.toLowerCase() === "button") as HTMLButtonElement | undefined;
        if (btn) {
          const text = (btn.textContent || "").trim().toLowerCase();
          if (text.includes("select template")) {
            window.postMessage({ type: "open-system-file-picker" }, "*");
          } else if (text.includes("create email")) {
            window.postMessage({ type: "create-new-email" }, "*");
          }
        }
        return;
      }

      // Selection for block drop box area ("Block: Drag components here")
      const dropBox = path.find((n) => n instanceof HTMLElement && (
        (n as HTMLElement).classList.contains("bento-child-drop-box") ||
        (n as HTMLElement).classList.contains("bento-parent-block-drop-box")
      )) as HTMLElement | undefined;

      if (dropBox) {
        e.stopPropagation();
        highlightSelectedDropBox(dropBox);

        const sectionRow = getTopLevelSectionTr(path);
        const gridCell = getGridCellTd(path);
        const isChildDropBox = dropBox.classList.contains("bento-child-drop-box");
        const selectTarget = isChildDropBox ? (gridCell || sectionRow || dropBox) : (sectionRow || dropBox);
        if (activeSelectEl && selectTarget) {
          positionOverlay(activeSelectEl, selectTarget);
          activeSelectEl.style.border = "2px solid #0284c7";
          activeSelectEl.style.background = "transparent";
          activeSelectEl.style.boxShadow = "none";
          activeSelectEl.style.display = "block";
          updateSelectedPlusButton(sectionRow || selectTarget, gridCell);

          const blockIndex = sectionRow ? getBlockIndex(sectionRow) : 0;
          (shadowRoot as any).__activeSelectedElement = selectTarget;
          (shadowRoot as any).__activeSelectedDropBox = dropBox;
          (shadowRoot as any).__activeSelectedBlockIndex = blockIndex;

          setSelectedElement({
            tagName: selectTarget.tagName.toLowerCase(),
            id: selectTarget.id || "",
            className: typeof selectTarget.className === "string" ? selectTarget.className : "",
            outerHTML: selectTarget.outerHTML,
            innerHTML: selectTarget.innerHTML,
            blockIndex,
            blockCode: sectionRow?.outerHTML,
            elementCode: selectTarget.outerHTML,
          });
        }
        return;
      }

      // Element selection
      const target = path.find((n) => {
        if (!(n instanceof HTMLElement)) return false;
        if (n === shadowRoot.host) return false;
        if (n.closest && n.closest("#empty-canvas-welcome-row")) return false;
        const tag = n.tagName.toLowerCase();
        if (SKIP_TAGS.has(tag)) return false;
        if (n.id === "sortable-root" || n.id === "sortable-body" || n.id === "Emailer" || n.id?.startsWith("row") || n.id === "empty-canvas-welcome-row") return false;
        if (n.classList.contains("draggable-row") || n.classList.contains("parent-block") || n.classList.contains("great") || n.classList.contains("bento-permanent-add-section-bar") || n.classList.contains("bento-box-drop-container") || n.classList.contains("bento-child-drop-box")) return false;
        if (tag === "table" || tag === "tbody" || tag === "tr") return false;
        return true;
      }) as HTMLElement | undefined;

      if (!target || !matchesSubmode(target)) {
        (shadowRoot as any).__activeSelectedElement = null;
        (shadowRoot as any).__activeSelectedDropBox = null;
        if (activeSelectEl) activeSelectEl.style.display = "none";
        updateSelectedPlusButton(undefined, undefined);
        setSelectedElement(null);
        return;
      }

      e.stopPropagation();

      const sectionRow = getTopLevelSectionTr(path);
      const gridCell = getGridCellTd(path);

      if (selectEl) {
        positionOverlay(selectEl, target);
        updateSelectedPlusButton(sectionRow || target, gridCell);
      }

      const blockIndex = getBlockIndex(target);
      const rowEl = target.closest("tr.draggable-row, tr[id^='row'], tr.parent-block, tr.grid-fixed-row");

      // Apply text cursor style if a text element is clicked to edit ONLY IN EDIT MODE
      const tag = target.tagName.toLowerCase();
      const isTextElement = ["p", "span", "a", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "b", "i", "u", "li", "td", "th", "label"].includes(tag);
      if (isTextElement && interactionMode === "edit") {
        target.style.cursor = "text";
      } else {
        target.style.cursor = "default";
      }

      // Identify exact clicked element tag (or direct img child if clicking inside a link/wrapper around an img)
      let actualTarget = target;
      const imgChild = target.querySelector("img");
      if (tag !== "img" && imgChild && target.children.length === 1 && target.firstElementChild === imgChild) {
        actualTarget = imgChild;
      }
      const actualTag = actualTarget.tagName.toLowerCase();

      // If an image tag is selected, trigger right panel Property Inspector to open CImage options
      if (actualTag === "img") {
        window.postMessage({ type: "select-inspector-category", category: "CImage" }, "*");
      } else if (actualTag === "a") {
        window.postMessage({ type: "select-inspector-category", category: "CtaButton" }, "*");
      } else if (isTextElement) {
        window.postMessage({ type: "select-inspector-category", category: "Paragraph" }, "*");
      }

      // Store active target element reference on shadowRoot for instant direct DOM mutation
      (shadowRoot as any).__activeSelectedElement = actualTarget;
      (shadowRoot as any).__activeSelectedDropBox = null;
      (shadowRoot as any).__activeSelectedBlockIndex = blockIndex;

      const elementId = actualTarget.getAttribute("data-el-id") || `el-${Date.now()}`;

      // Broadcast full element data so BuildModeInspector can prefill form fields
      window.postMessage({
        type: "build-element-data",
        element: {
          elementId,
          tagName: actualTarget.tagName.toLowerCase(),
          id: actualTarget.id || "",
          className: typeof actualTarget.className === "string" ? actualTarget.className : "",
          outerHTML: actualTarget.outerHTML,
          innerHTML: actualTarget.innerHTML,
          elementCode: actualTarget.outerHTML,
          blockIndex,
          blockCode: rowEl?.outerHTML,
        }
      }, "*");

      setSelectedElement({
        tagName: target.tagName.toLowerCase(),
        id: target.id || "",
        className: typeof target.className === "string" ? target.className : "",
        outerHTML: target.outerHTML,
        innerHTML: target.innerHTML,
        blockIndex,
        blockCode: rowEl?.outerHTML,
        elementCode: target.outerHTML,
      });
      setEditedCode(target.outerHTML);

      // Open bottom code editor dock ONLY in EDIT mode
      if (interactionMode === "edit") {
        setIsDockOpen(true);
      }
    };

    shadowRoot.addEventListener("mouseover", handleMouseHover as EventListener);
    shadowRoot.addEventListener("mousemove", handleMouseHover as EventListener);
    shadowRoot.addEventListener("mouseleave", handleMouseLeave as EventListener);
    shadowRoot.addEventListener("click", handleClick as EventListener);

    // RESTORE ACTIVE SELECTION OVERLAY AND DRAG BOX HIGHLIGHT ON RE-RENDER
    const activeEl = (shadowRoot as any).__activeSelectedElement as HTMLElement | undefined;
    if (activeEl && shadowRoot.contains(activeEl) && selectEl) {
      positionOverlay(selectEl, activeEl);
      selectEl.style.border = "2px solid #0284c7";
      selectEl.style.background = "transparent";
      selectEl.style.boxShadow = "none";
      selectEl.style.display = "block";

      const sectionRow = getTopLevelSectionTr([activeEl]) || activeEl.closest("tr");
      const gridCell = getGridCellTd([activeEl]) || activeEl.closest("td.grid-cell");
      updateSelectedPlusButton((sectionRow as HTMLElement) || activeEl, (gridCell as HTMLElement) || undefined);

      const activeDrop = (shadowRoot as any).__activeSelectedDropBox as HTMLElement | undefined;
      const targetDropBox = activeDrop || (activeEl.classList.contains("bento-child-drop-box") || activeEl.classList.contains("bento-parent-block-drop-box") ? activeEl : undefined);
      if (targetDropBox && shadowRoot.contains(targetDropBox)) {
        const dropMenu = targetDropBox.querySelector(".bento-block-menu") as HTMLElement | null;
        highlightSelectedDropBox(targetDropBox, dropMenu || undefined);
      }
    }

    if (interactionMode === "create" && shadowRoot) {
      shadowRoot.querySelectorAll<HTMLElement>("[contenteditable]").forEach((el) => {
        el.removeAttribute("contenteditable");
        if (typeof el.blur === "function") el.blur();
      });
      shadowRoot.querySelectorAll<HTMLElement>("*").forEach((el) => {
        if (el.style.cursor === "text") {
          el.style.cursor = "default";
        }
      });
    }

    return () => {
      if (hostEl) hostEl.style.cursor = "";
      shadowRoot.removeEventListener("mouseover", handleMouseHover as EventListener);
      shadowRoot.removeEventListener("mousemove", handleMouseHover as EventListener);
      shadowRoot.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      shadowRoot.removeEventListener("click", handleClick as EventListener);
    };
  }, [interactionMode, createSubmode, editSubmode, body, shadowRootRef, setSelectedElement, setEditedCode, setIsDockOpen]);

  // Keep overlays managed per mode
  useEffect(() => {
    // Overlays stay active for both BUILD and CODE modes
  }, [interactionMode]);

  // Cleanup overlays on unmount
  useEffect(() => {
    return () => {
      if (hoverOverlayRef.current) {
        hoverOverlayRef.current.remove();
        hoverOverlayRef.current = null;
      }
      if (selectOverlayRef.current) {
        selectOverlayRef.current.remove();
        selectOverlayRef.current = null;
      }
      if (sortableRef.current) {
        try { sortableRef.current.destroy(); } catch (e) {}
        sortableRef.current = null;
      }
    };
  }, []);
}
