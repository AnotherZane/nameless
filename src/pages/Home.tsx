import { Button, Typography } from "@mui/material";
import React, { useEffect } from "react";
import {
  useConnectivityStore,
  useReceiverStore,
  useSenderStore,
  useSessionStore,
  useShareStore,
} from "../state";
import { formatShareLink } from "../utils";
import { FileSelector } from "../components";
import { ShareRole } from "../astral/enums";
import { requestFileSystem } from "../astral/transfers";

const Home = () => {
  const hub = useConnectivityStore((s) => s.akivili);
  const hubConnected = useConnectivityStore((s) => s.pathConnected);

  const [role, code] = useSessionStore((ss) => [ss.role, ss.code]);
  const sharedFiles = useSenderStore((s) => s.sharedFiles);
  const sharedFileMetadata = useReceiverStore((s) => s.sharedMetadata);
  useEffect(() => {
    const clearShares = async () => {
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
        );

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
    };

    clearShares();

    if (role == ShareRole.Receiver) {
      if (!hubConnected) {
        hub.start();
        return;
      }

      hub.joinShare(code!);
    }
  }, [hubConnected]);

  const shareFiles = async () => {
    if (sharedFiles.size < 1) return;

    await hub.start();
    await hub.createShare();
  };

  const downloadFiles = async () => {
    await hub.requestRtc();
  };

  return (
    <>
      <div className="flex justify-center text-center mt-4 md:pt-4">
        <Typography
          variant="h4"
          className="text-2xl md:text-3xl transition-[font-size] duration-300"
        >
          Easy Peer To Peer File Sharing
        </Typography>
      </div>
      <div className="flex flex-col-reverse md:flex-row-reverse mt-4 md:justify-around">
        {/* <div className="text-center hidden md:block"></div> */}
        <div className="flex-1 md:flex-[0_0_80%] transition-[padding] duration-300 min-[500px]:px-6 sm:px-10 md:px-6 lg:px-8 xl:px-10">
          <FileSelector />
          <div className="flex flex-col w-full items-center">
            {role == ShareRole.Sender ? (
              <>
                <p
                  className="hover:text-primary-base"
                  onClick={() => {
                    if (!code) return;
                    navigator.clipboard.writeText(
                      formatShareLink(document.location, code)
                    );
                  }}
                >
                  {code
                    ? formatShareLink(document.location, code)
                    : "Click Share to Generate a Link!"}
                </p>
                <Button
                  className="w-[30%]"
                  variant="contained"
                  size="large"
                  onClick={shareFiles}
                >
                  Share
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-[30%] mt-3"
                  variant="contained"
                  size="large"
                  onClick={downloadFiles}
                  disabled={sharedFileMetadata.length < 1}
                >
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export { Home };
