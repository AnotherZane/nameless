import IMessagePackable from "../interfaces/IMessagePackable";

class ShareMetadata implements IMessagePackable {
  readonly code: string;
  readonly reconnectToken: string;

  constructor(code: string, reconnectToken: string) {
    this.code = code;
    this.reconnectToken = reconnectToken;
  }

  public serialize() {
    return [this.code, this.reconnectToken];
  }

  static fromArray(array: unknown[]) {
    const arr = array as [code: string, reconnectToken: string];
    return new ShareMetadata(...arr);
  }
}

export { ShareMetadata };
