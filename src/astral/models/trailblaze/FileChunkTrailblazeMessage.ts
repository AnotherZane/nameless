import { TrailblazeMessageType } from "../../enums";
import { ITrailblazeMessage } from "../../interfaces";

class FileChunkTrailblazeMessage implements ITrailblazeMessage {
  readonly type: TrailblazeMessageType = TrailblazeMessageType.FILE_CHUNK;

  constructor(
    readonly id: number,
    readonly chunk: number,
    readonly data: Uint8Array
  ) {}

  public serialize() {
    const meta = new Uint32Array([this.id, this.chunk]);
    const array = new Uint8Array(1 + 8 + this.data.buffer.byteLength);

    array.set(new Uint8Array([this.type]), 0);
    array.set(new Uint8Array(meta.buffer), 1);
    array.set(this.data, 9);

    return array;
  }

  static fromArray(array: Uint8Array) {
    if (array[0] != TrailblazeMessageType.FILE_CHUNK)
      throw new Error("Invalid trailblaze message type");

    const meta = new Uint32Array(array.slice(1, 9).buffer);

    return new FileChunkTrailblazeMessage(meta[0], meta[1], array.slice(9));
  }
}

export { FileChunkTrailblazeMessage };
