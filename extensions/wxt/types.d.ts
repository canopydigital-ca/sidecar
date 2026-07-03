/// <reference types="chrome" />

declare const __FEATURE_PQ__: boolean;
declare const __FEATURE_PETS__: boolean;
declare const __BUILD_MODE__: string;
declare const __DEV__: boolean;

declare global {
  interface Window {
    __dockDebug?: {
      desiredCount: number;
      order: string[];
      normalized: unknown;
      visibleMap: Record<string, boolean>;
      rawOrder: string[];
    };
    __dockBoundaryError?: unknown;
    __dockBoundaryErrorInfo?: {
      message: string;
      stack?: string;
    };
  }
}

declare module '*?inline' {
  const content: string;
  export default content;
}

export {};
