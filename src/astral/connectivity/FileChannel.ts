import { useReceiverStore, useSenderStore, useShareStore } from "../../state";
import { ShareRole } from "../enums";
import streamSaver from "streamsaver";

type FileChannelOptions = {
  messageSize: number;
  highWaterMark: number;
};

class FileChannel {
  private writer?: WritableStreamDefaultWriter;

  private lastChunkReceived: number;
  private timeoutHandle: number | null;
  private size: number;

  private sendLocked: boolean;

  constructor(
    private id: number,
    private channel: RTCDataChannel,
    private opts: FileChannelOptions
  ) {
    this.channel.binaryType = "arraybuffer";
    this.channel.bufferedAmountLowThreshold = opts.messageSize;
    this.registerChannelEvents();

    this.lastChunkReceived = -1;
    this.timeoutHandle = null;

    this.sendLocked = false;

    if (useShareStore.getState().role == ShareRole.Receiver) {
      const meta = useReceiverStore
        .getState()
        .sharedMetadata.find((x) => x.id == id);

      streamSaver.mitm = "/stream/mitm.html";
      const stream = streamSaver.createWriteStream(
        meta?.name ?? "Unknown File",
        {
          size: meta?.size,
          pathname: id + "/" + (meta?.name ?? "Unknown File"),
        }
      );

      this.writer = stream.getWriter();
      this.size = meta!.size;
    } else {
      const file = useSenderStore.getState().sharedFiles.get(id);
      this.size = file!.size;
    }
  }

  private registerChannelEvents = () => {
    this.channel.onopen = this.handleChannelOpen;
    this.channel.onmessage = this.handleChannelMessage;
    this.channel.onclosing = this.handleChannelClosing;
    this.channel.onclose = this.handleChannelClose;
    this.channel.onerror = this.handleChannelError;
  };

  private handleChannelOpen = (ev: Event) => {
    console.log("Channel opened: ", ev.target);

    if (useShareStore.getState().role == ShareRole.Sender) {
      this.handleSendFile();
    }
  };

  private handleChannelMessage = (ev: MessageEvent<ArrayBuffer>) => {
    const data = new Uint8Array(ev.data);

    this.lastChunkReceived += 1;

    console.log("Writing", this.lastChunkReceived, "for", this.id);
    this.writer!.write(data);

    if (
      this.lastChunkReceived + 1 ==
      Math.ceil(this.size / this.opts.messageSize)
    ) {
      this.writer!.close();
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

  private handleSendFile = async () => {
    const file = useSenderStore.getState().sharedFiles.get(this.id);

    if (!file) {
      console.log("no file on sender??");
      return;
    }

    const totalChunks = Math.ceil(file.size / this.opts.messageSize);
    let currentChunk = 0;

    const listener = async (e: unknown) => {
      console.log("Chunks:", currentChunk);
      console.log("BufferedAmountLow event:", e);
      await _internalSendFile();
    };

    const _internalSendFile = async () => {
      if (this.sendLocked) return;

      if (this.timeoutHandle !== null) {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = null;
      }

      // Make sure we don't flood the channel buffer
      let bufferedAmount = this.channel.bufferedAmount;

      this.sendLocked = true;
      while (currentChunk != totalChunks) {
        const chunk_end = (currentChunk + 1) * this.opts.messageSize;
        const chunk_size = chunk_end < file.size ? chunk_end : file.size;

        const slice = file.slice(
          currentChunk * this.opts.messageSize,
          chunk_size
        );
        const fileData = await slice.arrayBuffer();
        const bytes = new Uint8Array(fileData);
        this.channel.send(bytes);

        currentChunk += 1;
        bufferedAmount += bytes.length;

        // Pause sending if we reach the high water mark
        if (bufferedAmount >= this.opts.highWaterMark) {
          // This is a workaround due to the bug that all browsers are incorrectly calculating the
          // amount of buffered data. Therefore, the 'bufferedamountlow' event would not fire.
          if (this.channel.bufferedAmount <= this.opts.messageSize) {
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

      if (currentChunk == totalChunks) {
        this.channel.removeEventListener("bufferedamountlow", listener);
        // const msg = new FileChunksEndTrailblazeMessage(id);
        // this.channel.send(msg.serialize());
      }
    };

    this.channel.addEventListener("bufferedamountlow", listener);
    await _internalSendFile();
  };
}

export { FileChannel };
