import { useHubConnectorStore } from "../../state";

const DefaultRTCConfiguration: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com:3478" },
  ],
};

class RTCConnector {
  private connection: RTCPeerConnection;
  private channel?: RTCDataChannel;
  private connectionId: string;
  private remoteDescribed: boolean;
  private pendingIceCandidates: RTCIceCandidate[];

  constructor(
    connectionId: string,
    config: RTCConfiguration = DefaultRTCConfiguration
  ) {
    this.connection = new RTCPeerConnection(config);
    this.connectionId = connectionId;
    this.registerConnectionEvents();
    this.remoteDescribed = false;
    this.pendingIceCandidates = [];
  }

  public updateConfig = (config: RTCConfiguration) =>
    this.connection.setConfiguration(config);

  public createOffer = async () => {
    this.channel = this.connection.createDataChannel("nameless");
    this.registerChannelEvents();

    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    return offer;
  };

  public createAnswer = async (offer: RTCSessionDescription) => {
    await this.connection.setRemoteDescription(offer);

    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);

    this.remoteDescribed = true;
    await this.addPendingIceCandidates();

    return answer;
  };

  public setAnswer = async (answer: RTCSessionDescription) => {
    await this.connection.setRemoteDescription(answer);

    this.remoteDescribed = true;
    await this.addPendingIceCandidates();
  };

  public addIceCandidate = async (candidate: RTCIceCandidate) => {
    if (this.remoteDescribed) {
      await this.connection.addIceCandidate(candidate);
    } else {
      this.pendingIceCandidates.push(candidate);
    }
  };

  private addPendingIceCandidates = async () => {
    for (let i = 0; i < this.pendingIceCandidates.length; i++) {
      const candidate = this.pendingIceCandidates[i];
      await this.connection.addIceCandidate(candidate);
    }

    this.pendingIceCandidates = [];
  };

  private registerConnectionEvents = () => {
    this.connection.onicecandidate = this.handleIceCandidate;
    this.connection.ondatachannel = this.handleDataChannel;
  };

  private registerChannelEvents = () => {
    if (!this.channel) return;

    this.channel.onopen = this.handleChannelOpen;
    this.channel.onmessage = this.handleChannelMessage;
    this.channel.onclosing = this.handleChannelClosing;
    this.channel.onclose = this.handleChannelClose;
    this.channel.onerror = this.handleChannelError;
  };

  private handleChannelOpen = (ev: Event) => {
    console.log(ev);
    this.channel?.send("Data channel opened!");
  };

  private handleChannelMessage = (ev: MessageEvent<unknown>) => {
    console.log(ev);
  };

  private handleChannelClosing = (ev: Event) => {
    console.log(ev);
  };

  private handleChannelClose = (ev: Event) => {
    console.log(ev);
  };

  private handleChannelError = (ev: Event) => {
    console.log(ev);
  };

  private handleIceCandidate = (ev: RTCPeerConnectionIceEvent) => {
    console.log("Sending ice candidate:", ev.candidate);

    if (ev.candidate)
      useHubConnectorStore
        .getState()
        .connector.sendIceCandidate(this.connectionId, ev.candidate);
  };

  private handleDataChannel = (ev: RTCDataChannelEvent) => {
    console.log("Got data channel", ev.channel);
    this.channel = ev.channel;
    this.registerChannelEvents();
  };
}

export { RTCConnector, DefaultRTCConfiguration };
