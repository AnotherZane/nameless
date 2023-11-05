import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  useConnectivityStore,
  useReceiverStore,
  useSenderStore,
  useSessionStore,
  useShareStore,
} from "../state";
import { formatShareLink } from "../utils";
import {
  FileSelector,
  LiveIcon,
  ShareSelector,
  StatsCard,
} from "../components";
import { MemberState, ShareRole } from "../astral/enums";
import { useCleanup } from "../hooks";
import {
  ContentCopy,
  DataUsage,
  FileCopy,
  People,
  Speed,
  Timer,
} from "@mui/icons-material";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { fileSize } from "humanize-plus";

const Home = () => {
  const [hub, hubConnected] = useConnectivityStore((s) => [
    s.akivili,
    s.pathConnected,
  ]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState("00:00");
  // let timerInterval = null;

  const [
    role,
    code,
    setRole,
    reconnect,
    hide,
    setHide,
    fileCount,
    dataTransferred,
    startTime,
  ] = useSessionStore((ss) => [
    ss.role,
    ss.code,
    ss.setRole,
    ss.reconnect,
    ss.hide,
    ss.setHide,
    ss.fileCount,
    ss.dataTransferred,
    ss.startTime,
  ]);
  const sharedFiles = useSenderStore((s) => s.sharedFiles);
  const sharedFileMetadata = useReceiverStore((s) => s.sharedMetadata);
  const shares = useShareStore((s) => s.shares);

  const getResumableShares = () =>
    Array.from(shares.entries()).filter(
      (x) =>
        x[1].state != MemberState.OwnerConnected &&
        x[1].state != MemberState.Receiver &&
        x[1].role != ShareRole.Sender
    ).length;

  const { isPending } = useCleanup();

  useEffect(() => {
    if (!isPending) {
      if (getResumableShares() == 0 && role == undefined) {
        setRole(ShareRole.Sender);
      }
      setLoading(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (role == ShareRole.Receiver) {
      if (!hubConnected) {
        hub.start();
        return;
      }

      if (reconnect != undefined) {
        const share = shares.get(reconnect);

        if (share) {
          hub.reconnectToShare(code!, share.reconnectToken, share.connectionId);
        }
      } else {
        hub.joinShare(code!);
      }

      setLoading(false);
    }
  }, [hubConnected, reconnect]);

  const updateTimer = () => {
    const start = useSessionStore.getState().startTime ?? Date.now();
    const elapsed = Date.now() - start;

    const sec = Math.floor((elapsed / 1000) % 60)
      .toString()
      .padStart(2, "0");
    const min = Math.floor((elapsed / 1000 / 60) % 60)
      .toString()
      .padStart(2, "0");

    setTimer(`${min}:${sec}`);
  };

  const shareFiles = async () => {
    if (sharedFiles.size < 1) return;

    setHide(true);
    await hub.start();
    await hub.createShare();
    window.setInterval(updateTimer, 500);
  };

  const downloadFiles = async () => {
    setHide(true);
    await hub.requestRtc();
    window.setInterval(updateTimer, 500);
  };

  const dataTransferredStats =
    dataTransferred.size > 0
      ? role == ShareRole.Receiver
        ? Array.from(dataTransferred.values())[0]
        : Array.from(dataTransferred.values()).reduce((b, a) => b + a, 0)
      : 0;

  const dataTransfer = fileSize(dataTransferredStats).split(" ");

  const fileCountStats =
    role == ShareRole.Receiver
      ? `${fileCount}/${sharedFileMetadata.length}`
      : `${fileCount}`;

  const duration = (Date.now() - (startTime ?? 0)) / 1000;
  const transSpeed = fileSize(dataTransferredStats / duration).split(" ");

  // const isResumable = () => {
  //   if (reconnect && role == ShareRole.Receiver && )
  // }

  return (
    <>
      <div className="flex justify-center text-center mt-4 md:pt-4">
        <Typography
          variant="h4"
          className="text-2xl md:text-3xl transition-[font-size] duration-300"
        >
          Easy Peer To Peer File Sharing
        </Typography>
      </div>
      <div className="flex flex-col md:flex-row mt-4 md:justify-around">
        <div
          className={
            "flex-1 transition-[padding] duration-300 min-[500px]:px-6 sm:px-10 md:px-6 lg:px-8 xl:px-10 " +
            (hide ? "md:flex-[0_0_50%]" : "md:flex-[0_0_80%]")
          }
        >
          {loading ? (
            <div className="flex flex-col min-h-[50vh] h-full justify-around place-items-center">
              <CircularProgress />
            </div>
          ) : getResumableShares() && role == undefined ? (
            <>
              <ShareSelector />
            </>
          ) : (
            <>
              <FileSelector />
              <div className="flex flex-col w-full items-center my-4">
                {role == ShareRole.Sender ? (
                  <>
                    {code == undefined ? (
                      <>
                        {hide ? (
                          <CircularProgress />
                        ) : (
                          <Button
                            className="w-[30%]"
                            variant="contained"
                            size="large"
                            onClick={shareFiles}
                          >
                            Share
                          </Button>
                        )}
                      </>
                    ) : (
                      <OutlinedInput
                        size="small"
                        sx={{ minWidth: "50%" }}
                        onChange={(e) => {
                          e.preventDefault();
                        }}
                        value={
                          code
                            ? formatShareLink(document.location, code)
                            : "Click Share to Generate a Link!"
                        }
                        disabled={code == undefined}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => {
                                if (!code) return;
                                window.navigator.clipboard.writeText(
                                  formatShareLink(document.location, code)
                                );
                                const message = (
                                  <Typography variant="body2">
                                    Copied share link...
                                  </Typography>
                                );
                                const key = enqueueSnackbar(message, {
                                  SnackbarProps: {
                                    onClick: () => {
                                      closeSnackbar(key);
                                    },
                                  },
                                });
                              }}
                              edge="end"
                            >
                              <ContentCopy />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    )}
                  </>
                ) : (
                  <>
                    {hide ? (
                      <></>
                    ) : (
                      <Button
                        className="w-[30%] mt-4"
                        variant="contained"
                        size="large"
                        onClick={downloadFiles}
                        disabled={sharedFileMetadata.length < 1}
                      >
                        Download
                      </Button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {hide && (
          <div className="min-w-[50%] space-y-4 my-auto">
            <div className="flex place-content-center items-center space-x-4">
              <LiveIcon />
              <Typography className="text-center" variant="h5">
                Live Statistics
              </Typography>
            </div>
            {/* Sender: Peers connected, total transfer speed, total file count, time elapsed */}
            {/* Receiver: Transfer speed, file count, time elapsed */}
            <div className="flex place-content-center space-x-4 md:space-x-10">
              <StatsCard
                icon={<Speed fontSize="medium" />}
                stat={
                  <>
                    <Typography variant="h6" display="inline">
                      {transSpeed[0]}{" "}
                    </Typography>
                    <Typography variant="body2" display="inline">
                      {transSpeed[1]}
                    </Typography>
                  </>
                }
                title="Transfer Speed"
              />
              <StatsCard
                icon={<DataUsage fontSize="medium" />}
                stat={
                  <>
                    <Typography variant="h6" display="inline">
                      {dataTransfer[0]}{" "}
                    </Typography>
                    <Typography variant="body2" display="inline">
                      {dataTransfer[1]}
                    </Typography>
                  </>
                }
                title="Data Transferred"
                variant="body1"
              />
            </div>
            <div className="flex place-content-center space-x-4 md:space-x-10">
              {role == ShareRole.Sender && (
                <StatsCard
                  icon={<People fontSize="medium" />}
                  stat={useConnectivityStore.getState().nameless.size}
                  title="Peers Connected"
                />
              )}
              <StatsCard
                icon={<FileCopy fontSize="medium" />}
                stat={fileCountStats}
                title="File Count"
              />
              <StatsCard
                icon={<Timer fontSize="medium" />}
                stat={timer}
                title="Time Elapsed"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export { Home };
