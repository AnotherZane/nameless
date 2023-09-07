import IMessagePackable from "../interfaces/IMessagePackable";

class SessionDescription implements RTCSessionDescription, IMessagePackable {
  private constructor(readonly sdp: string, readonly type: RTCSdpType) {}

  public toJSON() {
    return JSON.stringify(this);
  }

  public serialize() {
    return [this.sdp, this.type];
  }

  static fromArray(array: unknown[]) {
    const arr = array as [sdp: string, type: RTCSdpType];
    return new SessionDescription(...arr);
  }

  static fromInit(sd: RTCSessionDescriptionInit) {
    return new SessionDescription(sd.sdp ?? "", sd.type);
  }
}

export { SessionDescription };
