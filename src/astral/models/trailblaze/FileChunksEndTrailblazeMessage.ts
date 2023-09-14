import { TrailblazeMessageType } from "../../enums";
import { ITrailblazeMessage } from "../../interfaces";

class FileChunksEndTrailblazeMessage implements ITrailblazeMessage {
  readonly type: TrailblazeMessageType = TrailblazeMessageType.FILE_CHUNKS_END;

  constructor(readonly id: number) {}

  public serialize() {
    const file_ids = new Uint32Array([this.id]);
    const array = new Uint8Array(1 + 4);

    array.set(new Uint8Array([this.type]), 0);
    array.set(new Uint8Array(file_ids.buffer), 1);

    return array;
  }

  static fromArray(array: Uint8Array) {
    if (array[0] != TrailblazeMessageType.FILE_CHUNKS_END)
      throw new Error("Invalid trailblaze message type");

    const file_id = new Uint32Array(array.slice(1).buffer);
    return new FileChunksEndTrailblazeMessage(file_id[0]);
  }
}

export { FileChunksEndTrailblazeMessage };
