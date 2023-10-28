import { CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSessionStore } from "../state";
import { ShareRole } from "../astral/enums";

const ShareRedirector = () => {
  const nav = useNavigate();
  const { code } = useParams();
  const [setCode, setRole] = useSessionStore((ss) => [ss.setCode, ss.setRole]);

  useEffect(() => {
    if (!code) {
      nav("/");
      return;
    }

    setCode(code);
    setRole(ShareRole.Receiver);
    nav("/");
  }, []);

  return (
    <div className="w-full h-screen flex items-center place-content-center">
      <CircularProgress />
    </div>
  );
};

export { ShareRedirector };
