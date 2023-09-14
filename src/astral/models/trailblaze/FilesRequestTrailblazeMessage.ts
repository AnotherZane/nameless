import { TrailblazeMessageType } from "../../enums";
import { ITrailblazeMessage } from "../../interfaces";

class FilesRequestTrailblazeMessage implements ITrailblazeMessage {
  readonly type: TrailblazeMessageType = TrailblazeMessageType.REQUEST_FILES;

  constructor(readonly ids: number[]) {}

  public serialize() {
    const file_ids = new Uint32Array(this.ids);
    const array = new Uint8Array(1 + file_ids.buffer.byteLength);

    array.set(new Uint8Array([this.type]), 0);
    array.set(new Uint8Array(file_ids.buffer), 1);

    return array;
  }

  static fromArray(array: Uint8Array) {
    if (array[0] != TrailblazeMessageType.REQUEST_FILES)
      throw new Error("Invalid trailblaze message type");

    const file_ids = new Uint32Array(array.slice(1).buffer);
    return new FilesRequestTrailblazeMessage(Array.from(file_ids));
  }
}

export { FilesRequestTrailblazeMessage };
