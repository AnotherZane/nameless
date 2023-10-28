import { IDownloader } from "../interfaces";
import streamSaver from "streamsaver";

class StreamDownloader implements IDownloader {
  private writer: WritableStreamDefaultWriter;

  constructor(name: string, size: number) {
    streamSaver.mitm = "/stream/mitm.html";
    const stream = streamSaver.createWriteStream(name, {
      size: size,
    });

    this.writer = stream.getWriter();
  }

  public init = () => Promise.resolve(true);

  public write = (data: Uint8Array) => {
    this.writer.write(data);
  };

  public finish = () => {
    this.writer.close();
  };
}

export { StreamDownloader };
