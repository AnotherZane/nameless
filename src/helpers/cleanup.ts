import { requestFileSystem } from "../astral/transfers";
import { useShareStore } from "../state";

const cleanup = async () => {
  // Cleanout expired shares
  if (useShareStore.getState().shares.size > 0) {
    const rev = new Map<string, string>();
    let query = "";

    for (const s of Array.from(useShareStore.getState().shares.entries())) {
      const val = `${s[1].code}:${s[1].connectionId}`;
      rev.set(val, s[0]);
      query += `;${val}`;
    }

    const res = await fetch(
      `${process.env.REACT_APP_ASTRAL_HUB_URL}/shares/search?q=${query}`,
      {
        method: "GET",
      }
    ).catch((e) => console.error(e));

    if (res) {
      const data = new Map<string, { member: number; share: number }>(
        Object.entries(await res.json())
      );

      for (const valid of Array.from(data.entries())) {
        if (rev.has(valid[0]) || valid[0]) rev.delete(valid[0]);
      }

      for (const unknown of Array.from(rev.entries())) {
        useShareStore.getState().deleteShare(unknown[1]);
      }
    }
  }

  // Clean wicg file system entries
  if (window.requestFileSystem != undefined) {
    const fs = await requestFileSystem(
      window.PERSISTENT,
      1024 * 1024 * 1024 * 100
    );

    if (fs) {
      const dirReader = fs.root.createReader();
      const existing = await new Promise<FileSystemEntry[] | undefined>(
        (res, rej) => dirReader.readEntries(res, rej)
      );

      const shares = useShareStore.getState().shares;

      if (existing && existing.length > 0) {
        for (const dir of existing) {
          const vals = dir.name.split("_");
          if (vals.length > 1 && shares.has(vals[1])) continue;

          console.log("removing", dir);

          dir.isDirectory
            ? (dir as FileSystemDirectoryEntry).removeRecursively(
                console.log,
                console.log
              )
            : dir.remove(console.log, console.log);
        }
      }
    }
  }

  // clean wicg file system handles
  if (await window.navigator.storage.persisted()) {
    const root = await window.navigator.storage.getDirectory();

    const shares = useShareStore.getState().shares;

    for await (const [key, value] of root.entries()) {
      const vals = value.name.split("_");
      if (vals.length > 1 && shares.has(vals[1])) continue;

      console.log("removing", value);

      await root.removeEntry(key, { recursive: true });
    }
  }
};

export { cleanup };
