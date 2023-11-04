import { TrailblazeMessageType } from "../../enums";
import { ITrailblazeMessage } from "../../interfaces";

class FilesRequestTrailblazeMessage implements ITrailblazeMessage {
  readonly type: TrailblazeMessageType = TrailblazeMessageType.REQUEST_FILES;

  constructor(readonly ids: number[], readonly start: number = 0) {}

  public serialize() {
    const file_ids = new Uint32Array([this.start, ...this.ids]);
    const array = new Uint8Array(1 + file_ids.buffer.byteLength);

    array.set(new Uint8Array([this.type]), 0);
    array.set(new Uint8Array(file_ids.buffer), 1);

    return array;
  }

  static fromArray(array: Uint8Array) {
    if (array[0] != TrailblazeMessageType.REQUEST_FILES)
      throw new Error("Invalid trailblaze message type");

    const arr = Array.from(new Uint32Array(array.slice(1).buffer));
    const startPos = arr.shift();
    return new FilesRequestTrailblazeMessage(arr, startPos);
  }
}

export { FilesRequestTrailblazeMessage };
