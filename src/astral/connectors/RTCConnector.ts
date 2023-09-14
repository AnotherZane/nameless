import { useConnectorStore, useTrailblazeStore } from "../../state";
import { ITrailblazeMessage } from "../interfaces";
import {
  FilesRequestTrailblazeMessage,
  FileChunkTrailblazeMessage,
  FileChunksEndTrailblazeMessage,
  HandshakeTrailblazeMessage,
} from "../models/trailblaze";
import { TrailblazeMessageType } from "../enums";

const DefaultRTCConfiguration: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com:3478" },
  ],
};

class RTCConnector {
  private connection: RTCPeerConnection;
  private channel?: RTCDataChannel;
  private connectionId: string;
  private remoteDescribed: boolean;
  private pendingIceCandidates: RTCIceCandidate[];
  private queue: ITrailblazeMessage[];
  private maxMessageSize = 65536; // default, 64 kb
  private fileDataSize = 65527;
  private lowWaterMark = this.maxMessageSize; // A single chunk
  private highWaterMark = this.maxMessageSize * 8; //, 1048576);
  private timeoutHandle: number | null = null;

  constructor(
    connectionId: string,
    config: RTCConfiguration = DefaultRTCConfiguration
  ) {
    this.connection = new RTCPeerConnection(config);
    this.connectionId = connectionId;
    this.registerConnectionEvents();
    this.remoteDescribed = false;
    this.pendingIceCandidates = [];
    this.queue = [];
  }

  public updateConfig = (config: RTCConfiguration) =>
    this.connection.setConfiguration(config);

  public createOffer = async () => {
    this.channel = this.connection.createDataChannel("nameless", {
      ordered: true,
    });
    this.channel.binaryType = "arraybuffer";
    this.registerChannelEvents();

    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    return offer;
  };

  public createAnswer = async (offer: RTCSessionDescription) => {
    await this.connection.setRemoteDescription(offer);

    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);

    this.remoteDescribed = true;
    await this.addPendingIceCandidates();

    return answer;
  };

  public setAnswer = async (answer: RTCSessionDescription) => {
    await this.connection.setRemoteDescription(answer);

    this.remoteDescribed = true;
    await this.addPendingIceCandidates();
  };

  public addIceCandidate = async (candidate: RTCIceCandidate) => {
    if (this.remoteDescribed) {
      await this.connection.addIceCandidate(candidate);
    } else {
      this.pendingIceCandidates.push(candidate);
    }
  };

  public sendMessage = (msg: ITrailblazeMessage) => {
    this.queue.push(msg);
    this._internalSend();
  };

  public sendFile = async (id: number, file: File) => {
    const fileChunks = Math.ceil(file.size / 65527);
    let chunk = 0;

    const _internalSendFile = async () => {
      if (!this.channel) throw new Error("RTC Data Channel is undefined.");

      if (this.timeoutHandle !== null) {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = null;
      }

      // Make sure we don't flood the channel buffer
      let bufferedAmount = this.channel.bufferedAmount;

      while (chunk != fileChunks) {
        const chunk_size =
          (chunk + 1) * this.fileDataSize < file.size
            ? (chunk + 1) * this.fileDataSize
            : file.size;

        const slice = file.slice(chunk * this.fileDataSize, chunk_size);
        const fileData = await slice.arrayBuffer();
        const bytes = new Uint8Array(fileData);

        const msg = new FileChunkTrailblazeMessage(id, chunk, bytes);

        this.channel.send(msg.serialize());

        chunk += 1;
        bufferedAmount += this.maxMessageSize;

        // Pause sending if we reach the high water mark
        if (bufferedAmount >= this.highWaterMark) {
          // This is a workaround due to the bug that all browsers are incorrectly calculating the
          // amount of buffered data. Therefore, the 'bufferedamountlow' event would not fire.
          if (this.channel.bufferedAmount < this.lowWaterMark) {
            this.timeoutHandle = window.setTimeout(
              () => this._internalSend(),
              0
            );
          }
          console.log(
            `Paused sending, buffered amount: ${bufferedAmount} (announced: ${this.channel.bufferedAmount})`
          );
          break;
        }
      }
    };

    await _internalSendFile();
  };

  private _internalSend = () => {
    if (!this.channel) throw new Error("RTC Data Channel is undefined.");

    if (this.timeoutHandle !== null) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }

    // Make sure we don't flood the channel buffer
    let bufferedAmount = this.channel.bufferedAmount;

    while (this.queue.length > 0) {
      const msg = this.queue.shift();
      if (!msg) break;
      const data = msg.serialize();

      this.channel.send(msg.serialize());

      bufferedAmount += data.length;

      // Pause sending if we reach the high water mark
      if (bufferedAmount >= this.highWaterMark) {
        // This is a workaround due to the bug that all browsers are incorrectly calculating the
        // amount of buffered data. Therefore, the 'bufferedamountlow' event would not fire.
        if (this.channel.bufferedAmount < this.lowWaterMark) {
          this.timeoutHandle = window.setTimeout(() => this._internalSend(), 0);
        }
        console.log(
          `Paused sending, buffered amount: ${bufferedAmount} (announced: ${this.channel.bufferedAmount})`
        );
        break;
      }
    }

    // const send = () => {
    //   if (!this.channel) throw new Error("RTC Data Channel is undefined.");
    //   console.log(
    //     this.channel.bufferedAmount,
    //     this.channel.bufferedAmountLowThreshold
    //   );

    //   if (
    //     this.channel.bufferedAmount > this.channel.bufferedAmountLowThreshold
    //   ) {
    //     // Wait for the buffer to have space before adding more data
    //     this.channel.onbufferedamountlow = () => {
    //       this.channel!.onbufferedamountlow = null;
    //       console.log("Trying to send again");
    //       send();
    //     };
    //     return;
    //   }

    // this.channel.send(msg.serialize());
    // };
  };

  private addPendingIceCandidates = async () => {
    for (let i = 0; i < this.pendingIceCandidates.length; i++) {
      const candidate = this.pendingIceCandidates[i];
      await this.connection.addIceCandidate(candidate);
    }

    this.pendingIceCandidates = [];
  };

  private registerConnectionEvents = () => {
    this.connection.onicecandidate = this.handleIceCandidate;
    this.connection.ondatachannel = this.handleDataChannel;
  };

  private registerChannelEvents = () => {
    if (!this.channel) return;

    this.channel.onopen = this.handleChannelOpen;
    this.channel.onmessage = this.handleChannelMessage;
    this.channel.onclosing = this.handleChannelClosing;
    this.channel.onclose = this.handleChannelClose;
    this.channel.onerror = this.handleChannelError;
  };

  private handleChannelOpen = (ev: Event) => {
    // const trailblaze = useTrailblazeStore.getState().client;
    // trailblaze.onConnected(this);

    const maxMessageSize =
      this.connection.sctp?.maxMessageSize ?? this.maxMessageSize;
    const msg = new HandshakeTrailblazeMessage(
      TrailblazeMessageType.PING,
      maxMessageSize
    );
    this.channel?.send(msg.serialize());

    // if (useShareStore.getState().role == ShareRole.Sender) {
    //   const files = useSenderStore.getState().sharedFiles;

    //   for (const file of files) {
    //     const dat = await file.arrayBuffer();
    //     const msg = encode({
    //       name: file.name,
    //       data: new Uint8Array(dat),
    //     });
    //     console.log(msg);
    //     this.channel?.send(msg);
    //   }
    // }
  };

  private handleChannelMessage = async (ev: MessageEvent<ArrayBuffer>) => {
    const data = new Uint8Array(ev.data);
    console.log(data);

    const trailblaze = useTrailblazeStore.getState().client;

    // byte 0 is always the type of message
    const type = data[0] as TrailblazeMessageType;
    console.log(type);

    switch (type) {
      case TrailblazeMessageType.PING: {
        const ping = HandshakeTrailblazeMessage.fromArray(data);

        let messageSize =
          this.connection.sctp?.maxMessageSize ?? this.maxMessageSize;

        if (messageSize > ping.size) messageSize = ping.size;

        this.maxMessageSize = messageSize;
        this.fileDataSize = messageSize - 9; // 9 = metadata size
        this.lowWaterMark = messageSize;
        this.highWaterMark = Math.min(messageSize * 8, 1048576);

        const msg = new HandshakeTrailblazeMessage(
          TrailblazeMessageType.PONG,
          messageSize
        );
        this.channel?.send(msg.serialize());
        break;
      }
      case TrailblazeMessageType.PONG: {
        const pong = HandshakeTrailblazeMessage.fromArray(data);
        this.maxMessageSize = pong.size;
        this.fileDataSize = pong.size - 9; // 9 = metadata size
        this.lowWaterMark = pong.size;
        this.highWaterMark = Math.min(pong.size * 8, 1048576);

        const trailblaze = useTrailblazeStore.getState().client;
        trailblaze.onReady(this);

        break;
      }
      case TrailblazeMessageType.REQUEST_FILES: {
        const filesRequest = FilesRequestTrailblazeMessage.fromArray(data);
        await trailblaze.onFilesRequest(this, filesRequest);
        break;
      }
      case TrailblazeMessageType.FILE_CHUNK: {
        const fileChunk = FileChunkTrailblazeMessage.fromArray(data);
        trailblaze.onFileChunk(this, fileChunk);
        break;
      }
      case TrailblazeMessageType.FILE_CHUNKS_END: {
        const id = FileChunksEndTrailblazeMessage.fromArray(data).id;
        trailblaze.onFileChunksEnd(this, id);
        break;
      }
    }

    // WORK ON CHUNKING, ENCODING, DECODING VIA WORKERS

    // if (useShareStore.getState().role == ShareRole.Receiver) {
    //   const msg = decode(ev.data as Uint8Array) as {
    //     name: string;
    //     data: ArrayBuffer;
    //   };
    //   console.log(msg.data);
    //   const file = new File([msg.data], msg.name);
    //   const url = window.URL.createObjectURL(file);
    //   const a = document.createElement("a");
    //   a.style.display = "none";
    //   a.href = url;
    //   a.download = msg.name;
    //   document.body.appendChild(a);
    //   a.click();
    //   window.URL.revokeObjectURL(url);
    // }
  };

  private handleChannelClosing = (ev: Event) => {
    console.log(ev);
  };

  private handleChannelClose = (ev: Event) => {
    console.log(ev);
  };

  private handleChannelError = (ev: Event) => {
    console.log(ev);
  };

  private handleIceCandidate = (ev: RTCPeerConnectionIceEvent) => {
    // console.log("Sending ice candidate:", ev.candidate);

    if (ev.candidate) {
      useConnectorStore
        .getState()
        .hub.sendIceCandidate(this.connectionId, ev.candidate);
    }
  };

  private handleDataChannel = (ev: RTCDataChannelEvent) => {
    this.channel = ev.channel;
    this.channel.binaryType = "arraybuffer";
    this.registerChannelEvents();
  };
}

export { RTCConnector, DefaultRTCConfiguration };
