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
  generateHtml: (params?: { childContents?: string[]; isResponsive?: boolean }) => string;
}

export const generateDynamicBlockHtml = (
  childCount: number = 0,
  childContents: string[] = [],
  isResponsive: boolean = false
): string => {
  const count = Math.max(1, childCount || 1);
  const widthPct = Math.round((100 / count) * 100) / 100;

  const cellTds = Array.from({ length: count }).map((_, idx) => {
    const innerContent = childContents[idx] || `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; border-collapse: collapse; border: 1px dashed #cbd5e1; border-radius: 6px; background-color: #f8fafc;">
  <tbody>
    <tr>
      <td align="center" valign="middle" style="padding: 24px 12px; text-align: center;">
        <p style="margin: 0; font-family: Arial, sans-serif; font-size: 13px; color: #64748b; font-weight: 600;">
          Child Block ${idx + 1} (${widthPct}%)
        </p>
        <span style="font-family: Arial, sans-serif; font-size: 11px; color: #94a3b8;">Drag element here</span>
      </td>
    </tr>
  </tbody>
</table>`;

    const cellStyle = isResponsive
      ? `display: inline-block; width: 100%; max-width: ${widthPct}%; vertical-align: top; box-sizing: border-box; padding: 8px;`
      : `width: ${widthPct}%; vertical-align: top; padding: 8px;`;

    return `<td class="grid-cell" data-col-index="${idx}" style="${cellStyle}" valign="top">
  ${innerContent}
</td>`;
  }).join("\n");

  const responsiveClass = isResponsive ? "responsive-grid-row" : "fixed-grid-row";

  return `<tr class="parent-block ${responsiveClass}" data-is-responsive="${isResponsive ? "true" : "false"}">
  <td align="center" valign="top" style="padding: 10px 0; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff;">
      <tbody>
        <tr class="child-row">
          ${cellTds}
        </tr>
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
    generateHtml: (params) => generateDynamicBlockHtml(
      params?.childContents?.length || 1,
      params?.childContents || [],
      params?.isResponsive || false
    )
  },

  "IMAGE": {
    id: "IMAGE",
    name: "Image Component",
    category: "component",
    description: "Responsive <img> wrapped in table",
    generateHtml: () => `<tr class="element-row">
  <td align="center" valign="top" style="padding: 6px 0; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
      <tbody>
        <tr>
          <td align="center" valign="middle" style="padding: 10px 0;">
            <img src="https://via.placeholder.com/560x280/0284c7/ffffff?text=Email+Header+Image" alt="Email Image" width="560" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0; outline: none; border-radius: 8px;" />
          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>`
  },

  "TEXT": {
    id: "TEXT",
    name: "Paragraph",
    category: "component",
    description: "Editable text paragraph block",
    generateHtml: () => `<tr class="element-row">
  <td align="center" valign="top" style="padding: 6px 0; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
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
    </table>
  </td>
</tr>`
  },

  "CTA": {
    id: "CTA",
    name: "Button / CTA",
    category: "component",
    description: "MSO-friendly CTA button",
    generateHtml: () => `<tr class="element-row">
  <td align="center" valign="top" style="padding: 6px 0; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
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
    </table>
  </td>
</tr>`
  },

  "VIDEO": {
    id: "VIDEO",
    name: "Video Card",
    category: "component",
    description: "Video preview thumbnail link",
    generateHtml: () => `<tr class="element-row">
  <td align="center" valign="top" style="padding: 6px 0; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
      <tbody>
        <tr>
          <td align="center" valign="middle" style="padding: 10px 0;">
            <a href="https://www.youtube.com" target="_blank" style="text-decoration: none; display: block;">
              <img src="https://via.placeholder.com/560x315/0f172a/ffffff?text=%E2%96%B6+Play+Video+Preview" alt="Watch Video" width="560" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0; border-radius: 8px;" />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>`
  },

  "DIVIDER": {
    id: "DIVIDER",
    name: "Divider / Line",
    category: "component",
    description: "Horizontal border line",
    generateHtml: () => `<tr class="element-row">
  <td align="center" valign="top" style="padding: 6px 0; width: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
      <tbody>
        <tr>
          <td align="center" valign="middle" style="padding: 16px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="border-top: 1px solid #e2e8f0; width: 100%;">
              <tbody><tr><td></td></tr></tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>`
  }
};
