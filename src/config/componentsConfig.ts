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
  }, //creating new entry header
  "HEADER": {
    id: "HEADER",
    name: "Header Component",
    category: "component",
    description: "Responsive email header image and title",
    generateHtml: () => `<tr>
        <td align="left" class="gskheaderbox" valign="middle" bgcolor="#FFFFFF" style="padding: 20px 20px 20px 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" class="container" role="presentation">
        <tbody>
        <tr>
          <td class="col-100" width="100" align="left" valign="top"><a href="https://gskpro.com/fr-dz/" target="_blank"><img src="https://placehold.co/100" width="100" height="" alt="GSK_logo" style="display:inline-block; border:none;color: #151515 !important;font-size: 12px;line-height: 30px;font-style: italic;font-weight: normal;"></a></td>
          <td class="col-100" width="24" align="center" valign="top">&nbsp;</td>
        <td class="col-100" align="left" valign="middle" style="font-family: Arial; font-size: 18px; line-height: 22px; color: #151515; font-weight: bold;">Pour les professionnels de santé exerçant en Algérie</td>
        </tr>
        
        </tbody>
        </table></td>
        </tr>`
  },
  "SURVEY": {
    id: "SURVEY",
    name: "SURVEY Component",
    category: "component",
    description: "Responsive email SURVEY",
    generateHtml: () => `<tr>
                <td class="setPadding wrapper" data-test="survey-test" align="left" valign="top" bgcolor="#ffffff" style="padding-left:20px;padding-right:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
                    <tbody>
                      <tr>
                        <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td class="wrapper" align="left" valign="top" bgcolor="#ffffff">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
                            <tbody>
                              <tr>
                                <td align="center" valign="top" style="color:#151515; font-family: Arial; font-size:18px; line-height:20px;" colspan="9"><strong>Dans quelle mesure êtes-vous satisfait(e) de cet e-mail ?
                                    relevant</strong></td>
                              </tr>
                              <tr>
                                <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
                              </tr>
                              <tr>
                                <td class="col-100" valign="top">
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
                                    <tbody>
                                      <tr>
                                        <td width="98" align="center" valign="top"><a href="https://gsk.qualtrics.com/jfe/form/SV_8jBXbvdpv4zkrvo?ENG_2_Embedded=1&amp;ER5=Y&amp;ER6=Y&amp;Cust_1=Y&amp;Foot=N&amp;NOP=1&amp;Brand=ZEJULA&amp;Channel=1:1Email&amp;Country=Algeria&amp;ContentLab_Id=PM-DZ-NRP-EML-260007&amp;Group=Commercial&amp;Region=EM&amp;Speciality=Oncology&amp;Therapy_Area=Oncology&amp;MDM_ID={{Account.CORE_GSK_MDM_ID__c}}&amp;Veeva_ID={{Account.CORE_GSK_Account_Veeva_ID__c}}&amp;EM_NA=Septembre_Tuquoise&amp;Q_Language=FR&amp;token=AAE3272&amp;Qtest=Yes" target="_blank" style="display: inline-block; border: none;color:#151515;border: none;"><img src="https://placehold.co/85" width="85" height="" alt="Very Dissatisfied" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"><br>
                                            <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">
                                              Très insatisfait</font>
                                          </a></td>
                                        <td width="5" align="left" valign="top">&nbsp;</td>
                                        <td width="90" align="center" valign="top"><a href="https://gsk.qualtrics.com/jfe/form/SV_8jBXbvdpv4zkrvo?ENG_2_Embedded=2&amp;ER5=Y&amp;ER6=Y&amp;Cust_1=Y&amp;Foot=N&amp;NOP=1&amp;Brand=ZEJULA&amp;Channel=1:1Email&amp;Country=Algeria&amp;ContentLab_Id=PM-DZ-NRP-EML-260007&amp;Group=Commercial&amp;Region=EM&amp;Speciality=Oncology&amp;Therapy_Area=Oncology&amp;MDM_ID={{Account.CORE_GSK_MDM_ID__c}}&amp;Veeva_ID={{Account.CORE_GSK_Account_Veeva_ID__c}}&amp;EM_NA=Septembre_Tuquoise&amp;Q_Language=FR&amp;token=AAE3272&amp;Qtest=Yes" target="_blank" style="display: inline-block; border: none;color: #151515;border: none;"><img src="https://placehold.co/85" width="85" height="" alt="Dissatisfied" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"><br>
                                            <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">
                                            Insatisfait</font>
                                          </a></td>
                                        <td width="5" align="left" valign="top">&nbsp;</td>
                                        <td width="90" align="center" valign="top"><a href="https://gsk.qualtrics.com/jfe/form/SV_8jBXbvdpv4zkrvo?ENG_2_Embedded=3&amp;ER5=Y&amp;ER6=Y&amp;Cust_1=Y&amp;Foot=N&amp;NOP=1&amp;Brand=ZEJULA&amp;Channel=1:1Email&amp;Country=Algeria&amp;ContentLab_Id=PM-DZ-NRP-EML-260007&amp;Group=Commercial&amp;Region=EM&amp;Speciality=Oncology&amp;Therapy_Area=Oncology&amp;MDM_ID={{Account.CORE_GSK_MDM_ID__c}}&amp;Veeva_ID={{Account.CORE_GSK_Account_Veeva_ID__c}}&amp;EM_NA=Septembre_Tuquoise&amp;Q_Language=FR&amp;token=AAE3272&amp;Qtest=Yes" target="_blank" style="display: inline-block; border: none;color: #151515;border: none;"><img src="https://placehold.co/85" width="85" height="" alt="Neutral" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"><br>
                                            <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">
                                              Neutre</font>
                                          </a></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                                <td class="col-100" width="5" align="left" valign="middle">&nbsp;</td>
                                <td class="col-100" valign="top">
                                  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
                                    <tbody>
                                      <tr>
                                        <td width="90" align="center" valign="top"><a href="https://gsk.qualtrics.com/jfe/form/SV_8jBXbvdpv4zkrvo?ENG_2_Embedded=4&amp;ER5=Y&amp;ER6=Y&amp;Cust_1=Y&amp;Foot=N&amp;NOP=1&amp;Brand=ZEJULA&amp;Channel=1:1Email&amp;Country=Algeria&amp;ContentLab_Id=PM-DZ-NRP-EML-260007&amp;Group=Commercial&amp;Region=EM&amp;Speciality=Oncology&amp;Therapy_Area=Oncology&amp;MDM_ID={{Account.CORE_GSK_MDM_ID__c}}&amp;Veeva_ID={{Account.CORE_GSK_Account_Veeva_ID__c}}&amp;EM_NA=Septembre_Tuquoise&amp;Q_Language=FR&amp;token=AAE3272&amp;Qtest=Yes" target="_blank" style="display: inline-block; border: none;color: #151515;border: none;"><img src="https://placehold.co/85" width="85" height="" alt="Satisfied" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"><br>
                                            <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">
                                              Satisfait</font>
                                          </a></td>
                                        <td width="5" align="left" valign="top">&nbsp;</td>
                                        <td width="90" align="center" valign="top"><a href="https://gsk.qualtrics.com/jfe/form/SV_8jBXbvdpv4zkrvo?ENG_2_Embedded=5&amp;ER5=Y&amp;ER6=Y&amp;Cust_1=Y&amp;Foot=N&amp;NOP=1&amp;Brand=ZEJULA&amp;Channel=1:1Email&amp;Country=Algeria&amp;ContentLab_Id=PM-DZ-NRP-EML-260007&amp;Group=Commercial&amp;Region=EM&amp;Speciality=Oncology&amp;Therapy_Area=Oncology&amp;MDM_ID={{Account.CORE_GSK_MDM_ID__c}}&amp;Veeva_ID={{Account.CORE_GSK_Account_Veeva_ID__c}}&amp;EM_NA=Septembre_Tuquoise&amp;Q_Language=FR&amp;token=AAE3272&amp;Qtest=Yes" target="_blank" style="display: inline-block; border: none;color: #151515;border: none;"><img src="https://placehold.co/85" width="85" height="" alt="Very Satisfied" style="display: inline-block; border: none;font-size: 12px;line-height: 20px;color: #151515;font-style: italic;"><br>
                                            <font style="font-size: 14px;line-height: 20px;color: #151515;font-weight: bold;text-decoration: underline;">
                                              Très satisfait</font>
                                          </a></td>
                                      </tr>
                                    </tbody>
                                  </table>

                                </td>








                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td height="20" style="font-size: 1px; background-color:#ffffff;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>`
  },
  "DOCUMENT": {
    id: "DOCUMENT",
    name: "DOCUMENT Component",
    category: "component",
    description: "Responsive email header image and title",
    generateHtml: () => `<tr>
    <td align="center" valign="top" style="background-color: #f0efed">
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
    <tbody><tr>
    <td height="10" style="font-size: 1px; line-height: 1px">
    &nbsp;
    </td>
    </tr>
    <tr>
    <td class="setPadding" align="center" valign="top" style="padding: 0px 20px">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody>
        <tr>
        <td height="16" align="center" valign="middle" style="
            font-family: Arial;
            font-size: 12px;
            font-weight: normal;
            color: #151515;
            line-height: 16px;
            text-align: left;
            ">
            PM-DZ-NRP-EML-260007 | Août 2026
        </td>
        </tr>
    </tbody>
    </table>
    </td>
    </tr>
    <tr>
    <td height="10" style="font-size: 1px; line-height: 1px">
    &nbsp;
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>`
  },
  "SIGNATURE": {
    id: "SIGNATURE",
    name: "SIGNATURE Component",
    category: "component",
    description: "Responsive email SIGNATURE",
    generateHtml: () => `<tr>

    <td align="center" valign="top" bgcolor="#E6E6E6" style="background-color:#E6E6E6;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tbody>
          <tr>
            <td class="setPadding" align="left" valign="top" style="padding:0px 20px;"><table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tbody>
                  <tr>
                    <td align="left" valign="top" style="font-size:1px;"><img src="https://cdnae1.vod309.com/c87c97d2-53d8-4bb6-bf26-c2dcb22973df/0000000/000003/354/219/0/10/assetFiles/images/assets/down.jpg" width="45" title="title_text" alt="down arrow" aria-hidden="true" style="display:inline-block; border:none;color: #151515;font-size: 12px;line-height: 18px;font-style: italic;font-weight: normal;"></td>
                  </tr>
                  <tr>
                    <td height="5" style="font-size:1px; line-height:1px;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td align="left" data-test="footer-signature-usernName" valign="top" style="color:#f36633; font-family: Arial; font-weight: bold; font-size:16px; line-height:22px;"> {{userName}} </td>
                  </tr>
                  <tr>
                    <td align="left" valign="top" data-test="footer-signature-title" style="color:#151515; font-family: Arial; font-size:14px; font-weight:bold; line-height:20px;"> {{User.Title}} </td>
                  </tr>
                  <tr>
                    <td align="left" valign="top" data-test="footer-signature-mobAndEmail" style="color:#151515; font-family: Arial; font-size:14px; line-height:20px;"><b>Tel</b> {{User.MobilePhone}} &nbsp;<b>Email</b> <a class="email" style="color:#151515; font-family: Arial; font-size:14px;line-height:20px; text-decoration:none;" target="new" href="mailto:{{User.Email}}">{{User.Email}}</a></td>
                  </tr>
                  <tr>
                    <td height="15" style="font-size:1px; line-height:1px;">&nbsp;</td>
                  </tr>
                </tbody>
              </table></td>
          </tr>
        </tbody>
      </table></td>
  </tr>`
  },
  "REFERENCES": {
    id: "REFERENCES",
    name: "REFERENCES Component",
    category: "component",
    description: "Responsive email REFERENCES",
    generateHtml: () => `
    <tr>
    <td class="setPadding" align="center" valign="top" style="padding: 0px 20px" bgcolor="#ffffff">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tbody> 

    <tr>
      <td width="22" align="center" valign="top" style="
        font-family: Arial;
        font-size: 14px;
        font-weight: bold;
        color: #151515;
        line-height: 20px;
        text-align: left;
      ">&bull;
      </td>
      <td align="center" valign="top" style="
        font-family: Arial;
        font-size: 14px;
        font-weight: normal;
        color: #151515;
        line-height: 20px;
        text-align: left;
      ">one
      </td>
    </tr> </tbody>
    </table>
    </td>
    </tr>`
  }




};










