import { IDownloader } from "../interfaces";
import { FileMetadata } from "../models";
import { FileSystemDownloader } from "./FileSystemDownloader";
import { StorageManagerDownloader } from "./StorageManagerDownloader";
import { StreamDownloader } from "./StreamDownloader";

const GB = 1024 * 1024 * 1024;
const HUGE_QUOTA = GB * 100;

window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem;

const createDownloader = async (
  meta: FileMetadata,
  code: string,
  id: string
): Promise<IDownloader> => {
  if (window.navigator.storage != null) {
    const estimate = await window.navigator.storage.estimate();
    if (estimate.quota && estimate.quota > GB) {
      if (window.requestFileSystem != undefined) {
        let fs = await requestFileSystem(window.PERSISTENT, HUGE_QUOTA);

        // Retry request with available quota
        if (!fs)
          fs = await requestFileSystem(window.PERSISTENT, estimate.quota);

        if (fs) return new FileSystemDownloader(fs, meta, `${code}_${id}`);
      } else {
        // persist if not chrome based
        await window.navigator.storage.persist();

        if (await window.navigator.storage.persisted()) {
          return new StorageManagerDownloader(meta, `${code}_${id}`);
        }
      }
    }
  }

  // TODO: Rewrite functionally

  return new StreamDownloader(meta.name, meta.size);
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

export { createDownloader, createUploader, requestFileSystem };
