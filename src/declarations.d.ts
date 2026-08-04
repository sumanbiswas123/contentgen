// Global type declarations for assets and modules
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.css" {
  const content: string;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}
declare module "*.jpg" {
  const content: string;
  export default content;
}
declare module "*.jpeg" {
  const content: string;
  export default content;
}
declare module "*.gif" {
  const content: string;
  export default content;
}
declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.ico" {
  const content: string;
  export default content;
}
declare module "*.webp" {
  const content: string;
  export default content;
}
declare module "web-vitals" {
  export function getCLS(onPerfEntry?: any): void;
  export function getFID(onPerfEntry?: any): void;
  export function getFCP(onPerfEntry?: any): void;
  export function getLCP(onPerfEntry?: any): void;
  export function getTTFB(onPerfEntry?: any): void;
}declare module "*?raw" {
  const content: string;
  export default content;
}
