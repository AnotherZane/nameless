import { TrailblazeMessageType } from "../enums";

interface ITrailblazeMessage {
  readonly type: TrailblazeMessageType;

  serialize: () => Uint8Array;
}

export type { ITrailblazeMessage };
