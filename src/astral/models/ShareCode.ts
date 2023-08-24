import IMessagePackable from "../interfaces/IMessagePackable";

class ShareCode implements IMessagePackable {
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
    return new ShareCode(arr[0], arr[1]);
  }
}

export default ShareCode;
