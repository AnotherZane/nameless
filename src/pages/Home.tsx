import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import {
  useConnectivityStore,
  useReceiverStore,
  useSenderStore,
  useShareStore,
} from "../state";
import { formatShareLink } from "../utils";
import { FileSelector } from "../components";
import { ShareRole } from "../astral/enums";
import { InsertDriveFile } from "@mui/icons-material";
import { fileSize } from "humanize-plus";

const Home = () => {
  const hub = useConnectivityStore((s) => s.akivili);
  const hubConnected = useConnectivityStore((s) => s.pathConnected);

  const shareRole = useShareStore((s) => s.role);
  const shareCode = useShareStore((s) => s.code);
  const sharedFiles = useSenderStore((s) => s.sharedFiles);

  const sharedFileMetadata = useReceiverStore((s) => s.sharedMetadata);

  useEffect(() => {
    if (shareRole == ShareRole.Receiver) {
      if (!hubConnected) {
        hub.start();
        return;
      }

      hub.requestMetadata(shareCode!);
    }
  }, [hubConnected]);

  const shareFiles = async () => {
    if (sharedFiles.size < 1) return;

    await hub.start();
    await hub.createShare();
  };

  const downloadFiles = async () => {
    await hub.requestRTC();
  };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row-reverse md:pt-16 mt-8 md:justify-around">
        <div className="text-center hidden md:block">
          <Typography variant="h4">Easy Peer To Peer File Sharing</Typography>
        </div>
        <FileSelector className="flex-1 md:flex-[0_0_50%] transition-[padding] duration-300 min-[500px]:px-6 sm:px-12 md:px-6 lg:px-8 xl:px-10 2xl:px-14" />
      </div>
      <div className="flex flex-col w-fit">
        {shareRole == ShareRole.Sender ? (
          <>
            <p
              className="hover:text-primary-base"
              onClick={() => {
                if (!shareCode) return;
                navigator.clipboard.writeText(
                  formatShareLink(document.location, shareCode)
                );
              }}
            >
              {shareCode
                ? formatShareLink(document.location, shareCode)
                : "Click Share to Generate a Link!"}
            </p>
            <Button variant="contained" size="large" onClick={shareFiles}>
              Share
            </Button>
          </>
        ) : (
          <>
            <Button
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
  );
};

export { Home };
