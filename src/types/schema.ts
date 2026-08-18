export type ElementType = "TEXT" | "IMAGE" | "BUTTON" | "DIVIDER" | "CUSTOM_HTML" | "EMPTY";

export interface ElementNode {
  id: string;
  type: ElementType;
  tagName?: string;
  content?: string;
  src?: string;
  href?: string;
  alt?: string;
  attributes?: Record<string, string>;
  style?: Record<string, string>;
}

export interface ColumnNode {
  id: string;
  widthPct: number;
  style?: Record<string, string>;
  elements: ElementNode[];
}

export interface RowNode {
  id: string;
  columns: ColumnNode[];
}

export interface SectionNode {
  id: string;
  type: "BLOCK";
  rows: RowNode[];
  isResponsive: boolean;
  style?: Record<string, string>;
}

export interface EmailDocumentAST {
  version: "2.0";
  meta: {
    title: string;
    containerWidth: number;
    backgroundColor: string;
  };
  sections: SectionNode[];
}
