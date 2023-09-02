import { CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShareStore } from "../state";
import { ShareRole } from "../astral/enums";

const ShareRedirector = () => {
  const nav = useNavigate();
  const { code } = useParams();
  const [setShareCode, setShareRole] = useShareStore((s) => [
    s.setCode,
    s.setRole,
  ]);

  useEffect(() => {
    if (!code) {
      nav("/");
    }

    setShareCode(code);
    setShareRole(ShareRole.Receiver);
    nav("/");
  }, []);

  return (
    <div className="w-full h-screen flex items-center place-content-center">
      <CircularProgress />
    </div>
  );
};

export { ShareRedirector };
