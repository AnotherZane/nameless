import { useReceiverStore } from "../../state";
import { IDownloader } from "../interfaces";
import { FileMetadata } from "../models";

const worker = new Worker("/fs_sw/fs_sw.js");

class FileSyncSWDownloader implements IDownloader {
  private file: FileSystemFileHandle | undefined;
  private stream: WritableStream | undefined;
  private writer: WritableStreamDefaultWriter<unknown> | undefined;
  private buffer: Uint8Array[];
  private lock: boolean;
  private position: number;
  private resolved: boolean;
  private timeoutHandle: number | null;

  constructor(
    private meta: FileMetadata,
    private folder: string,
    private start?: number
  ) {
    this.buffer = [];
    this.lock = false;
    this.position = 0;
    this.resolved = false;
    this.timeoutHandle = null;

    worker.onmessage = (ev) => {
      console.log(ev);
      if (ev.data.stream) {
        this.stream = ev.data.stream as WritableStream;
        this.writer = this.stream.getWriter();
        this.resolved = true;
      }

      worker.onmessage = null;
    };
  }

  public init = async () => {
    const root = await window.navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(this.folder, { create: true });
    this.file = await dir.getFileHandle(this.meta.name, { create: true });

    if (this.start) {
      this.position = this.start;
      console.log("Seeked to", this.start);
    }

    worker.postMessage({
      file: this.meta.name,
      folder: this.folder,
      start: this.start
    });

    await new Promise<void>((res) => {
      const a = setInterval(() => {
        if (this.resolved) res();
        clearInterval(a);
      }, 100);
    });

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
        await this.writer!.write(dat);
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
        this.writer!.close().then(() =>
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

export { FileSyncSWDownloader };
