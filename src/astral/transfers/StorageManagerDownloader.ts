import { useReceiverStore } from "../../state";
import { IDownloader } from "../interfaces";
import { FileMetadata } from "../models";

class StorageManagerDownloader implements IDownloader {
  private file: FileSystemFileHandle | undefined;
  private stream: FileSystemWritableFileStream | undefined;
  //   private writer: WritableStreamDefaultWriter<any> | undefined;
  private buffer: Uint8Array[];
  private lock: boolean;
  private position: number;
  //   private downloadReady: boolean;
  private timeoutHandle: number | null;

  constructor(
    private meta: FileMetadata,
    private folder: string,
    private start?: number
  ) {
    this.buffer = [];
    this.lock = false;
    this.position = 0;
    // this.downloadReady = false;
    this.timeoutHandle = null;
  }

  public init = async () => {
    const root = await window.navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(this.folder, { create: true });
    const file = await dir.getFileHandle(this.meta.name, { create: true });

    if (file) {
      this.file = file;
      this.stream = await file.createWritable({ keepExistingData: true });
      if (this.start) {
        await this.stream.seek(this.start);
        this.position = this.start;
      }
      //   this.writer = stream.getWriter();
    }

    // this.writer!.addEventListener("writeend", () =>
    //   setTimeout(this._internalWrite, 40)
    // );

    // this.writer!.onwriteend = () => {
    //   if (
    //     this.writer!.position == this.position &&
    //     this.position == this.meta.size
    //   ) {
    //     console.log("Download ready");
    //     this.downloadReady = true;
    //   }
    // };

    return true;
  };

  public write = (data: Uint8Array) => {
    this.buffer.push(data);
    this._internalWrite();
  };

  private _internalWrite = async () => {
    if (this.lock) return;

    if (this.timeoutHandle != null) {
      window.clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }

    this.lock = true;
    while (this.buffer.length > 0) {
      //   if (
      //     this.position != this.stream!.position &&
      //     this.writer!.readyState != this.writer!.DONE
      //   ) {
      //     this.timeoutHandle = window.setTimeout(this._internalWrite, 40);
      //     break;
      //   }

      const dat = this.buffer[0];
      try {
        await this.stream!.write(new Blob([dat]));
        this.position += dat.length;
      } catch (e) {
        console.warn("Failed... retrying...");
        this.timeoutHandle = window.setTimeout(this._internalWrite, 40);
        break;
      }
      useReceiverStore.getState().setProgress(this.meta.id, this.position);
      this.buffer.shift()!;
    }
    this.lock = false;
  };

  public finish = () => {
    const readyCheck = () => {
      if (this.position !== this.meta.size) {
        setTimeout(readyCheck, 100);
      } else {
        console.log(this.position, this.buffer);
        this.stream!.close().then(() =>
          this.file!.getFile().then((file) => {
            const url = window.URL.createObjectURL(file);
            console.log(url);

            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = this.meta.name;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
            }, 1000);
          })
        );
      }
    };
    readyCheck();
  };
}

export { StorageManagerDownloader };
