import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
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
import { useReceiverStore, useSenderStore, useShareStore } from "../state";
import { useSnackbar } from "notistack";
import { CircularProgressWithIcon } from "./CircularProgressWithIcon";
import { ShareRole } from "../astral/enums";
import { FileMetadata } from "../astral/models";

type FileSelectorProps = {
  className?: string;
};

const FileSelector = ({ className }: FileSelectorProps) => {
  const shareRole = useShareStore((s) => s.role);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dirCheck, setDirCheck] = useState<boolean>(false);

  const [sharedFiles, addFiles, removeFile, clearFiles] = useSenderStore(
    (s) => [s.sharedFiles, s.addFiles, s.removeFile, s.clearFiles]
  );
  const sharedMeta = useReceiverStore((r) => r.sharedMetadata);

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!inputRef.current) return;

    if (dirCheck) inputRef.current.setAttribute("webkitdirectory", "");
    else inputRef.current.removeAttribute("webkitdirectory");
  }, [dirCheck]);

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

  return (
    <div className={className}>
      <Paper
        elevation={4}
        className="flex flex-col self-start p-3 md:p-5 min-h-[50vh] md:min-h-[60vh] max-h-[50vh] md:max-h-[60vh] transition-[height] duration-300"
      >
        {(shareRole == ShareRole.Sender
          ? sharedFiles.size
          : sharedMeta.length) > 0 ? (
          <>
            <Paper
              id="file-list-container"
              elevation={1}
              className="grow overflow-auto"
            >
              <List dense>
                {(shareRole == ShareRole.Sender
                  ? Array.from(sharedFiles.entries())
                  : sharedMeta.map<[number, FileMetadata]>((x) => [x.id, x])
                )
                  .sort((a, b) => a[1].size - b[1].size)
                  .map(([id, file], idx) => (
                    <ListItem
                      key={id}
                      secondaryAction={
                        shareRole == ShareRole.Sender && (
                          <IconButton
                            edge="end"
                            size="small"
                            aria-label="delete"
                            onClick={() => removeFile(id)}
                          >
                            <Delete fontSize="small" className="text-red-400" />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <CircularProgressWithIcon
                            icon={<InsertDriveFile />}
                            className="text-emerald-400"
                            variant="determinate"
                            value={Math.min((idx + 1) * 10, 100)}
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
            </Paper>
            {shareRole == ShareRole.Sender && (
              <div className="flex justify-around space-x-4 mt-4 w-full">
                <Button
                  className="grow"
                  variant="outlined"
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
          </>
        ) : (
          <Paper
            elevation={1}
            className="grow flex flex-col justify-center items-center"
            onClick={() => inputRef.current?.click()}
          >
            <div className="w-[40%] h-fit">
              <Add
                id="file-box-plus"
                className="text-[#303030] min-w-full h-fit"
                fontSize="large"
              />
              <div className="min-w-full h-1 bg-[#303030]"></div>
            </div>
            <Typography className="text-zinc-500 mt-4 text-center" variant="h5">
              Select or drop files here!
            </Typography>
          </Paper>
        )}

        {shareRole == ShareRole.Sender && (
          <>
            <input
              className="hidden"
              type="file"
              ref={inputRef}
              onChange={updateFiles}
              multiple
            />
            <FormControlLabel
              className="mt-2"
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
          </>
        )}
      </Paper>
    </div>
  );
};

export { FileSelector };
