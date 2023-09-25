import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
} from "@mui/material";
import { Delete, InsertDriveFile } from "@mui/icons-material";
import { fileSize } from "humanize-plus";
import { useSenderStore } from "../state";

const FileSelector = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dirCheck, setDirCheck] = useState<boolean>(false);

  const [sharedFiles, addFiles, removeFile, clearFiles] = useSenderStore(
    (s) => [s.sharedFiles, s.addFiles, s.removeFile, s.clearFiles]
  );

  useEffect(() => {
    if (!inputRef.current) return;

    if (dirCheck) inputRef.current.setAttribute("webkitdirectory", "");
    else inputRef.current.removeAttribute("webkitdirectory");
  }, [dirCheck]);

  const updateFiles = () => {
    if (!inputRef.current) return;

    if (inputRef.current.files && inputRef.current.files.length > 0) {
      clearFiles();
      addFiles(...Array.from(inputRef.current.files));
    }

    // clear input selection
    inputRef.current.value = "";
  };

  return (
    <Paper
      elevation={4}
      className="flex flex-col place-items-center max-w-fit p-4"
    >
      {sharedFiles.size > 0 && (
        <Paper elevation={1}>
          <List dense>
            {Array.from(sharedFiles.entries())
              .sort((a, b) => a[1].size - b[1].size)
              .map(([id, file]) => (
                <ListItem
                  key={id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      aria-label="delete"
                      onClick={() => removeFile(id)}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <InsertDriveFile />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      file.name.length <= 24
                        ? file.name
                        : file.name.substring(0, 12) +
                          "..." +
                          file.name.substring(file.name.length - 12)
                    }
                    secondary={`${
                      file.type != ""
                        ? file.type.length < 24
                          ? file.type
                          : file.type.substring(0, 21) + "..."
                        : "Unknown type"
                    }, ${fileSize(file.size)}`}
                  />
                </ListItem>
              ))}
          </List>
        </Paper>
      )}
      <span>
        <input
          type="checkbox"
          checked={dirCheck}
          onChange={() => setDirCheck(!dirCheck)}
        />
        Use Directory
      </span>
      <input
        className="m-4 hidden"
        type="file"
        ref={inputRef}
        onChange={updateFiles}
        multiple
      />
      <Button variant="outlined" onClick={() => inputRef.current?.click()}>
        Select files
      </Button>
    </Paper>
  );
};

export { FileSelector };
