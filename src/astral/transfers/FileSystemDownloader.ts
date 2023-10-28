import { IDownloader } from "../interfaces";
import { FileMetadata } from "../models";

class FileSystemDownloader implements IDownloader {
  private file: FileSystemFileEntry | undefined;
  private writer: FileWriter | undefined;
  private buffer: Uint8Array[];
  private lock: boolean;
  private position: number;
  private downloadReady: boolean;
  private timeoutHandle: number | null;

  constructor(
    private fs: FileSystem,
    private meta: FileMetadata,
    private folder: string
  ) {
    this.buffer = [];
    this.lock = false;
    this.position = 0;
    this.downloadReady = false;
    this.timeoutHandle = null;
  }

  public init = async () => {
    const entry = (await new Promise<FileSystemEntry | undefined>(
      (resolve, reject) =>
        this.fs.root.getDirectory(
          this.folder,
          { create: true },
          resolve,
          reject
        )
    )) as FileSystemDirectoryEntry;

    if (entry) {
      const file = await new Promise<FileSystemEntry | undefined>(
        (resolve, reject) =>
          entry.getFile(this.meta.name, { create: true }, resolve, reject)
      );

      if (file) {
        this.file = file as FileSystemFileEntry;
        this.writer = await new Promise<FileWriter | undefined>(
          (resolve, reject) =>
            (file as FileSystemFileEntry).createWriter(resolve, reject)
        );
      }
    }

    this.writer!.addEventListener("writeend", () =>
      setTimeout(this._internalWrite, 40)
    );

    this.writer!.onwriteend = () => {
      if (
        this.writer!.position == this.position &&
        this.position == this.meta.size
      ) {
        console.log("Download ready");
        this.downloadReady = true;
      }
    };

    return true;
  };

  public write = (data: Uint8Array) => {
    this.buffer.push(data);
    this._internalWrite();
  };

  private _internalWrite = () => {
    if (this.lock) return;

    if (this.timeoutHandle != null) {
      window.clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }

    this.lock = true;
    while (this.buffer.length > 0) {
      if (
        this.position != this.writer!.position &&
        this.writer!.readyState != this.writer!.DONE
      ) {
        this.timeoutHandle = window.setTimeout(this._internalWrite, 40);
        break;
      }

      const dat = this.buffer[0];
      try {
        this.writer!.write(new Blob([dat]));
        this.position += dat.length;
      } catch (e) {
        console.warn("Failed... retrying...");
        this.timeoutHandle = window.setTimeout(this._internalWrite, 40);
        break;
      }
      this.buffer.shift()!;
    }
    this.lock = false;
  };

  public finish = () => {
    const readyCheck = () => {
      if (this.downloadReady === false) {
        setTimeout(readyCheck, 100);
      } else {
        console.log(this.position, this.writer!.position, this.buffer);

        const url = this.file!.toURL();
        console.log(url);

        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = this.meta.name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 1000);
      }
    };
    readyCheck();
  };
}

export { FileSystemDownloader };
