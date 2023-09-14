import { TrailblazeMessageType } from "../../enums";
import { ITrailblazeMessage } from "../../interfaces";

class HandshakeTrailblazeMessage implements ITrailblazeMessage {
  constructor(readonly type: TrailblazeMessageType, readonly size: number) {
    if (type > 1) throw Error("Invalid basic trailblaze message type: " + type);
  }

  public serialize() {
    const size = new Uint32Array([this.size]);
    const array = new Uint8Array(5);

    array.set(new Uint8Array([this.type]), 0);
    array.set(new Uint8Array(size.buffer), 1);

    return array;
  }

  static fromArray(array: Uint8Array) {
    const type = array[0] as TrailblazeMessageType;
    const size = new Uint32Array(array.slice(1).buffer)[0];

    return new HandshakeTrailblazeMessage(type, size);
  }
}

export { HandshakeTrailblazeMessage };
