import { IMessagePackable } from "../interfaces";

class ShareMetadata implements IMessagePackable {
  private constructor(
    readonly code: string,
    readonly reconnectToken: string,
    // readonly ownerId: string
  ) {}

  public serialize() {
    return [this.code, this.reconnectToken];
  }

  static fromArray(array: unknown[]) {
    const arr = array as [
      code: string,
      reconnectToken: string,
      // ownerId: string
    ];
    return new ShareMetadata(...arr);
  }
}

export { ShareMetadata };
