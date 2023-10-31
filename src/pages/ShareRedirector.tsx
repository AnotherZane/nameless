import { CircularProgress, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSessionStore } from "../state";
import { ShareRole } from "../astral/enums";
import { Typography } from "@mui/material";

const ShareRedirector = () => {
  const nav = useNavigate();
  const { code } = useParams();
  const [setCode, setRole] = useSessionStore((ss) => [ss.setCode, ss.setRole]);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!code) {
      nav("/");
      return;
    }

    const check = async () => {
      const res = await fetch(
        `${process.env.REACT_APP_ASTRAL_HUB_URL}/shares/${code}`,
        {
          method: "HEAD",
        }
      );

      if (res.ok) {
        setCode(code);
        setRole(ShareRole.Receiver);
        nav("/");
      } else {
        setIsExpired(true);
      }
    };

    check();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col space-y-2 items-center place-content-center">
      {isExpired ? (
        <>
          <Typography className="mb-2" variant="h4">
            <Tooltip
              title="Ouhhh... Husbant... Now We Are Homeress..."
              placement="top"
            >
              <Typography variant="h4" display={"inline"}>
                404
              </Typography>
            </Tooltip>{" "}
            - Share Not Found
          </Typography>
          <Typography>Looks like this share no longer exists.</Typography>
          <Link to={"/"}>
            <Typography>Click here to go to the main page.</Typography>
          </Link>
        </>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
};

export { ShareRedirector };
