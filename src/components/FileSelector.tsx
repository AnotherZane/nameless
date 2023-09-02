import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { Delete, InsertDriveFile } from "@mui/icons-material";
import { fileSize } from "humanize-plus";
import { useSenderStore } from "../state";

const FileSelector = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dirCheck, setDirCheck] = useState<boolean>(false);

  const [sharedFiles, addFiles, removeFile, clearFiles] = useSenderStore((s) => [
    s.sharedFiles,
    s.addFiles,
    s.removeFile,
    s.clearFiles,
  ]);

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
    <>
      <List dense>
        {sharedFiles.map((file, idx) => (
          <ListItem
            key={idx}
            secondaryAction={
              <IconButton
                edge="end"
                size="small"
                aria-label="delete"
                onClick={() => removeFile(file)}
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
              primary={file.name}
              secondary={`${
                file.type != "" ? file.type : "Unknown type"
              }, ${fileSize(file.size)}`}
            />
          </ListItem>
        ))}
      </List>

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
      <Button onClick={() => inputRef.current?.click()}>Select files</Button>
    </>
  );
};

export { FileSelector };
