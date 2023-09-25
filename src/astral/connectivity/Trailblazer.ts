import {
  useConnectivityStore,
  useReceiverStore,
  useSenderStore,
  useShareStore,
} from "../../state";
import { ITrailblazeMessage } from "../interfaces";
import {
  FilesRequestTrailblazeMessage,
  FileChunkTrailblazeMessage,
  FileTrailblazeMessage,
  HandshakeTrailblazeMessage,
} from "../models/trailblaze";
import { ShareRole, TrailblazeMessageType } from "../enums";
import streamSaver from "streamsaver";

const DefaultIceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.services.mozilla.com:3478" },
];

const MAX_CHUNK_SIZE = 262144;
const DEFAULT_MESSAGE_SIZE = 65536;
const CHUNK_META_SIZE = 5;
const DEFAULT_HIGH_WATERMARK = 1048576;

class Trailblazer {
  private connection: RTCPeerConnection;
  private channel?: RTCDataChannel;
  private connectionId: string;
  private pendingIceCandidates: RTCIceCandidate[];

  private maxMessageSize: number;
  private fileDataSize: number;
  private lowWaterMark: number;
  private highWaterMark: number;

  private queue: ITrailblazeMessage[];
  private sendLocked: boolean;
  private timeoutHandle: number | null;
  private requestedFiles: number[];

  private currentFileId: number;

  private lastChunkReceived: number;
  private writer: WritableStreamDefaultWriter | null;

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

    this.writer = null;
  }

  public updateConfig = (config: RTCConfiguration) =>
    this.connection.setConfiguration(config);

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

  private sendFile = async (id: number) => {
    if (!this.channel) throw new Error("RTC Data Channel is undefined.");
    const file = useSenderStore.getState().sharedFiles.get(id);

    if (!file) {
      console.error("Can't find file in state");
      return;
    }

    const fileChunks = Math.ceil(file.size / this.fileDataSize);
    let chunk = 0;

    const listener = async (e: unknown) => {
      console.log("Chunks:", chunk);
      console.log("BufferedAmountLow event:", e);
      await _internalSendFile();
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

    const start = new FileTrailblazeMessage(
      TrailblazeMessageType.FILE_START,
      id
    );
    this.sendMessage(start);

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
    if (useShareStore.getState().role == ShareRole.Receiver) {
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

  private handleChannelMessage = (ev: MessageEvent<ArrayBuffer>) => {
    console.log(ev);
    const data = new Uint8Array(ev.data);
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

        console.log(this.channel!.bufferedAmountLowThreshold);

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

        if (useShareStore.getState().role != ShareRole.Receiver) return;
        const files = useReceiverStore.getState().sharedMetadata;

        this.sendMessage(
          new FilesRequestTrailblazeMessage(files.map((f) => f.id))
        );

        break;
      }
      case TrailblazeMessageType.REQUEST_FILES: {
        const filesRequest = FilesRequestTrailblazeMessage.fromArray(data);
        if (filesRequest.ids.length < 1) return;

        this.requestedFiles.push(...filesRequest.ids);

        console.log(this.requestedFiles);

        if (this.currentFileId == 0) {
          this.currentFileId = this.requestedFiles.shift()!;
          this.sendFile(this.currentFileId);
        }

        break;
      }
      case TrailblazeMessageType.FILE_START: {
        const id = FileTrailblazeMessage.fromArray(data).id;
        const meta = useReceiverStore
          .getState()
          .sharedMetadata.find((x) => x.id == id);

        if (!meta) {
          console.error("Unknown file...");
          return;
        }

        this.currentFileId = id;

        streamSaver.mitm = "/stream/mitm.html";
        const stream = streamSaver.createWriteStream(meta.name, {
          size: meta.size,
        });

        this.writer = stream.getWriter();

        break;
      }
      case TrailblazeMessageType.FILE_CHUNK: {
        if (this.currentFileId == 0) return;

        const chunkMsg = FileChunkTrailblazeMessage.fromArray(data);

        this.lastChunkReceived += 1;

        console.log("Writing", this.lastChunkReceived);
        this.writer!.write(chunkMsg.data);
        break;
      }
      case TrailblazeMessageType.FILE_END: {
        const id = FileTrailblazeMessage.fromArray(data).id;

        console.log("Ended: " + id);
        this.writer!.close();

        const ack = new FileTrailblazeMessage(
          TrailblazeMessageType.FILE_ACK,
          this.currentFileId
        );
        this.sendMessage(ack);

        this.writer = null;
        this.currentFileId = 0;
        break;
      }
      case TrailblazeMessageType.FILE_ACK: {
        console.log("Ack Received");
        if (this.requestedFiles.length > 0) {
          this.currentFileId = this.requestedFiles.shift()!;
          console.log("Sending next file");
          this.sendFile(this.currentFileId);
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
