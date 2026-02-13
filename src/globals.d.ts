export {};

declare global {
  interface Window {
    updateStatusBar: (
      mode?: string,
      commandLine?: string,
      fileInfo?: string,
      position?: string
    ) => void;
    performSearch: (searchTerm: string) => void;
    clearSearch: () => void;
  }
}
