import IMessagePackable from "../interfaces/IMessagePackable";

class IceServer implements IMessagePackable {
  private constructor(
    readonly urls: string | string[],
    readonly username: string,
    readonly credential: string
  ) {}

  public serialize() {
    return [this.urls, this.username, this.credential];
  }

  public toRTCIceServer() {
    return {
      urls: this.urls,
      username: this.username,
      credentials: this.credential,
    };
  }

  static fromArray(array: unknown[]) {
    const arr = array as [
      urls: string | string[],
      username: string,
      credential: string
    ];
    return new IceServer(...arr);
  }
}

export { IceServer };
