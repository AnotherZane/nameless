import { IMessagePackable } from "../interfaces";

class FileMetadata implements IMessagePackable {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly size: number,
    readonly type: string,
    readonly path?: string
  ) {}

  public serialize() {
    return [this.id, this.name, this.size, this.type, this.path];
  }

  static fromArray(array: unknown[]) {
    const arr = array as [
      id: number,
      name: string,
      size: number,
      type: string,
      path: string | undefined
    ];
    return new FileMetadata(...arr);
  }

  static fromFile(id: number, file: File) {
    return new FileMetadata(
      id,
      file.name,
      file.size,
      file.type,
      file.webkitRelativePath
    );
  }
}

export { FileMetadata };
