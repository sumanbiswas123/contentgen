/**
 * Utility functions for producing 100% email-compliant, table-based HTML with inline styles.
 */

export interface StyleObject {
  [key: string]: string | number | undefined;
}

/**
 * Converts a style object into an inline CSS string.
 */
export function objectToInlineCss(styles: StyleObject): string {
  return Object.entries(styles)
    .filter(([_, val]) => val !== undefined && val !== null && val !== "")
    .map(([key, val]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}:${val}`;
    })
    .join("; ");
}

/**
 * Normalizes element or raw HTML block into clean table cell content with inline CSS.
 */
export function wrapInEmailTable(
  contentHtml: string,
  options: {
    width?: string;
    bgColor?: string;
    padding?: string;
    align?: "left" | "center" | "right";
  } = {}
): string {
  const { width = "100%", bgColor = "transparent", padding = "0", align = "center" } = options;

  const tableStyles = objectToInlineCss({
    width,
    "border-collapse": "collapse",
    "mso-table-lspace": "0pt",
    "mso-table-rspace": "0pt",
    "background-color": bgColor,
    margin: "0 auto",
  });

  const tdStyles = objectToInlineCss({
    padding,
    "text-align": align,
    "vertical-align": "top",
  });

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${width}" align="${align}" style="${tableStyles}">
  <tr>
    <td align="${align}" valign="top" style="${tdStyles}">
      ${contentHtml}
    </td>
  </tr>
</table>`;
}

/**
 * Ensures clean inline HTML email markup output.
 */
export function cleanEmailHtmlOutput(rawHtml: string): string {
  if (!rawHtml) return "";

  // Remove any leftover temporary editor attributes or contenteditable flags
  let cleaned = rawHtml
    .replace(/\scontenteditable=["'](true|false)["']/gi, "")
    .replace(/\sdata-interaction-mode=["'][^"']*["']/gi, "")
    .replace(/\s(id|class)=["']nx-[^"']*["']/gi, "");

  return cleaned.trim();
}
