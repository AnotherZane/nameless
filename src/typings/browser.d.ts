export {};

declare global {
  interface Window {
    webkitRequestFileSystem: (
      type: number,
      size: number,
      successCallback: (fs: FileSystem) => void,
      errorCallback?: (e: unknown) => void
    ) => undefined;

    requestFileSystem: (
      type: number,
      size: number,
      successCallback: (fs: FileSystem) => void,
      errorCallback?: (e: unknown) => void
    ) => undefined;

    TEMPORARY: number;
    PERSISTENT: number;
  }

  interface FileWriter extends EventTarget {
    readonly position: number;
    readonly length: number;
    write: (data: Blob) => void;
    seek: (offset: number) => void;
    truncate: (size: number) => void;
    onabort: EventListener;
    onerror: EventListener;
    onprogress: EventListener;
    onwrite: EventListener;
    onwriteend: EventListener;
    onwritestart: EventListener;
    readyState: number;

    DONE: number;
    INIT: number;
    WRITING: number;
  }

  interface FileSystemEntry {
    remove: (
      successCallback: (e: unknown) => void,
      errorCallback?: (e: unknown) => void
    ) => void;
    toURL: () => string;
  }

  interface FileSystemDirectoryEntry {
    removeRecursively: (
      successCallback: (e: unknown) => void,
      errorCallback?: (e: unknown) => void
    ) => void;
  }

  interface FileSystemFileEntry {
    createWriter: (
      success?: (writer: FileWriter) => void,
      failure?: (err: unknown) => void
    ) => void;
  }
}
