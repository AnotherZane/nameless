import { useReceiverStore } from "../../state";
import { IDownloader } from "../interfaces";
import { FileMetadata } from "../models";
import { FileSyncSWDownloader } from "./FileSyncSWDownloader";
import { FileSystemDownloader } from "./FileSystemDownloader";
// import { StorageManagerDownloader } from "./StorageManagerDownloader";
import { StreamDownloader } from "./StreamDownloader";

const GB = 1024 * 1024 * 1024;
const HUGE_QUOTA = GB * 100;

window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem;

const createDownloader = async (
  meta: FileMetadata,
  code: string,
  id: string,
  start?: number
): Promise<IDownloader> => {
  if (window.navigator.storage != null) {
    const estimate = await window.navigator.storage.estimate();
    if (estimate.quota && estimate.quota > GB) {
      if (window.requestFileSystem != undefined) {
        let fs = await requestFileSystem(window.PERSISTENT, HUGE_QUOTA);

        // Retry request with available quota
        if (!fs)
          fs = await requestFileSystem(window.PERSISTENT, estimate.quota);

        if (fs) return new FileSystemDownloader(fs, meta, `${code}_${id}`, start);
      } else {
        // persist if not chrome based
        await window.navigator.storage.persist();

        if (await window.navigator.storage.persisted()) {
          // return new StorageManagerDownloader(meta, `${code}_${id}`, start);

          return new FileSyncSWDownloader(meta, `${code}_${id}`, start);
        }
      }
    }
  }

  // TODO: Rewrite functionally

  return new StreamDownloader(meta.name, meta.size);
};

const loadFileProgress = async (code: string, id: string): Promise<boolean> => {
  if (window.navigator.storage != null) {
    const estimate = await window.navigator.storage.estimate();
    if (estimate.quota && estimate.quota > GB) {
      if (window.requestFileSystem != undefined) {
        let fs = await requestFileSystem(window.PERSISTENT, HUGE_QUOTA);

        // Retry request with available quota
        if (!fs)
          fs = await requestFileSystem(window.PERSISTENT, estimate.quota);

        if (fs) {
          const dir = await new Promise<FileSystemEntry | undefined>(
            (res, rej) =>
              fs!.root.getDirectory(
                `${code}_${id}`,
                { create: false },
                res,
                rej
              )
          );
          if (!dir) throw new Error("dir");

          const reader = (dir as FileSystemDirectoryEntry).createReader();
          const entries = await new Promise(
            (resolve: FileSystemEntriesCallback, reject) =>
              reader.readEntries(resolve, reject)
          );

          if (!entries) throw new Error("entries");

          const meta = useReceiverStore.getState().sharedMetadata;

          for (const entry of entries) {
            if (entry.isFile) {
              const fileMeta = meta.find((x) => x.name == entry.name);

              if (!fileMeta) throw new Error("meta");

              const file = await new Promise((res: FileCallback, rej) =>
                (entry as FileSystemFileEntry).file(res, rej)
              );

              if (!file) throw new Error("file");

              useReceiverStore.getState().setProgress(fileMeta.id, file.size);
            }
          }
        }
      } else {
        // persist if not chrome based
        await window.navigator.storage.persist();

        if (await window.navigator.storage.persisted()) {
          const root = await window.navigator.storage.getDirectory();
          try {
            const dir = await root.getDirectoryHandle(`${code}_${id}`, {
              create: false,
            });

            const meta = useReceiverStore.getState().sharedMetadata;

            if (dir) {
              for await (const entry of dir.entries()) {
                const fileMeta = meta.find((x) => x.name == entry[1].name);

                if (!fileMeta) continue;

                const file = await (entry[1] as FileSystemFileHandle).getFile();

                useReceiverStore.getState().setProgress(fileMeta.id, file.size);
              }
            }
          } catch (e) {
            return false;
          }
        }
      }
    }
  }

  return false;
};

const requestFileSystem = (
  type: number,
  size: number
): Promise<FileSystem | undefined> => {
  return new Promise((resolve, reject) => {
    window.requestFileSystem(
      type,
      size,
      (fs) => resolve(fs),
      (err) => {
        console.error(err);
        reject(err);
      }
    );
  });
};

const createUploader = (file: File) => {
  console.log(file);
};

export {
  createDownloader,
  createUploader,
  requestFileSystem,
  loadFileProgress,
};
