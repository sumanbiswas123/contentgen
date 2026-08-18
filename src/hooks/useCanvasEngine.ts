import { useDispatch, useSelector } from "react-redux";
import { getBody, getCursorPointer, getHeader, getFooter, getPreHeader, getPM } from "../Redux/ProductReducer/action";
import { EMAIL_COMPONENTS_CONFIG } from "../config/componentsConfig";

export interface CanvasBlock {
  type: string;
  code: string;
  isResponsiveMobile?: boolean;
}

export const useCanvasEngine = () => {
  const dispatch = useDispatch();
  const productReducer = useSelector((selector: any) => selector?.ProductReducer || {});
  const { Body = [], CursorPointer = 0 } = productReducer;
  const safeBody: CanvasBlock[] = Array.isArray(Body) ? Body : [];

  const addBlock = (componentKey: string, customCode?: string, targetIndex?: number) => {
    const config = EMAIL_COMPONENTS_CONFIG[componentKey];
    const code = customCode || (config ? config.generateHtml() : "");
    const blockType = config ? config.id : componentKey;

    const insertIndex = (typeof targetIndex === "number" && targetIndex >= 0)
      ? Math.min(safeBody.length, Math.max(0, targetIndex))
      : safeBody.length;

    const newBlock: CanvasBlock = { type: blockType, code };
    const updatedBody = [
      ...safeBody.slice(0, insertIndex),
      newBlock,
      ...safeBody.slice(insertIndex)
    ];

    try {
      localStorage.setItem("body", JSON.stringify(updatedBody));
    } catch (e) {}

    dispatch(getBody(updatedBody));
    dispatch(getCursorPointer(insertIndex));
  };

  const deleteBlock = (index: number) => {
    if (index < 0 || index >= safeBody.length) return;
    const updatedBody = safeBody.filter((_, i) => i !== index);
    try {
      localStorage.setItem("body", JSON.stringify(updatedBody));
    } catch (e) {}

    dispatch(getBody(updatedBody));
    const nextCursor = Math.max(0, index - 1);
    dispatch(getCursorPointer(nextCursor));
  };

  const duplicateBlock = (index: number) => {
    if (index < 0 || index >= safeBody.length) return;
    const targetBlock = safeBody[index];
    if (!targetBlock) return;

    const clonedBlock: CanvasBlock = {
      ...targetBlock,
      code: targetBlock.code // Deep HTML clone preserved
    };

    const updatedBody = [
      ...safeBody.slice(0, index + 1),
      clonedBlock,
      ...safeBody.slice(index + 1)
    ];

    try {
      localStorage.setItem("body", JSON.stringify(updatedBody));
    } catch (e) {}

    dispatch(getBody(updatedBody));
    dispatch(getCursorPointer(index + 1));
  };

  const toggleBlockResponsiveness = (index: number, isResponsive: boolean) => {
    if (index < 0 || index >= safeBody.length) return;
    const targetBlock = safeBody[index];
    if (!targetBlock) return;

    let updatedCode = targetBlock.code;
    if (isResponsive) {
      updatedCode = updatedCode
        .replace(/class="parent-block fixed-grid-row"/g, 'class="parent-block responsive-grid-row"')
        .replace(/data-is-responsive="false"/g, 'data-is-responsive="true"');
    } else {
      updatedCode = updatedCode
        .replace(/class="parent-block responsive-grid-row"/g, 'class="parent-block fixed-grid-row"')
        .replace(/data-is-responsive="true"/g, 'data-is-responsive="false"');
    }

    const updatedBlock: CanvasBlock = {
      ...targetBlock,
      code: updatedCode,
      isResponsiveMobile: isResponsive
    };

    const updatedBody = safeBody.map((b, i) => (i === index ? updatedBlock : b));

    try {
      localStorage.setItem("body", JSON.stringify(updatedBody));
    } catch (e) {}

    dispatch(getBody(updatedBody));
  };

  const eraseCanvas = () => {
    const keysToDelete = [
      "footer", "mailImages", "header", "preheader", "pmdate",
      "subjectline", "body", "mailHeaderImages", "mailFooterImages",
      "TrackerId", "CustomCss"
    ];
    for (let i = 0; i < keysToDelete.length; i++) {
      try {
        localStorage.removeItem(keysToDelete[i]);
      } catch (e) {}
    }
    dispatch(getHeader(""));
    dispatch(getFooter(""));
    dispatch(getPreHeader(""));
    dispatch(getPM(""));

    // Blank canvas initial state (dot matrix background only)
    const initialBody: CanvasBlock[] = [];
    try {
      localStorage.setItem("body", JSON.stringify(initialBody));
    } catch (e) {}

    dispatch(getBody(initialBody));
    dispatch(getCursorPointer(0));
  };

  const addHorizontalBlock = (blockIndex: number, colIndex?: number) => {
    if (blockIndex < 0 || blockIndex >= safeBody.length) return;
    const targetBlock = safeBody[blockIndex];
    if (!targetBlock) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = targetBlock.code;

    const cells = Array.from(tempDiv.querySelectorAll("td.grid-cell"));
    let currentContents: string[] = [];

    if (cells.length > 0) {
      currentContents = cells.map(cell => cell.innerHTML.trim());
    } else {
      // If block only contains single html code, treat whole block code as cell 0 content
      currentContents = [targetBlock.code];
    }

    const insertAt = typeof colIndex === "number" && colIndex >= 0 ? colIndex + 1 : currentContents.length;
    currentContents.splice(insertAt, 0, ""); // Insert empty block cell

    const parentBlockTr = tempDiv.querySelector("tr.parent-block");
    const isResponsive = parentBlockTr ? parentBlockTr.getAttribute("data-is-responsive") === "true" : false;

    const newCode = EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({
      childContents: currentContents,
      isResponsive
    });

    const updatedBlock = { ...targetBlock, code: newCode };
    const updatedBody = safeBody.map((b, i) => (i === blockIndex ? updatedBlock : b));

    try { localStorage.setItem("body", JSON.stringify(updatedBody)); } catch (e) {}
    dispatch(getBody(updatedBody));
  };

  const addRightSection = (blockIndex: number) => {
    let currentBody = safeBody;
    try {
      const lsStr = localStorage.getItem("body");
      if (lsStr) {
        const parsed = JSON.parse(lsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentBody = parsed;
        }
      }
    } catch (e) {}

    const newBlockCode = EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({
      childContents: [""],
      isResponsive: false
    });
    const newBlockItem = {
      type: "BLOCK",
      code: newBlockCode
    };

    const targetIdx = typeof blockIndex === "number" && blockIndex >= 0 && blockIndex < currentBody.length
      ? blockIndex + 1
      : currentBody.length;

    const updatedBody = Array.from(currentBody);
    updatedBody.splice(targetIdx, 0, newBlockItem);

    try { localStorage.setItem("body", JSON.stringify(updatedBody)); } catch (e) {}
    dispatch(getBody(updatedBody));
  };

  const cloneHorizontalBlock = (blockIndex: number, colIndex: number = 0) => {
    if (blockIndex < 0 || blockIndex >= safeBody.length) return;
    const targetBlock = safeBody[blockIndex];
    if (!targetBlock) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = targetBlock.code;

    const cells = Array.from(tempDiv.querySelectorAll("td.grid-cell"));
    let currentContents: string[] = [];

    if (cells.length > 0) {
      currentContents = cells.map(cell => cell.innerHTML.trim());
    } else {
      currentContents = [targetBlock.code];
    }

    const sourceContent = currentContents[colIndex] || currentContents[0] || "";
    currentContents.splice(colIndex + 1, 0, sourceContent);

    const parentBlockTr = tempDiv.querySelector("tr.parent-block");
    const isResponsive = parentBlockTr ? parentBlockTr.getAttribute("data-is-responsive") === "true" : false;

    const newCode = EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({
      childContents: currentContents,
      isResponsive
    });

    const updatedBlock = { ...targetBlock, code: newCode };
    const updatedBody = safeBody.map((b, i) => (i === blockIndex ? updatedBlock : b));

    try { localStorage.setItem("body", JSON.stringify(updatedBody)); } catch (e) {}
    dispatch(getBody(updatedBody));
  };

  const updateBlockColumnWidths = (blockIndex: number, newColWidths: number[]) => {
    let currentBody = safeBody;
    try {
      const ls = localStorage.getItem("body");
      if (ls) {
        const parsed = JSON.parse(ls);
        if (Array.isArray(parsed) && parsed.length > 0) currentBody = parsed;
      }
    } catch (e) {}

    if (blockIndex < 0 || blockIndex >= currentBody.length) return;
    const targetBlock = currentBody[blockIndex];
    if (!targetBlock) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = targetBlock.code;
    const parentBlockTr = tempDiv.querySelector("tr.parent-block");
    if (!parentBlockTr) return;

    // Only target TOP-LEVEL column cells (tr.child-row > td.grid-cell), NEVER flattening nested child tables!
    const topRow = tempDiv.querySelector("tr.child-row") || tempDiv.querySelector("tr");
    const topCols = topRow
      ? (Array.from(topRow.children).filter(el => el.tagName.toLowerCase() === "td") as HTMLElement[])
      : [];

    const isResponsive = parentBlockTr.getAttribute("data-is-responsive") === "true";

    // Directly mutate widths on the topCols without re-generating and wiping nested children
    topCols.forEach((td, idx) => {
      const widthPct = newColWidths[idx] || Math.round((100 / topCols.length) * 100) / 100;
      if (isResponsive) {
        td.style.width = "100%";
        td.style.maxWidth = `${widthPct}%`;
      } else {
        td.style.width = `${widthPct}%`;
      }
    });

    const parentTr = tempDiv.querySelector("tr.parent-block") || tempDiv.querySelector("tr");
    const updatedCode = parentTr ? parentTr.outerHTML : tempDiv.innerHTML;

    const updatedBlock = { ...targetBlock, code: updatedCode };
    const updatedBody = currentBody.map((b, i) => (i === blockIndex ? updatedBlock : b));

    try { localStorage.setItem("body", JSON.stringify(updatedBody)); } catch (e) {}
    dispatch(getBody(updatedBody));
  };

  const updateChildColumnWidths = (blockIndex: number, parentColIndex: number, childWidths: number[]) => {
    let currentBody = safeBody;
    try {
      const ls = localStorage.getItem("body");
      if (ls) {
        const parsed = JSON.parse(ls);
        if (Array.isArray(parsed) && parsed.length > 0) currentBody = parsed;
      }
    } catch (e) {}

    if (blockIndex < 0 || blockIndex >= currentBody.length) return;
    const targetBlock = currentBody[blockIndex];
    if (!targetBlock) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = targetBlock.code;

    const topRow = tempDiv.querySelector("tr.child-row") || tempDiv.querySelector("tr");
    const topCols = topRow
      ? (Array.from(topRow.children).filter(el => el.tagName.toLowerCase() === "td") as HTMLElement[])
      : [];

    const parentCol = topCols[parentColIndex] || topCols[0];
    if (!parentCol) return;

    const nestedTable = parentCol.querySelector("table");
    if (!nestedTable) return;

    const nestedRow = nestedTable.querySelector("tr");
    const nestedCells = nestedRow
      ? (Array.from(nestedRow.children).filter(el => el.tagName.toLowerCase() === "td") as HTMLElement[])
      : Array.from(nestedTable.querySelectorAll<HTMLElement>("td.nested-cell"));

    nestedCells.forEach((td, idx) => {
      const widthPct = childWidths[idx] || Math.round((100 / nestedCells.length) * 100) / 100;
      td.style.width = `${widthPct}%`;
      td.style.maxWidth = `${widthPct}%`;
    });

    const parentTr = tempDiv.querySelector("tr.parent-block") || tempDiv.querySelector("tr");
    const updatedCode = parentTr ? parentTr.outerHTML : tempDiv.innerHTML;

    const updatedBlock = { ...targetBlock, code: updatedCode };
    const updatedBody = currentBody.map((b, i) => (i === blockIndex ? updatedBlock : b));

    try { localStorage.setItem("body", JSON.stringify(updatedBody)); } catch (e) {}
    dispatch(getBody(updatedBody));
  };

  const updateParentGridMatrix = (blockIndex: number, rows: number, cols: number) => {
    if (blockIndex < 0 || blockIndex >= safeBody.length) return;
    const targetBlock = safeBody[blockIndex];
    if (!targetBlock) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = targetBlock.code;
    const parentBlockTr = tempDiv.querySelector("tr.parent-block");
    if (!parentBlockTr) return;

    const cells = Array.from(tempDiv.querySelectorAll("td.grid-cell"));
    const currentContents = cells.map(cell => cell.innerHTML.trim());
    const isResponsive = parentBlockTr.getAttribute("data-is-responsive") === "true";

    const newCode = EMAIL_COMPONENTS_CONFIG["BLOCK"].generateHtml({
      childContents: currentContents,
      rowsCount: rows,
      colsCount: cols,
      isResponsive
    });

    const updatedBlock = { ...targetBlock, code: newCode };
    const updatedBody = safeBody.map((b, i) => (i === blockIndex ? updatedBlock : b));

    try { localStorage.setItem("body", JSON.stringify(updatedBody)); } catch (e) {}
    dispatch(getBody(updatedBody));
  };

  return {
    body: safeBody,
    cursorPointer: CursorPointer,
    addBlock,
    addHorizontalBlock,
    addRightSection,
    cloneHorizontalBlock,
    updateBlockColumnWidths,
    updateChildColumnWidths,
    updateParentGridMatrix,
    deleteBlock,
    duplicateBlock,
    toggleBlockResponsiveness,
    eraseCanvas
  };
};
