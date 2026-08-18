/**
 * Canonical AST Data Model for ContentGen Email Builder
 * Provides deterministic, flicker-free, ID-based hierarchy
 */

export type ASTComponentType =
  | 'IMAGE'
  | 'TEXT'
  | 'CTA'
  | 'DIVIDER'
  | 'SPACING'
  | 'HERO'
  | 'CUSTOM_HTML';

export interface ASTComponentStyles {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  textTransform?: string;
  lineHeight?: string;
  letterSpacing?: string;
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
  borderWidth?: number | string;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: number | string;
  width?: string | number;
  height?: string | number;
  opacity?: number | string;
  [key: string]: any;
}

export interface ASTComponent {
  id: string;
  type: ASTComponentType;
  content?: string;
  src?: string;
  alt?: string;
  href?: string;
  target?: '_blank' | '_self';
  styles: ASTComponentStyles;
  meta?: Record<string, any>;
}

export interface ASTColumn {
  id: string;
  widthPercent: number;
  components: ASTComponent[];
  childrenColumns?: ASTColumn[];
  styles?: ASTComponentStyles;
}

export interface ASTSection {
  id: string;
  rows: number;
  cols: number;
  isResponsive: boolean;
  columns: ASTColumn[];
  styles?: ASTComponentStyles;
}

export interface CanvasAST {
  sections: ASTSection[];
  headerHtml?: string;
  footerHtml?: string;
  preheaderText?: string;
  subjectLine?: string;
}
