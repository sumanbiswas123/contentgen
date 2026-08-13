import { EmailDocumentAST, SectionNode, ColumnNode, ElementNode } from "../types/schema";

export function generateId(prefix: string = "node"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createDefaultAST(sections?: SectionNode[]): EmailDocumentAST {
  return {
    version: "2.0",
    meta: {
      title: "ContentGen Email",
      containerWidth: 660,
      backgroundColor: "#ffffff"
    },
    sections: sections || []
  };
}

export function compileAstToEmailHtml(ast: EmailDocumentAST): string {
  const containerWidth = ast.meta.containerWidth || 660;

  const sectionsHtml = ast.sections.map((section, sIdx) => {
    const rowsHtml = section.rows.map((row, rIdx) => {
      const colsCount = row.columns.length;
      const colsHtml = row.columns.map((col, cIdx) => {
        const widthPct = col.widthPct || Math.round(100 / colsCount * 100) / 100;
        const cellStyle = section.isResponsive
          ? `display: inline-block; width: 100%; max-width: ${widthPct}%; vertical-align: top; box-sizing: border-box; background-color: #ffffff;`
          : `width: ${widthPct}%; vertical-align: top; background-color: #ffffff;`;

        const elementsHtml = col.elements.map(el => {
          if (el.type === "TEXT") {
            return el.content || "";
          } else if (el.type === "IMAGE") {
            return `<img src="${el.src || 'assets/trans.png'}" alt="${el.alt || ''}" style="display:block; width:100%; max-width:100%; height:auto; border:0;" />`;
          } else if (el.type === "BUTTON") {
            return `<a href="${el.href || '#'}" style="display:inline-block; background:#0284c7; color:#ffffff; padding:10px 20px; text-decoration:none; border-radius:4px; font-weight:bold;">${el.content || 'Click Here'}</a>`;
          } else if (el.type === "CUSTOM_HTML") {
            return el.content || "";
          }
          return el.content || "&nbsp;";
        }).join("\n");

        return `<td class="grid-cell" data-row-index="${rIdx}" data-col-index="${cIdx}" style="${cellStyle}" valign="top">
  ${elementsHtml || "&nbsp;"}
</td>`;
      }).join("\n");

      return `<tr class="child-row">
  ${colsHtml}
</tr>`;
    }).join("\n");

    const responsiveClass = section.isResponsive ? "responsive-grid-row" : "fixed-grid-row";

    return `<tr class="draggable-row parent-block ${responsiveClass}" data-id="${sIdx + 1}" data-is-responsive="${section.isResponsive ? "true" : "false"}" id="row${sIdx}">
  <td align="center" valign="top" style="padding: 0px; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="${containerWidth}" align="center" role="presentation" style="width: ${containerWidth}px; max-width: ${containerWidth}px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff;">
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </td>
</tr>`;
  }).join("\n");

  return `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" id="sortable-root" style="border-radius: 19px; overflow: hidden; height: 100%; min-height: 100vh; background-color: #ffffff;">
  <tbody id="sortable-body">
    ${sectionsHtml}
  </tbody>
</table>`;
}

export function parseLegacyHtmlToAst(htmlStr: string): EmailDocumentAST {
  if (!htmlStr || !htmlStr.trim()) {
    return createDefaultAST();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlStr, "text/html");
  const sortableBody = doc.getElementById("sortable-body") || doc.querySelector("tbody");

  if (!sortableBody) {
    return createDefaultAST();
  }

  // Strip helper drop box elements before parsing
  sortableBody.querySelectorAll(".bento-permanent-add-section-bar, .bento-permanent-add-section-row, .bento-child-drop-box, .bento-child-drop-row, .bento-parent-block-drop-row, .bento-parent-block-drop-box").forEach(el => el.remove());

  const sectionRows = Array.from(sortableBody.children).filter(
    el => el.classList.contains("draggable-row") || el.tagName.toLowerCase() === "tr"
  );

  const sections: SectionNode[] = sectionRows.map(rowEl => {
    const isResponsive = rowEl.getAttribute("data-is-responsive") === "true";
    const cells = Array.from(rowEl.querySelectorAll("td.grid-cell"));

    let columns: ColumnNode[] = [];
    if (cells.length > 0) {
      const colsCount = cells.length;
      const defaultWidthPct = Math.round(100 / colsCount * 100) / 100;

      columns = cells.map((cellEl, colIdx) => {
        let widthPct = defaultWidthPct;
        const styleWidth = (cellEl as HTMLElement).style.width;
        if (styleWidth && styleWidth.includes("%")) {
          const parsed = parseFloat(styleWidth);
          if (!isNaN(parsed) && parsed > 0) widthPct = parsed;
        }

        const innerHtml = cellEl.innerHTML.trim();
        const elements: ElementNode[] = [
          {
            id: generateId("el"),
            type: innerHtml && innerHtml !== "&nbsp;" ? "CUSTOM_HTML" : "EMPTY",
            content: innerHtml
          }
        ];

        return {
          id: generateId("col"),
          widthPct,
          elements
        };
      });
    } else {
      columns = [
        {
          id: generateId("col"),
          widthPct: 100,
          elements: [
            {
              id: generateId("el"),
              type: "CUSTOM_HTML",
              content: rowEl.innerHTML.trim()
            }
          ]
        }
      ];
    }

    return {
      id: generateId("sec"),
      type: "BLOCK",
      isResponsive,
      rows: [
        {
          id: generateId("row"),
          columns
        }
      ]
    };
  });

  return createDefaultAST(sections);
}
