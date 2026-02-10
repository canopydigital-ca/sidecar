declare global {
  var __DEV__: boolean;
  interface Window {
    __cgptDockDebug?: {
      run: () => Promise<any>;
    };
    __cgptDockSelfTest?: {
      run: () => Promise<any>;
    };
    __dockDebug?: {
      desiredCount: number;
      order: string[];
      normalized: any;
      visibleMap: Record<string, boolean>;
      rawOrder: string[];
    };
  }
}

declare module '*?inline' {
  const content: string;
  export default content;
}

export { };
