import { IMessagePackable } from "../interfaces";

class FileMetadata implements IMessagePackable {
  readonly chunk_count: number;

  constructor(
    readonly id: number,
    readonly name: string,
    readonly size: number,
    readonly type: string,
    readonly path?: string
  ) {
    // 65527 = 65536 - 9 bytes, chunk metadata size
    this.chunk_count = Math.ceil(size / 65527);
  }

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
