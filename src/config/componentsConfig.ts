/**
 * Declarative Component Registry for Email Grid & Atomic Components
 * Dynamic Grid System: Unified 'BLOCK' parent row with auto-dividing child columns
 * Strict Email Table Standards: <table>, <tr>, <td> only, 100% inline CSS
 */

export interface EmailComponentItem {
  id: string;
  name: string;
  category: "layout" | "component";
  description: string;
  generateHtml: (params?: DynamicBlockParams | { childContents?: string[]; isResponsive?: boolean; positionOptions?: { isFirst?: boolean; isLast?: boolean } }) => string;
}

import gskSanitizer from "./sanitizers/gsk.json";
import jnjSanitizer from "./sanitizers/jnj.json";

function getActiveSanitizer() {
  try {
    const company = (localStorage.getItem("active_company") || "GSK").toUpperCase();
    if (company.includes("JNJ") || company.includes("J&J") || company.includes("JOHNSON")) {
      return jnjSanitizer;
    }
  } catch (e) {}
  return gskSanitizer;
}

export interface DynamicBlockParams {
  childCount?: number;
  childContents?: string[];
  columnWidths?: number[]; // percentages e.g. [50, 50] or [33.33, 33.33, 33.34]
  rowsCount?: number;
  colsCount?: number;
  isResponsive?: boolean;
  positionOptions?: { isFirst?: boolean; isLast?: boolean };
  cellPaddings?: string[]; // e.g. ["0px", "10px"]
  cellBgColors?: string[]; // e.g. ["#ffffff", "#f8fafc"]
}

export const generateDynamicBlockHtml = (
  params?: DynamicBlockParams | number,
  legacyContents: string[] = [],
  legacyIsResponsive: boolean = false,
  legacyPositionOptions?: { isFirst?: boolean; isLast?: boolean }
): string => {
  let opts: DynamicBlockParams = {};
  if (typeof params === "number") {
    opts = {
      childCount: params,
      childContents: legacyContents,
      isResponsive: legacyIsResponsive,
      positionOptions: legacyPositionOptions,
    };
  } else if (params) {
    opts = params;
  }

  const sanitizer = getActiveSanitizer();
  const contentWidth = sanitizer.wrapperTable.contentWidth || "660";
  const defaultHeight = sanitizer.wrapperTable.defaultBlockHeight || "600";

  const rowsCount = opts.rowsCount && opts.rowsCount > 0 ? opts.rowsCount : 1;
  const colsCount = opts.colsCount && opts.colsCount > 0
    ? opts.colsCount
    : Math.max(1, opts.childCount || opts.childContents?.length || 1);

  const totalCells = rowsCount * colsCount;
  const childContents = opts.childContents || [];
  const isResponsive = !!opts.isResponsive;

  // Compute column widths array
  let colWidths: number[] = [];
  if (opts.columnWidths && opts.columnWidths.length === colsCount) {
    colWidths = opts.columnWidths;
  } else {
    const equalWidth = Math.round((100 / colsCount) * 100) / 100;
    colWidths = Array.from({ length: colsCount }).map(() => equalWidth);
  }

  const rowsHtml: string[] = [];

  for (let r = 0; r < rowsCount; r++) {
    const cellTds: string[] = [];
    for (let c = 0; c < colsCount; c++) {
      const cellIdx = r * colsCount + c;
      const innerContent = childContents[cellIdx] || "";
      const widthPct = colWidths[c] || Math.round((100 / colsCount) * 100) / 100;
      const padding = opts.cellPaddings?.[cellIdx] || "0px";
      const bgColor = opts.cellBgColors?.[cellIdx] || "transparent";

      const cellStyle = isResponsive
        ? `display: inline-block; width: 100%; max-width: ${widthPct}%; vertical-align: top; box-sizing: border-box; padding: ${padding}; background-color: ${bgColor}; min-height: ${defaultHeight}px;`
        : `width: ${widthPct}%; vertical-align: top; padding: ${padding}; background-color: ${bgColor}; min-height: ${defaultHeight}px;`;

      const cellContent = innerContent.trim().length > 0 
        ? innerContent 
        : `&nbsp;`;

      cellTds.push(`<td class="grid-cell" data-row-index="${r}" data-col-index="${c}" data-cell-index="${cellIdx}" style="${cellStyle}" valign="top">
  ${cellContent}
</td>`);
    }

    rowsHtml.push(`<tr class="child-row" style="height: ${rowsCount > 1 ? "auto" : defaultHeight + "px"};">
  ${cellTds.join("\n")}
</tr>`);
  }

  const responsiveClass = isResponsive ? "responsive-grid-row" : "fixed-grid-row";
  const paddingTop = opts.positionOptions?.isFirst ? "20px" : "0px";
  const paddingBottom = opts.positionOptions?.isLast ? "20px" : "0px";

  return `<tr class="parent-block ${responsiveClass}" data-rows="${rowsCount}" data-cols="${colsCount}" data-is-responsive="${isResponsive ? "true" : "false"}">
  <td align="center" valign="top" style="padding-top: ${paddingTop}; padding-bottom: ${paddingBottom}; padding-left: 0px; padding-right: 0px; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="${contentWidth}" height="${defaultHeight}" align="center" role="presentation" style="width: ${contentWidth}px; max-width: ${contentWidth}px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff;">
      <tbody>
        ${rowsHtml.join("\n")}
      </tbody>
    </table>
  </td>
</tr>`.trim();
};

export const EMAIL_COMPONENTS_CONFIG: Record<string, EmailComponentItem> = {
  "BLOCK": {
    id: "BLOCK",
    name: "Block (Parent Section)",
    category: "layout",
    description: "Full width parent section with auto-dividing child columns",
    generateHtml: (params) => generateDynamicBlockHtml(params as any)
  },

  "IMAGE": {
    id: "IMAGE",
    name: "Image Component",
    category: "component",
    description: "Responsive <img> wrapped in table",
    generateHtml: () => `<table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="width: 100%; border-collapse: collapse;">
  <tbody>
    <tr>
      <td class="hero_image" align="center" valign="middle" style="font-size: 0%; padding: 0px;">
        <img src="https://via.placeholder.com/560x280/0284c7/ffffff?text=Email+Header+Image" alt="Email Image" width="660" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0; outline: none; border-radius: 8px;" />
      </td>
    </tr>
  </tbody>
</table>`
  },

  "TEXT": {
    id: "TEXT",
    name: "Paragraph",
    category: "component",
    description: "Editable text paragraph block",
    generateHtml: () => `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; margin: 0 auto; border-collapse: collapse;">
  <tbody>
    <tr>
      <td align="left" valign="top" style="padding: 12px 16px;">
        <h3 style="margin: 0 0 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.3;">
          Sample Responsive Title
        </h3>
        <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #475569; line-height: 1.6;">
          This paragraph component uses pure inline styles and standard table structure compatible with Outlook, Apple Mail, and Gmail.
        </p>
      </td>
    </tr>
  </tbody>
</table>`
  },

  "CTA": {
    id: "CTA",
    name: "Button / CTA",
    category: "component",
    description: "MSO-friendly CTA button",
    generateHtml: () => `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; margin: 0 auto; border-collapse: collapse;">
  <tbody>
    <tr>
      <td align="center" valign="middle" style="padding: 16px 0;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://example.com" style="height:44px;v-text-anchor:middle;width:180px;" arcsize="18%" stroke="f" fillcolor="#0284c7">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Call To Action</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="https://example.com" target="_blank" style="background-color: #0284c7; color: #ffffff; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 700; line-height: 44px; text-align: center; text-decoration: none; width: 180px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);">
          Call To Action
        </a>
        <!--<![endif]-->
      </td>
    </tr>
  </tbody>
</table>`
  },

  "VIDEO": {
    id: "VIDEO",
    name: "Video Card",
    category: "component",
    description: "Video preview thumbnail link",
    generateHtml: () => `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; margin: 0 auto; border-collapse: collapse;">
  <tbody>
    <tr>
      <td align="center" valign="middle" style="padding: 10px 0;">
        <a href="https://www.youtube.com" target="_blank" style="text-decoration: none; display: block;">
          <img src="https://via.placeholder.com/560x315/0f172a/ffffff?text=%E2%96%B6+Play+Video+Preview" alt="Watch Video" width="560" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0; border-radius: 8px;" />
        </a>
      </td>
    </tr>
  </tbody>
</table>`
  },

  "DIVIDER": {
    id: "DIVIDER",
    name: "Divider / Line",
    category: "component",
    description: "Horizontal border line",
    generateHtml: () => `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="border-top: 1px solid #e2e8f0; width: 100%; margin: 12px 0;">
  <tbody><tr><td></td></tr></tbody>
</table>`
  }
};
