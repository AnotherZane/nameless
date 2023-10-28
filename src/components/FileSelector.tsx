import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  AttachFile,
  Delete,
  HelpOutline,
  InsertDriveFile,
} from "@mui/icons-material";
import { fileSize } from "humanize-plus";
import {
  useReceiverStore,
  useSenderStore,
  useSessionStore,
  useThemeStore,
} from "../state";
import { useSnackbar } from "notistack";
import { CircularProgressWithIcon } from "./CircularProgressWithIcon";
import { ShareRole } from "../astral/enums";
import { FileMetadata } from "../astral/models";
import { getRandomInt } from "../utils";

const FileSelector = () => {
  const role = useSessionStore((ss) => ss.role);

  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useThemeStore((t) => t.theme);

  const [sharedFiles, addFiles, removeFile, clearFiles] = useSenderStore(
    (s) => [s.sharedFiles, s.addFiles, s.removeFile, s.clearFiles]
  );
  const sharedMeta = useReceiverStore((r) => r.sharedMetadata);

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const [dirCheck, setDirCheck] = useState<boolean>(false);
  const dropRef = useRef<HTMLDivElement>(null);
  // const [dragged, setDragged] = useState<boolean>(false);

  useEffect(() => {
    if (!dropRef.current) return;

    dropRef.current.addEventListener("dragover", handleDragOver);
    dropRef.current.addEventListener("drop", handleDrop);

    return () => {
      dropRef.current?.removeEventListener("dragover", handleDragOver);
      dropRef.current?.removeEventListener("drop", handleDrop);
    };
  }, [dropRef]);

  useEffect(() => {
    if (!inputRef.current) return;

    if (dirCheck) inputRef.current.setAttribute("webkitdirectory", "");
    else inputRef.current.removeAttribute("webkitdirectory");
  }, [dirCheck]);

  const handleDragOver = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      const existing = addFiles(...Array.from(e.dataTransfer.files));

      if (existing.length) {
        for (const file of existing) {
          const message = (
            <Typography variant="body2">
              <span className="text-accent-base">{file.name} </span>
              already selected, skipping...
            </Typography>
          );
          const key = enqueueSnackbar(message, {
            SnackbarProps: {
              onClick: () => {
                closeSnackbar(key);
              },
            },
          });
        }
      }
    }
  };

  const updateFiles = () => {
    if (!inputRef.current) return;

    if (inputRef.current.files && inputRef.current.files.length) {
      const existing = addFiles(...Array.from(inputRef.current.files));

      if (existing.length) {
        for (const file of existing) {
          const message = (
            <Typography variant="body2">
              <span className="text-accent-base">{file.name} </span>
              already selected, skipping...
            </Typography>
          );
          const key = enqueueSnackbar(message, {
            SnackbarProps: {
              onClick: () => {
                closeSnackbar(key);
              },
            },
          });
        }
      }
    }

    // clear input selection
    inputRef.current.value = "";
  };

  const hasFiles =
    (role == ShareRole.Sender ? sharedFiles.size : sharedMeta.length) > 0;

  return (
    <Paper
      elevation={4}
      className={
        "flex flex-col self-start p-3 md:p-5 min-h-[50vh] max-h-[420px] transition-[height] duration-300 " +
        (theme == "dark"
          ? ""
          : "bg-gradient-to-b from-[rgba(130,130,130,0.09)] to-[rgba(130,130,130,0.09)]")
      }
    >
      <Paper
        id="file-list-container"
        elevation={1}
        ref={dropRef}
        className={
          "grow overflow-auto " +
          (hasFiles
            ? ""
            : "flex flex-col items-center select-none ") +
            (role == ShareRole.Sender ? "justify-center " : "") +
          (theme == "dark"
            ? ""
            : "bg-gradient-to-b from-[rgba(200,200,200,0.09)] to-[rgba(200,200,200,0.09)]")
        }
        onClick={() => {
          if (!hasFiles) inputRef.current?.click();
        }}
      >
        {hasFiles ? (
          <List dense className="w-full">
            {(role == ShareRole.Sender
              ? Array.from(sharedFiles.entries())
              : sharedMeta.map<[number, FileMetadata]>((x) => [x.id, x])
            )
              .sort((a, b) => a[1].size - b[1].size)
              .map(([fid, file]) => (
                <ListItem
                  key={fid}
                  secondaryAction={
                    role == ShareRole.Sender && (
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label="delete"
                        onClick={() => removeFile(fid)}
                      >
                        <Delete
                          fontSize="small"
                          className="dark:text-red-400 text-red-500"
                        />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <CircularProgressWithIcon
                        icon={<InsertDriveFile />}
                        className="dark:text-emerald-400 text-green-500"
                        variant="determinate"
                        // value={Math.min((idx + 1) * 10, 100)}
                      />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    className="break-words"
                    primary={file.name}
                    secondary={`${
                      file.type != "" ? file.type : "Unknown type"
                    }, ${fileSize(file.size)}`}
                  />
                </ListItem>
              ))}
          </List>
        ) : role == ShareRole.Sender ? (
          <>
            <div className="w-[50%] md:w-[40%] lg:w-[30%] h-fit transition-[width] duration-300">
              <Add
                id="file-box-plus"
                className="text-zinc-200 dark:text-[#3a3a3a] min-w-full h-fit"
                fontSize="large"
              />
              <div className="min-w-full max-w-full border-dashed border-2 border-zinc-400 dark:border-[#3d3d3d]"></div>
            </div>
            <Typography
              className="text-zinc-500 dark:text-[#4d4d4d] mt-4 px-2 text-center select-none"
              variant="h5"
            >
              Select or drop files here!
            </Typography>
          </>
        ) : (
          <List dense className="w-full">
            {Array.from(Array(6).keys()).map((idx) => (
              <ListItem
                key={idx}
                secondaryAction={
                  <Skeleton animation="wave" variant="rounded" width={20} height={20} />
                }
              >
                <ListItemAvatar>
                  <Skeleton
                    animation="wave"
                    variant="circular"
                    width={40}
                    height={40}
                  />
                </ListItemAvatar>
                <ListItemText
                  className="break-words"
                  primary={
                    <Skeleton animation="wave" width={getRandomInt(200, 220)} />
                  }
                  secondary={
                    <Skeleton animation="wave" width={getRandomInt(180, 200)} />
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {role == ShareRole.Sender && (
        <>
          <div
            className={
              "flex justify-between flex-col-reverse md:flex-row " +
              (hasFiles ? "mt-4" : "mt-1")
            }
          >
            <FormControlLabel
              name="directory_selector"
              className="mt-1"
              control={
                <Checkbox
                  size="small"
                  checked={dirCheck}
                  onChange={() => setDirCheck(!dirCheck)}
                />
              }
              label={
                <>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Typography variant="body2">
                      Use Directory Selector
                    </Typography>
                    <Tooltip title="Should the file selector allow selecting directories?">
                      <HelpOutline
                        className="-mb-[2px] text-primary-base"
                        fontSize="inherit"
                      />
                    </Tooltip>
                  </div>
                </>
              }
            />
            {hasFiles && (
              <div className="flex flex-[0_0_50%] justify-around space-x-4 w-full md:w-auto">
                <Button
                  className={
                    theme == "dark"
                      ? "grow"
                      : "grow text-accent-500 border-accent-400 hover:border-accent-500 hover:bg-accent-500/[0.06]"
                  }
                  variant="outlined"
                  color="accent"
                  onClick={() => inputRef.current?.click()}
                >
                  <AttachFile fontSize="small" />
                  Add Files
                </Button>
                <Button
                  className="grow"
                  variant="outlined"
                  color="error"
                  onClick={() => clearFiles()}
                >
                  <Delete fontSize="small" />
                  Clear All Files
                </Button>
              </div>
            )}
          </div>
          <input
            className="hidden"
            type="file"
            ref={inputRef}
            onChange={updateFiles}
            multiple
          />
        </>
      )}
    </Paper>
  );
};

export { FileSelector };
