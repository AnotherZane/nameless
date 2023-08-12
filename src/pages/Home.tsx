import React from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";

declare global {
  interface Window {
    webkitRequestFileSystem: (
      type: number,
      size: number,
      successCallback: (fs: FileSystem) => void,
      errorCallback?: (e: any) => void
    ) => undefined;
  }

  interface FileWriter {
    write: (data: any) => void;
    length: number;
    position: number;
  }

  interface FileSystemFileEntry {
    createWriter: (successCallback: (writer: FileWriter) => void) => void;
  }
}

const webRTCConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

function Home() {
  const [connection, setConnection] = useState<HubConnection>();
  const [uid, setUid] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const [dataChannel, setDataChannel] = useState<RTCDataChannel>();

  const [dirCheck, setDirCheck] = useState<boolean>(false);

  useEffect(() => {
    setUid(Math.floor(Math.random() * 10000));

    const conn = new HubConnectionBuilder()
      .withUrl("https://localhost:5129/hub")
      .build();
    setConnection(conn);
  }, []);

  useEffect(() => {
    if (!peerConnection) return;

    peerConnection.ondatachannel = (event) => {
      console.log("Data channel received");
      console.log(event.channel);

      setDataChannel(event.channel);
    };

    peerConnection.onicecandidate = (event) => {
      if (!connection || !event.candidate) return;

      console.log("New ice candidate", event.candidate);

      connection.send("newIceCandidate", JSON.stringify(event.candidate));
    };
  }, [peerConnection]);

  useEffect(() => {
    if (!dataChannel) return;

    dataChannel.onopen = () => {
      console.log("Data channel opened");
      console.log(dataChannel);

      if (!fileRef.current) return;

      const file = fileRef.current.files?.[0];
      if (!file) return;

      dataChannel.send(file.name);
    };

    dataChannel.onmessage = (event) => {
      console.log("Data channel message received", event);
    };

    dataChannel.onclose = () => {
      console.log("Data channel closed");
    };
  }, [dataChannel]);

  useEffect(() => {
    if (!connection) return;

    if (connection.state === "Disconnected") {
      // connection.start().catch((err) => console.log(err));
    }

    connection.on("offerReceived", async (offer: string) => {
      if (!peerConnection) return;

      console.log("Offer received", offer);

      const ofr = new RTCSessionDescription(JSON.parse(offer));
      await peerConnection.setRemoteDescription(ofr);

      console.log("Creating answer");

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      await connection.send("sendAnswer", JSON.stringify(answer));

      console.log("Answer sent", answer);
    });

    connection.on("answerReceived", async (answer: string) => {
      if (!peerConnection) return;

      console.log("Answer received", answer);

      const ans = new RTCSessionDescription(JSON.parse(answer));
      await peerConnection.setRemoteDescription(ans);
    });

    connection.on("iceCandidateReceived", async (candidate: string) => {
      if (!peerConnection) return;

      console.log("Ice candidate received", candidate);

      await peerConnection.addIceCandidate(JSON.parse(candidate));
    });
  }, [connection]);

  useEffect(() => {
    if (!fileRef.current) return;

    if (dirCheck) fileRef.current.setAttribute("webkitdirectory", "");
    else fileRef.current.removeAttribute("webkitdirectory");
  }, [dirCheck]);

  const sendOffer = async () => {
    if (!connection || !fileRef.current) return;

    const file = fileRef.current.files?.[0];
    if (!file) return;

    const peerConn = new RTCPeerConnection(webRTCConfig);
    setPeerConnection(peerConn);

    const dataChannel = peerConnection?.createDataChannel("fileTransfer");
    setDataChannel(dataChannel);

    console.log("Data channel created", dataChannel);

    const offer = await peerConnection?.createOffer();
    await peerConnection?.setLocalDescription(offer);

    console.log("Offer created", offer);

    await connection.send("sendOffer", JSON.stringify(offer));
  };

  const testFileStorage = async () => {
    if (!fileRef.current) return;

    if (fileRef.current.files == null || fileRef.current.files?.length === 0) {
      console.log("No files selected");
      return;
    }

    if (!window.webkitRequestFileSystem) {
      window.alert("Your browser does not support file system.");
    }

    const files: File[] = [];

    for (let i = 0; i < fileRef.current.files.length; i++)
      files.push(fileRef.current.files[i]);

    const totalSize = files.map(f => f.size).reduce((partialSum, a) => partialSum + a, 0);

    window.webkitRequestFileSystem(
      1,
      totalSize,
      (fs) => {
        fs.root.getDirectory(
          "nameless",
          {
            create: true,
          },
          (dir) => {
            const namelessDir = dir as FileSystemDirectoryEntry;

            for (const file of files) {
              namelessDir.getFile(file.name, { create: true }, (entry) => {
                const f = entry as FileSystemFileEntry;

                f.createWriter((writer) => {
                  writer.write(file);
                });

                console.log("Wrote file to file system: ", file.name);
              });
            }

            console.log("Reading file system entries...");

            const dirReader = namelessDir.createReader();

            dirReader.readEntries((entries) => {
              entries.forEach((entry) => console.log("Found entry: ", entry));
            });
          }
        );
      },
      (e) => console.log(e)
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold">Nameless Share</h1>
      <div className="flex flex-col items-center">
        <span>
          <input
            type="checkbox"
            checked={dirCheck}
            onChange={() => setDirCheck(!dirCheck)}
          />
          Use Directory
        </span>
        <input className="m-4" type="file" ref={fileRef} multiple />
        <Button variant="outlined" size="small" onClick={testFileStorage}>
          Share
        </Button>
      </div>
    </div>
  );
}

export default Home;
