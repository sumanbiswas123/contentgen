export interface SectionItem {
  type: string;
  code: string;
}

export const parseHtmlToCraftNodes = (htmlContent: string): SectionItem[] => {
  if (!htmlContent || !htmlContent.trim()) {
    return [];
  }

  const sectionItems: SectionItem[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // 1. Check for #sortable-body or main container tbody
    const sortableBody = doc.getElementById("sortable-body") || doc.querySelector("tbody#start");

    if (sortableBody) {
      // Clean helper drop box elements
      sortableBody
        .querySelectorAll(
          ".bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box"
        )
        .forEach((el) => el.remove());

      const rows = Array.from(sortableBody.children).filter(
        (el) => el.classList.contains("draggable-row") || el.tagName.toLowerCase() === "tr"
      );

      rows.forEach((rowEl) => {
        const cleanRow = rowEl.cloneNode(true) as Element;
        cleanRow
          .querySelectorAll(
            ".bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box"
          )
          .forEach((el) => el.remove());

        // Strip editor attributes
        cleanRow.removeAttribute("data-id");
        cleanRow.removeAttribute("id");
        cleanRow.removeAttribute("onclick");
        cleanRow.removeAttribute("style");
        cleanRow.classList.remove("draggable-row");
        cleanRow.querySelectorAll(".grid-cell").forEach((cell) => {
          cell.classList.remove("grid-cell");
          cell.removeAttribute("data-editor-padding");
        });

        const code = cleanRow.outerHTML;
        if (code && code.trim()) {
          sectionItems.push({ type: "BLOCK", code: code.trim() });
        }
      });
    } else {
      // 2. Parse top-level tables or sections for external agency HTML
      const candidateRows = Array.from(doc.querySelectorAll("body > table, body > div, tr"));
      candidateRows.forEach((el) => {
        if (el.tagName.toLowerCase() === "tr" && el.parentElement?.closest("table")) {
          // Ignore nested child table rows
          if (el.parentElement.closest("table")?.parentElement?.closest("table")) {
            return;
          }
        }

        const code = el.outerHTML;
        if (code && code.trim()) {
          sectionItems.push({ type: "BLOCK", code: code.trim() });
        }
      });
    }
  } catch (err) {
    console.warn("[htmlToCraftParser] Section parsing error:", err);
  }

  if (sectionItems.length === 0) {
    sectionItems.push({ type: "BLOCK", code: htmlContent.trim() });
  }

  return sectionItems;
};
