import IMessagePackable from "../interfaces/IMessagePackable";

class IceCandidate implements RTCIceCandidate, IMessagePackable {
  constructor(
    readonly address: string | null,
    readonly candidate: string,
    readonly component: RTCIceComponent | null,
    readonly foundation: string | null,
    readonly port: number | null,
    readonly priority: number | null,
    readonly protocol: RTCIceProtocol | null,
    readonly relatedAddress: string | null,
    readonly relatedPort: number | null,
    readonly sdpMLineIndex: number | null,
    readonly sdpMid: string | null,
    readonly tcpType: RTCIceTcpCandidateType | null,
    readonly type: RTCIceCandidateType | null,
    readonly usernameFragment: string | null
  ) {}

  public toJSON() {
    return this as RTCIceCandidateInit;
  }

  public serialize() {
    return [
      this.address,
      this.candidate,
      this.component,
      this.foundation,
      this.port,
      this.priority,
      this.protocol,
      this.relatedAddress,
      this.relatedPort,
      this.sdpMLineIndex,
      this.sdpMid,
      this.tcpType,
      this.type,
      this.usernameFragment,
    ];
  }

  static fromArray(array: unknown[]) {
    const arr = array as [
      address: string | null,
      candidate: string,
      component: RTCIceComponent | null,
      foundation: string | null,
      port: number | null,
      priority: number | null,
      protocol: RTCIceProtocol | null,
      relatedAddress: string | null,
      relatedPort: number | null,
      sdpMLineIndex: number | null,
      sdpMid: string | null,
      tcpType: RTCIceTcpCandidateType | null,
      type: RTCIceCandidateType | null,
      usernameFragment: string | null
    ];
    return new IceCandidate(...arr);
  }

  static fromRTCIceCandidate(c: RTCIceCandidate) {
    return new IceCandidate(
      c.address,
      c.candidate,
      c.component,
      c.foundation,
      c.port,
      c.priority,
      c.protocol,
      c.relatedAddress,
      c.relatedPort,
      c.sdpMLineIndex,
      c.sdpMid,
      c.tcpType,
      c.type,
      c.usernameFragment
    );
  }
}

export { IceCandidate };
