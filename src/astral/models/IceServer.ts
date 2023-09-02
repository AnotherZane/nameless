import IMessagePackable from "../interfaces/IMessagePackable";

class IceServer implements IMessagePackable {
  readonly urls: string[];
  readonly username: string;
  readonly credentials: string;

  constructor(urls: string[], username: string, credentials: string) {
    this.urls = urls;
    this.username = username;
    this.credentials = credentials;
  }

  public serialize() {
    return [this.urls, this.username, this.credentials];
  }

  static fromArray(array: unknown[]) {
    const arr = array as [
      urls: string[],
      username: string,
      credentials: string
    ];
    return new IceServer(...arr);
  }
}

export { IceServer };
