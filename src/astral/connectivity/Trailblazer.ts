import {
  useConnectivityStore,
  useReceiverStore,
  useSenderStore,
  useSessionStore,
  useShareStore,
} from "../../state";
import { IDownloader, ITrailblazeMessage } from "../interfaces";
import {
  FilesRequestTrailblazeMessage,
  FileChunkTrailblazeMessage,
  FileTrailblazeMessage,
  HandshakeTrailblazeMessage,
} from "../models/trailblaze";
import { ShareRole, TrailblazeMessageType } from "../enums";
import { createDownloader } from "../transfers";
import { ReadyTrailblazeMessage } from "../models/trailblaze/ReadyTrailblazeMessage";

const DefaultIceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.services.mozilla.com:3478" },
];

const MAX_CHUNK_SIZE = 262144;
const DEFAULT_MESSAGE_SIZE = 65536;
const CHUNK_META_SIZE = 1;
const DEFAULT_HIGH_WATERMARK = 1048576;

class Trailblazer {
  private connection: RTCPeerConnection;
  private channel?: RTCDataChannel;
  private connectionId: string;
  private pendingIceCandidates: RTCIceCandidate[];

  public maxMessageSize: number;
  public fileDataSize: number;
  private lowWaterMark: number;
  private highWaterMark: number;

  private queue: ITrailblazeMessage[];
  private sendLocked: boolean;
  private timeoutHandle: number | null;
  private requestedFiles: number[];

  private currentFileId: number;
  private chunkStart: number;

  private lastChunkReceived: number;
  private downloader: IDownloader | null;

  private _debug: HTMLDivElement;

  // public dataTransferred: number

  constructor(connectionId: string, iceServers: RTCIceServer[]) {
    iceServers.unshift(...DefaultIceServers);

    this.connection = new RTCPeerConnection({
      iceServers: iceServers,
    });
    this.connectionId = connectionId;
    this.registerConnectionEvents();
    this.pendingIceCandidates = [];

    this.maxMessageSize = DEFAULT_MESSAGE_SIZE;
    this.fileDataSize = this.maxMessageSize - CHUNK_META_SIZE;
    this.lowWaterMark = this.maxMessageSize;
    this.highWaterMark = Math.min(
      this.maxMessageSize * 8,
      DEFAULT_HIGH_WATERMARK
    );

    this.queue = [];
    this.sendLocked = false;
    this.timeoutHandle = null;
    this.lastChunkReceived = -1;
    this.requestedFiles = [];

    this.currentFileId = 0;
    this.chunkStart = 0;

    this.downloader = null;

    this._debug = window.document.getElementById("_debug")! as HTMLDivElement;

    // this.dataTransferred = 0;
  }

  public updateConfig = (config: RTCConfiguration) =>
    this.connection.setConfiguration(config);

  public close = () => {
    this.connection.close();
  };

  public createOffer = async () => {
    this.channel = this.connection.createDataChannel("nameless", {
      ordered: true,
    });
    this.channel.binaryType = "arraybuffer";
    this.channel.bufferedAmountLowThreshold = DEFAULT_MESSAGE_SIZE;
    this.registerChannelEvents();

    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    return offer;
  };

  public createAnswer = async (offer: RTCSessionDescription) => {
    await this.connection.setRemoteDescription(offer);

    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);
    await this.addPendingIceCandidates();

    return answer;
  };

  public setConnectionId = (id: string) => {
    this.connectionId = id;
  };

  public setAnswer = async (answer: RTCSessionDescription) => {
    await this.connection.setRemoteDescription(answer);
    await this.addPendingIceCandidates();
  };

  public addIceCandidate = async (candidate: RTCIceCandidate) => {
    if (this.connection.remoteDescription) {
      await this.connection.addIceCandidate(candidate);
    } else {
      this.pendingIceCandidates.push(candidate);
    }
  };

  public sendMessage = (msg: ITrailblazeMessage) => {
    if (!this.channel) throw new Error("RTC Data Channel is undefined.");
    this.queue.push(msg);

    const listener = (e: unknown) => {
      console.log("BufferedAmountLow event:", e);
      _internalSend();
    };

    const _internalSend = () => {
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
        this.channel.send(data);

        bufferedAmount += data.length;
        // this.dataTransferred += data.length;
        useSessionStore.getState().incrementTransfer(this.connectionId, data.length);

        // Pause sending if we reach the high water mark
        if (bufferedAmount >= this.highWaterMark) {
          // This is a workaround due to the bug that all browsers are incorrectly calculating the
          // amount of buffered data. Therefore, the 'bufferedamountlow' event would not fire.
          if (this.channel.bufferedAmount <= this.lowWaterMark) {
            this.timeoutHandle = window.setTimeout(() => _internalSend(), 0);
          }
          console.log(
            `Paused sending, buffered amount: ${bufferedAmount} (announced: ${this.channel.bufferedAmount})`
          );
          break;
        }
      }

      if (this.queue.length == 0) {
        this.channel.removeEventListener("bufferedamountlow", listener);
      }
    };

    this.channel.addEventListener("bufferedamountlow", listener);
    _internalSend();
  };

  private sendFile = async (id: number, chunk_start = 0) => {
    if (!this.channel) throw new Error("RTC Data Channel is undefined.");
    const file = useSenderStore.getState().sharedFiles.get(id);

    if (!file) {
      console.error("Can't find file in state");
      return;
    }

    const fileChunks = Math.ceil(file.size / this.fileDataSize);
    let chunk = chunk_start;

    const listener = async () => {
      if (this.channel?.readyState == "open") await _internalSendFile();
    };

    const _internalSendFile = async () => {
      if (this.sendLocked) return;
      if (!this.channel) throw new Error("RTC Data Channel is undefined.");

      if (this.timeoutHandle !== null) {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = null;
      }

      // Make sure we don't flood the channel buffer
      let bufferedAmount = this.channel.bufferedAmount;

      this.sendLocked = true;
      while (chunk != fileChunks) {
        const chunk_end = (chunk + 1) * this.fileDataSize;
        const chunk_size = chunk_end < file.size ? chunk_end : file.size;

        const slice = file.slice(chunk * this.fileDataSize, chunk_size);
        const fileData = await slice.arrayBuffer();
        const bytes = new Uint8Array(fileData);

        const msg = new FileChunkTrailblazeMessage(bytes);
        const msgBytes = msg.serialize();
        try {
          this.channel.send(msgBytes);
        } catch (e) {
          console.error(e);
          return;
        }

        chunk += 1;
        this._debug.innerText = `[Debug]\nChunks: ${chunk}`;

        bufferedAmount += msgBytes.length;
        // this.dataTransferred += msgBytes.length;
        useSessionStore.getState().incrementTransfer(this.connectionId, msgBytes.length);
        // console.log(bufferedAmount, this.channel.bufferedAmount);

        // Pause sending if we reach the high water mark
        if (bufferedAmount >= this.highWaterMark) {
          // This is a workaround due to the bug that all browsers are incorrectly calculating the
          // amount of buffered data. Therefore, the 'bufferedamountlow' event would not fire.
          if (this.channel.bufferedAmount <= this.lowWaterMark) {
            this.timeoutHandle = window.setTimeout(async () => {
              if (this.channel?.readyState == "open") await _internalSendFile();
            }, 0);
          }
          // console.log(
          //   `Paused sending, buffered amount: ${bufferedAmount} (announced: ${this.channel.bufferedAmount})`
          // );
          break;
        }
      }
      this.sendLocked = false;

      if (chunk == fileChunks) {
        this.channel.removeEventListener("bufferedamountlow", listener);
        const msg = new FileTrailblazeMessage(
          TrailblazeMessageType.FILE_END,
          id
        );
        this.channel.send(msg.serialize());
      }
    };

    this.channel.addEventListener("bufferedamountlow", listener);
    await _internalSendFile();
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
    if (useSessionStore.getState().role == ShareRole.Receiver) {
      const maxMessageSize = Math.min(
        this.connection.sctp?.maxMessageSize ?? this.maxMessageSize,
        MAX_CHUNK_SIZE
      );
      const msg = new HandshakeTrailblazeMessage(
        TrailblazeMessageType.PING,
        maxMessageSize
      );
      this.channel!.send(msg.serialize());
    }
  };

  private handleChannelMessage = async (ev: MessageEvent<ArrayBuffer>) => {
    // console.log(ev);
    const data = new Uint8Array(ev.data);
    useSessionStore.getState().incrementTransfer(this.connectionId, data.length);
    // console.log(data);

    // byte 0 is always the type of message
    const type = data[0] as TrailblazeMessageType;
    // console.log(type);

    switch (type) {
      case TrailblazeMessageType.PING: {
        const ping = HandshakeTrailblazeMessage.fromArray(data);

        let messageSize = Math.min(
          this.connection.sctp?.maxMessageSize ?? this.maxMessageSize,
          MAX_CHUNK_SIZE
        );

        if (messageSize > ping.size) messageSize = ping.size;

        this.maxMessageSize = messageSize;
        this.fileDataSize = messageSize - CHUNK_META_SIZE;
        this.lowWaterMark = messageSize;
        this.highWaterMark = Math.max(messageSize * 8, DEFAULT_HIGH_WATERMARK);
        this.channel!.bufferedAmountLowThreshold = this.lowWaterMark;

        const msg = new HandshakeTrailblazeMessage(
          TrailblazeMessageType.PONG,
          messageSize
        );
        this.channel!.send(msg.serialize());
        break;
      }
      case TrailblazeMessageType.PONG: {
        const pong = HandshakeTrailblazeMessage.fromArray(data);
        this.maxMessageSize = pong.size;
        this.fileDataSize = pong.size - CHUNK_META_SIZE;
        this.lowWaterMark = pong.size;
        this.highWaterMark = Math.max(pong.size * 8, DEFAULT_HIGH_WATERMARK);
        this.channel!.bufferedAmountLowThreshold = this.lowWaterMark;

        const ss = useSessionStore.getState();
        if (ss.role != ShareRole.Receiver) return;
        const rs = useReceiverStore.getState();
        const files = rs.sharedMetadata;

        if (ss.reconnect) {
          const sorted = files
            .filter((x) => rs.progress.get(x.id) != x.size)
            .sort((x) => rs.progress.get(x.id) ?? 0);

          const prog = rs.progress.get(sorted[0].id);

          this.requestedFiles = sorted.map((f) => f.id);

          this.sendMessage(
            new FilesRequestTrailblazeMessage(
              this.requestedFiles,
              prog && prog > 0
                ? Math.floor(prog / (this.fileDataSize))
                : 0
            )
          );
        } else {
          this.requestedFiles = files
            .sort((a, b) => a.size - b.size)
            .map((f) => f.id);

          this.sendMessage(
            new FilesRequestTrailblazeMessage(this.requestedFiles, 0)
          );
        }

        break;
      }
      case TrailblazeMessageType.REQUEST_FILES: {
        const filesRequest = FilesRequestTrailblazeMessage.fromArray(data);
        if (filesRequest.ids.length < 1) return;

        this.requestedFiles.push(...filesRequest.ids);

        if (filesRequest.start != 0) {
          this.chunkStart = filesRequest.start;
        }

        if (this.currentFileId == 0) {
          this.currentFileId = this.requestedFiles.shift()!;
          const start = new FileTrailblazeMessage(
            TrailblazeMessageType.FILE_READY,
            this.currentFileId
          );
          this.sendMessage(start);
        }

        break;
      }
      case TrailblazeMessageType.FILE_READY: {
        const id = FileTrailblazeMessage.fromArray(data).id;
        const rs = useReceiverStore.getState();
        const meta = rs.sharedMetadata.find((x) => x.id == id);

        if (!meta) {
          console.error("Unknown file...");
          return;
        }

        const prog = rs.progress.get(meta.id) ?? 0;
        this.lastChunkReceived = Math.floor(
          prog / (this.fileDataSize)
        );

        this.currentFileId = id;

        const state = useSessionStore.getState();

        if (prog == 0) {
          this.downloader = await createDownloader(
            meta,
            state.code!,
            state.id!
          );
        } else {
          this.downloader = await createDownloader(
            meta,
            state.code!,
            state.id!,
            this.lastChunkReceived * (this.fileDataSize)
          );
        }

        await this.downloader.init();
        await this.sendMessage(ReadyTrailblazeMessage.instance);

        break;
      }
      case TrailblazeMessageType.RECEIVER_READY: {
        this.sendFile(this.currentFileId, this.chunkStart);
        break;
      }
      case TrailblazeMessageType.FILE_CHUNK: {
        if (this.currentFileId == 0) return;

        const chunkMsg = FileChunkTrailblazeMessage.fromArray(data);

        this.lastChunkReceived += 1;

        // console.log("Writing", this.lastChunkReceived);
        this._debug.innerText = `[Debug]\nWriting: ${this.lastChunkReceived}`;
        // this.writer!.write(chunkMsg.data);
        this.downloader!.write(chunkMsg.data);
        break;
      }
      case TrailblazeMessageType.FILE_END: {
        const id = FileTrailblazeMessage.fromArray(data).id;

        console.log("Ended: " + id);
        // this.writer!.close();
        this.downloader!.finish();

        const ack = new FileTrailblazeMessage(
          TrailblazeMessageType.FILE_ACK,
          this.currentFileId
        );
        this.sendMessage(ack);

        const idx = this.requestedFiles.indexOf(id);

        if (idx > -1) {
          this.requestedFiles.splice(idx, 1);
        }

        const ss = useSessionStore.getState();

        console.log(this.requestedFiles);
        if (this.requestedFiles.length == 0) {
          ss.setTransferComplete(true);
          useShareStore.getState().deleteShare(ss.id!);
          window.onbeforeunload = null;
        }

        ss.incrementFileCount();

        // this.writer = null;
        this.downloader = null;
        this.currentFileId = 0;
        this.lastChunkReceived = -1;
        break;
      }
      case TrailblazeMessageType.FILE_ACK: {
        console.log("Ack Received");
        useSessionStore.getState().incrementFileCount();
        if (this.requestedFiles.length > 0) {
          this.currentFileId = this.requestedFiles.shift()!;
          this.chunkStart = 0;
          console.log("Sending next file");

          const start = new FileTrailblazeMessage(
            TrailblazeMessageType.FILE_READY,
            this.currentFileId
          );

          this.sendMessage(start);
        }
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
    if (ev.candidate) {
      useConnectivityStore
        .getState()
        .akivili.sendIceCandidate(this.connectionId, ev.candidate);
    }
  };

  private handleDataChannel = (ev: RTCDataChannelEvent) => {
    this.channel = ev.channel;
    this.channel.binaryType = "arraybuffer";
    this.channel.bufferedAmountLowThreshold = DEFAULT_MESSAGE_SIZE;
    this.registerChannelEvents();
  };
}

export { Trailblazer };
