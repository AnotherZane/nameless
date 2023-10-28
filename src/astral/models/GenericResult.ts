import { Reason } from "../enums";
import { IMessagePackable } from "../interfaces";

class GenericResult implements IMessagePackable {
  private constructor(
    readonly successful: boolean,
    readonly reason: Reason | undefined
  ) {}

  public serialize() {
    return [this.successful, this.reason];
  }

  static fromArray(array: unknown[]) {
    const arr = array as [successful: boolean, reason: Reason | undefined];
    return new GenericResult(...arr);
  }
}

export { GenericResult };
