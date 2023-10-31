import { Button, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  useConnectivityStore,
  useReceiverStore,
  useSenderStore,
  useSessionStore,
  useShareStore,
} from "../state";
import { formatShareLink } from "../utils";
import { FileSelector, ShareSelector } from "../components";
import { ShareRole } from "../astral/enums";
import { cleanup } from "../helpers";

const Home = () => {
  const hub = useConnectivityStore((s) => s.akivili);
  const hubConnected = useConnectivityStore((s) => s.pathConnected);
  const [loading, setLoading] = useState(true);

  const [sid, role, code] = useSessionStore((ss) => [ss.id, ss.role, ss.code]);
  const sharedFiles = useSenderStore((s) => s.sharedFiles);
  const sharedFileMetadata = useReceiverStore((s) => s.sharedMetadata);
  const shares = useShareStore((s) => s.shares);

  useEffect(() => {
    cleanup();

    setLoading(false);

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
      <div className="flex flex-grow flex-col-reverse md:flex-row-reverse mt-4 md:justify-around">
        {/* <div className="text-center hidden md:block"></div> */}
        <div className="flex-1 md:flex-[0_0_80%] transition-[padding] duration-300 min-[500px]:px-6 sm:px-10 md:px-6 lg:px-8 xl:px-10">
          {loading ? (
            <div className="flex flex-col min-h-[50vh] h-full justify-around place-items-center"><CircularProgress /></div>
          ) : shares.size > 0 && sid == undefined ? (
            <>
              <ShareSelector />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export { Home };
