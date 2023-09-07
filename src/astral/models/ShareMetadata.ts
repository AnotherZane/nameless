import IMessagePackable from "../interfaces/IMessagePackable";

class ShareMetadata implements IMessagePackable {
  private constructor(readonly code: string, readonly reconnectToken: string) {}

  public serialize() {
    return [this.code, this.reconnectToken];
  }

  static fromArray(array: unknown[]) {
    const arr = array as [code: string, reconnectToken: string];
    return new ShareMetadata(...arr);
  }
}

export { ShareMetadata };
