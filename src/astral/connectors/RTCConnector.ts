class RTCConnector {
  private connection: RTCPeerConnection;
  private channel: RTCDataChannel;

  constructor(rtcConfig: RTCConfiguration) {
    this.connection = new RTCPeerConnection(rtcConfig);
    this.registerConnectionEvents();

    this.channel = this.connection.createDataChannel("nameless");
    this.registerChannelEvents();
  }

  private registerConnectionEvents = () => {
    this.connection.onicecandidate = this.handleIceCandidate;
    this.connection.ondatachannel = this.handleDataChannel;
  };

  private registerChannelEvents = () => {
    this.channel.onopen = this.handleChannelOpen;
    this.channel.onmessage = this.handleChannelMessage;
    this.channel.onclosing = this.handleChannelClosing;
    this.channel.onclose = this.handleChannelClose;
    this.channel.onerror = this.handleChannelError;
  };

  private handleChannelOpen = (ev: Event) => {
    console.log(ev);
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
    console.log(ev.candidate);
  };

  private handleDataChannel = (ev: RTCDataChannelEvent) => {
    console.log(ev.channel);
    this.channel = ev.channel;
    this.registerChannelEvents();
  };
}

export { RTCConnector };
