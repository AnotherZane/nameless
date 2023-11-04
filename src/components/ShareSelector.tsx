import {
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useSessionStore, useShareStore, useThemeStore } from "../state";
import { CreateNewFolder, Delete, Download, Upload } from "@mui/icons-material";
import { getTimeAgo } from "../utils";
import { MemberState, ShareRole } from "../astral/enums";
import { CircularProgressWithIcon } from "./CircularProgressWithIcon";
import { ListItemAvatar } from "@mui/material";
import { ListItemButton } from "@mui/material";

const ShareSelector = () => {
  const theme = useThemeStore((t) => t.theme);
  const shares = useShareStore((ss) => ss.shares);
  const [setRole, reconnectShare] = useSessionStore((ss) => [
    ss.setRole,
    ss.reconnectShare,
  ]);

  // const reconnect = (id:string, share: Share) => {
  //   console.log(share);
  //   reconnectShare(sid, share)
  // };

  const listItems = [
    <ListItem key="new" disablePadding>
      <ListItemButton onClick={() => setRole(ShareRole.Sender)}>
        <ListItemAvatar>
          <Avatar>
            <CreateNewFolder />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          className="break-words"
          primary={<Typography display="inline">New Share</Typography>}
          secondary="Create a new share"
        />
      </ListItemButton>
    </ListItem>,
  ];

  listItems.push(
    ...Array.from(shares.entries())
      .filter(
        (x) =>
          x[1].state != MemberState.OwnerConnected &&
          x[1].state != MemberState.Receiver &&
          x[1].role != ShareRole.Sender
      )
      .sort((s) => s[1].created)
      .reverse()
      .map(([sid, share]) => (
        <ListItem
          key={sid}
          secondaryAction={
            <IconButton
              edge="end"
              size="small"
              aria-label="delete"
              // TODO
              onClick={() => {
                useShareStore.getState().deleteShare(sid);
              }}
            >
              <Delete
                fontSize="small"
                className="dark:text-red-400 text-red-500"
              />
            </IconButton>
          }
          disablePadding
        >
          <ListItemButton onClick={() => reconnectShare(sid, share)}>
            <ListItemAvatar>
              <Avatar>
                <CircularProgressWithIcon
                  icon={
                    share.role == ShareRole.Sender ? <Upload /> : <Download />
                  }
                  className="dark:text-amber-400 text-amber-500"
                  variant="determinate"
                  // value={Math.min((3) * 10, 100)}
                />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              className="break-words"
              primary={
                <>
                  <Typography display="inline">Existing Share </Typography>
                  <Chip
                    className="font-[monospace] -mt-1"
                    label={share.code}
                    size="small"
                    variant="outlined"
                    color="accent"
                  />
                </>
              }
              secondary={`
            ${share.role == ShareRole.Sender ? "Sender" : "Receiver"},
            created ${getTimeAgo(new Date(share.created))}
          `}
            />
          </ListItemButton>
        </ListItem>
      ))
  );

  return (
    <Paper
      elevation={4}
      className={
        "flex flex-col self-start px-3 pt-3 md:px-5 md:pt-5 min-h-[50vh] max-h-[420px] transition-[height] duration-300 pb-3 md:pb-5 " +
        (theme == "dark"
          ? ""
          : "bg-gradient-to-b from-[rgba(130,130,130,0.09)] to-[rgba(130,130,130,0.09)]")
      }
    >
      <Paper
        id="file-list-container"
        elevation={1}
        className={
          "grow overflow-auto " +
          // (hasFiles ? "" : "flex flex-col items-center select-none ") +
          // (role == ShareRole.Sender ? "justify-center " : "") +
          (theme == "dark"
            ? ""
            : "bg-gradient-to-b from-[rgba(200,200,200,0.09)] to-[rgba(200,200,200,0.09)]")
        }
      >
        <List dense className="w-full">
          {listItems}
        </List>
      </Paper>
    </Paper>
  );
};

export { ShareSelector };
