import { EMAIL_COMPONENTS_CONFIG } from "../../../config/componentsConfig";

export interface CraftNodeData {
  type: string;
  code?: string;
  children?: CraftNodeData[];
}

export const compileCraftToHtml = (nodes: any[]): string => {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return "";
  }

  const cleanRows = nodes
    .map((node) => {
      let code = node.code || "";
      if (!code && node.type && EMAIL_COMPONENTS_CONFIG[node.type]) {
        code = EMAIL_COMPONENTS_CONFIG[node.type].generateHtml({
          positionOptions: { isFirst: false, isLast: false },
        });
      }

      if (!code) return "";

      // Clean transient editor overlays, helper drop boxes, and attributes
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<table><tbody>${code}</tbody></table>`, "text/html");

      doc.querySelectorAll(
        ".bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box, #nx-hover-overlay, #nx-select-overlay, #live-drop-indicator"
      ).forEach((el) => el.remove());

      doc.querySelectorAll("*").forEach((el) => {
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

        const elId = el.getAttribute("id");
        if (elId && (elId.startsWith("row") || elId === "sortable-root" || elId === "sortable-body")) {
          el.removeAttribute("id");
        }

        if (el.className && typeof el.className === "string") {
          const cleanedClass = el.className
            .replace(/\b(draggable-row|editing-active|hover-active|selected-active|parent-block|fixed-grid-row|child-row|grid-cell|element-row)\b/g, "")
            .trim()
            .replace(/\s+/g, " ");
          if (cleanedClass) {
            el.setAttribute("class", cleanedClass);
          } else {
            el.removeAttribute("class");
          }
        }
      });

      const bodyEl = doc.querySelector("tbody");
      return bodyEl ? bodyEl.innerHTML.trim() : code;
    })
    .filter(Boolean)
    .join("\n");

  return cleanRows;
};
