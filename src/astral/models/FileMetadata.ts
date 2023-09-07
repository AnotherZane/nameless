import IMessagePackable from "../interfaces/IMessagePackable";

class FileMetadata implements IMessagePackable {
  constructor(
    readonly name: string,
    readonly size: number,
    readonly type: string,
    readonly path?: string
  ) {}

  public serialize() {
    return [this.name, this.size, this.type, this.path];
  }

  static fromArray(array: unknown[]) {
    const arr = array as [
      name: string,
      size: number,
      type: string,
      path: string | undefined
    ];
    return new FileMetadata(...arr);
  }

  static fromFile(file: File) {
    return new FileMetadata(
      file.name,
      file.size,
      file.type,
      file.webkitRelativePath
    );
  }
}

export { FileMetadata };
