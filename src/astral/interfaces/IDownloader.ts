interface IDownloader {
  init: () => Promise<boolean>;
  write: (data: Uint8Array) => void;
  finish: () => void;
}

export type { IDownloader };
