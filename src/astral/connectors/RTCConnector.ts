import {
  useConnectorStore,
  useShareStore,
  useTrailblazeStore,
} from "../../state";
import { ITrailblazeMessage } from "../interfaces";
import {
  FilesRequestTrailblazeMessage,
  FileChunkTrailblazeMessage,
  FileChunksEndTrailblazeMessage,
  HandshakeTrailblazeMessage,
} from "../models/trailblaze";
import { ShareRole, TrailblazeMessageType } from "../enums";

const DefaultRTCConfiguration: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com:3478" },
  ],
};

const MAX_CHUNK_SIZE = 262144;

class RTCConnector {
  private connection: RTCPeerConnection;
  private channel?: RTCDataChannel;
  private connectionId: string;
  private remoteDescribed: boolean;
  private pendingIceCandidates: RTCIceCandidate[];
  private queue: ITrailblazeMessage[];
  private maxMessageSize: number;
  private fileDataSize: number;
  private lowWaterMark: number;
  private highWaterMark: number;
  private timeoutHandle: number | null;

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
    this.maxMessageSize = 65536; // default, 64 kb
    this.fileDataSize = this.maxMessageSize - 9;
    this.lowWaterMark = this.maxMessageSize;
    this.highWaterMark = Math.min(this.maxMessageSize * 8, 1048576);
    this.timeoutHandle = null;
  }

  public updateConfig = (config: RTCConfiguration) =>
    this.connection.setConfiguration(config);

  public createOffer = async () => {
    this.channel = this.connection.createDataChannel("nameless", {
      ordered: true,
    });
    this.channel.binaryType = "arraybuffer";
    this.channel.bufferedAmountLowThreshold = 65536;
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
    if (!this.channel) throw new Error("RTC Data Channel is undefined.");

    const fileChunks = Math.ceil(file.size / this.fileDataSize);
    let chunk = 0;

    const listener = async (e: any) => {
      console.log("Chunks:", chunk);
      console.log("BufferedAmountLow event:", e);
      await _internalSendFile();
    };

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
        const msgBytes = msg.serialize();
        this.channel.send(msgBytes);

        chunk += 1;
        bufferedAmount += msgBytes.length;
        // console.log(bufferedAmount, this.channel.bufferedAmount);

        // Pause sending if we reach the high water mark
        if (bufferedAmount >= this.highWaterMark) {
          // This is a workaround due to the bug that all browsers are incorrectly calculating the
          // amount of buffered data. Therefore, the 'bufferedamountlow' event would not fire.
          if (this.channel.bufferedAmount <= this.lowWaterMark) {
            this.timeoutHandle = window.setTimeout(
              async () => await _internalSendFile(),
              0
            );
          }
          console.log(
            `Paused sending, buffered amount: ${bufferedAmount} (announced: ${this.channel.bufferedAmount})`
          );
          break;
        }
      }

      if (chunk == fileChunks) {
        this.channel.removeEventListener("bufferedamountlow", listener);
        const msg = new FileChunksEndTrailblazeMessage(id);
        this.channel.send(msg.serialize());
      }
    };

    this.channel.addEventListener("bufferedamountlow", listener);
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
          console.log("AA");
          this.timeoutHandle = window.setTimeout(
            async () => await this._internalSend(),
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

  private handleChannelOpen = () => {
    if (useShareStore.getState().role == ShareRole.Receiver) {
      const maxMessageSize = Math.min(
        this.connection.sctp?.maxMessageSize ?? this.maxMessageSize,
        MAX_CHUNK_SIZE
      );
      const msg = new HandshakeTrailblazeMessage(
        TrailblazeMessageType.PING,
        maxMessageSize
      );
      this.channel?.send(msg.serialize());
    }
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

        let messageSize = Math.min(
          this.connection.sctp?.maxMessageSize ?? this.maxMessageSize,
          MAX_CHUNK_SIZE
        );

        if (messageSize > ping.size) messageSize = ping.size;

        this.maxMessageSize = messageSize;
        this.fileDataSize = messageSize - 9; // 9 = metadata size
        this.lowWaterMark = messageSize;
        this.highWaterMark = Math.max(messageSize * 8, 1048576);
        this.channel!.bufferedAmountLowThreshold = this.lowWaterMark;

        console.log(this.channel!.bufferedAmountLowThreshold);

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
        this.highWaterMark = Math.max(pong.size * 8, 1048576);
        this.channel!.bufferedAmountLowThreshold = this.lowWaterMark;

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
    this.channel.bufferedAmountLowThreshold = 65536;
    this.registerChannelEvents();
  };
}

export { RTCConnector, DefaultRTCConfiguration };
