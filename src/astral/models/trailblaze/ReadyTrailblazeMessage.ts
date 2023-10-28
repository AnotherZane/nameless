import { TrailblazeMessageType } from "../../enums";
import { ITrailblazeMessage } from "../../interfaces";

class ReadyTrailblazeMessage implements ITrailblazeMessage {
    readonly type = TrailblazeMessageType.RECEIVER_READY;

  public serialize() {
    const array = new Uint8Array(5);
    array.set(new Uint8Array([this.type]), 0);
    return array;
  }

  static instance = new ReadyTrailblazeMessage();
}

export { ReadyTrailblazeMessage };
