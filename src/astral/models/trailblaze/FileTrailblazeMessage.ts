import { TrailblazeMessageType } from "../../enums";
import { ITrailblazeMessage } from "../../interfaces";

class FileTrailblazeMessage implements ITrailblazeMessage {
  constructor(readonly type: TrailblazeMessageType, readonly id: number) {
    if (
      type != TrailblazeMessageType.FILE_START &&
      type != TrailblazeMessageType.FILE_END &&
      type != TrailblazeMessageType.FILE_ACK
    )
      throw Error("Invalid file trailblaze message type: " + type);
  }

  public serialize() {
    const file_id = new Uint32Array([this.id]);
    const array = new Uint8Array(1 + 4);

    array.set(new Uint8Array([this.type]), 0);
    array.set(new Uint8Array(file_id.buffer), 1);

    return array;
  }

  static fromArray(array: Uint8Array) {
    const type = array[0] as TrailblazeMessageType;

    const file_id = new Uint32Array(array.slice(1).buffer);
    return new FileTrailblazeMessage(type, file_id[0]);
  }
}

export { FileTrailblazeMessage };
