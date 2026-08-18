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
import { ASTSection, ASTColumn, ASTComponent, CanvasAST } from "../types/canvasTree";

export function generateASTId(prefix: string = "el"): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function createASTSection(cols: number = 1): ASTSection {
  const columns: ASTColumn[] = [];
  const equalWidth = Math.round((100 / cols) * 100) / 100;
  for (let c = 0; c < cols; c++) {
    columns.push({
      id: generateASTId("col"),
      widthPercent: equalWidth,
      components: [],
    });
  }
  return {
    id: generateASTId("sec"),
    rows: 1,
    cols: cols,
    isResponsive: false,
    columns,
  };
}

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
        ? `display: inline-block; width: 100%; max-width: ${widthPct}%; vertical-align: top; box-sizing: border-box; padding: ${padding}; background-color: ${bgColor}; min-height: 80px;`
        : `width: ${widthPct}%; vertical-align: top; padding: ${padding}; background-color: ${bgColor}; min-height: 80px;`;

      const cellContent = innerContent.trim().length > 0 
        ? innerContent 
        : `&nbsp;`;

      cellTds.push(`<td class="grid-cell" data-row-index="${r}" data-col-index="${c}" data-cell-index="${cellIdx}" style="${cellStyle}" valign="top">
  ${cellContent}
</td>`);
    }

    rowsHtml.push(`<tr class="child-row" style="height: auto;">
  ${cellTds.join("\n")}
</tr>`);
  }

  const responsiveClass = isResponsive ? "responsive-grid-row" : "fixed-grid-row";
  const paddingTop = opts.positionOptions?.isFirst ? "20px" : "0px";
  const paddingBottom = opts.positionOptions?.isLast ? "20px" : "0px";

  return `<tr class="draggable-row parent-block ${responsiveClass}" data-rows="${rowsCount}" data-cols="${colsCount}" data-is-responsive="${isResponsive ? "true" : "false"}">
  <td align="center" valign="top" style="padding-top: ${paddingTop}; padding-bottom: ${paddingBottom}; padding-left: 0px; padding-right: 0px; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="${contentWidth}" align="center" role="presentation" style="width: ${contentWidth}px; max-width: ${contentWidth}px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff;">
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
    description: "Responsive email header/banner image",
    generateHtml: () => `<table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="width: 100%; border-collapse: collapse;">
  <tbody>
    <tr>
      <td class="hero_image" align="center" valign="middle" style="font-size: 0px; padding: 10px 0;">
        <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80" alt="Featured Email Banner" width="660" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0; outline: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);" />
      </td>
    </tr>
  </tbody>
</table>`
  },

  "TEXT": {
    id: "TEXT",
    name: "Rich Text",
    category: "component",
    description: "Editable text block",
    generateHtml: () => `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; margin: 0 auto; border-collapse: collapse;">
  <tbody>
    <tr>
      <td align="left" valign="top" style="padding: 12px 16px;">
        <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #334155; line-height: 1.5;">
          write text here
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
    description: "MSO-friendly interactive CTA button",
    generateHtml: () => `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; margin: 0 auto; border-collapse: collapse;">
  <tbody>
    <tr>
      <td align="center" valign="middle" style="padding: 20px 0;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://gsk.com" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="20%" stroke="f" fillcolor="#0284c7">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Explore Now &rarr;</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="https://gsk.com" target="_blank" style="background-color: #0284c7; color: #ffffff; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 700; line-height: 48px; text-align: center; text-decoration: none; width: 200px; border-radius: 10px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3); transition: background-color 0.2s ease;">
          Explore Now &rarr;
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
    description: "Video thumbnail with play overlay link",
    generateHtml: () => `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; margin: 0 auto; border-collapse: collapse;">
  <tbody>
    <tr>
      <td align="center" valign="middle" style="padding: 14px 0;">
        <a href="https://www.youtube.com" target="_blank" style="text-decoration: none; display: block; position: relative;">
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" alt="Watch Video Presentation" width="660" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);" />
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
    description: "Styled horizontal rule divider",
    generateHtml: () => `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; margin: 16px 0; border-collapse: collapse;">
  <tbody>
    <tr>
      <td align="center" valign="middle" style="padding: 0 20px;">
        <div style="border-top: 1px solid #e2e8f0; width: 100%; height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</div>
      </td>
    </tr>
  </tbody>
</table>`
  }
};

