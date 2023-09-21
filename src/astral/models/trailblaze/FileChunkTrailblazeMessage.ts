import { TrailblazeMessageType } from "../../enums";
import { ITrailblazeMessage } from "../../interfaces";

class FileChunkTrailblazeMessage implements ITrailblazeMessage {
  readonly type: TrailblazeMessageType = TrailblazeMessageType.FILE_CHUNK;

  constructor(readonly data: Uint8Array) {}

  public serialize() {
    const array = new Uint8Array(1 + this.data.buffer.byteLength);

    array.set(new Uint8Array([this.type]), 0);
    array.set(this.data, 1);

    return array;
  }

  static fromArray(array: Uint8Array) {
    if (array[0] != TrailblazeMessageType.FILE_CHUNK)
      throw new Error("Invalid trailblaze message type");

    return new FileChunkTrailblazeMessage(new Uint8Array(array.buffer, 1));
  }
}

export { FileChunkTrailblazeMessage };
