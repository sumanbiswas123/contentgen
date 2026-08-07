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

  return {
    body: safeBody,
    cursorPointer: CursorPointer,
    addBlock,
    deleteBlock,
    duplicateBlock,
    toggleBlockResponsiveness,
    eraseCanvas
  };
};
