import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React, { useEffect } from "react";
import {
  useConnectorStore,
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
  const hub = useConnectorStore((s) => s.hub);
  const hubConnected = useConnectorStore((s) => s.hubConnected);

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
      <div className="flex flex-col w-fit">
        {shareRole == ShareRole.Sender ? (
          <>
            <FileSelector />
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
            <List dense>
              {sharedFileMetadata.map((file, idx) => (
                <ListItem
                  key={idx}
                  // secondaryAction={
                  //   <IconButton
                  //     edge="end"
                  //     size="small"
                  //     aria-label="delete"
                  //     onClick={() => removeFile(file)}
                  //   >
                  //     <Delete />
                  //   </IconButton>
                  // }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <InsertDriveFile />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={file.name}
                    secondary={`${
                      file.type != "" ? file.type : "Unknown type"
                    }, ${fileSize(file.size)}`}
                  />
                </ListItem>
              ))}
            </List>
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
