import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack";
import {
  useHubConnectorStore,
  useRTCStore,
  useReceiverStore,
  useSenderStore,
  useShareStore,
} from "../../state";
import {
  FileMetadata,
  IceCandidate,
  IceServer,
  SessionDescription,
  ShareMetadata,
} from "../models";
import { AkiviliMethods, NamelessMethods } from "../enums";
import { DefaultRTCConfiguration, RTCConnector } from "./RTCConnector";

class HubConnector {
  private connection: HubConnection;

  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5129/hub")
      .withHubProtocol(new MessagePackHubProtocol())
      .withAutomaticReconnect()
      .build();

    this.registerHubEvents();
  }

  public start = async () => {
    if (this.connection.state == HubConnectionState.Disconnected) {
      try {
        await this.connection.start();
      } catch (err) {
        console.log(err);
      }
    }
  };

  public createShare = async (): Promise<ShareMetadata> => {
    const data = await this.connection.invoke<unknown[]>(
      AkiviliMethods.CreateShare
    );
    const sc = ShareMetadata.fromArray(data);
    useShareStore.getState().setCode(sc.code);
    return sc;
  };

  public requestMetadata = async (code: string): Promise<void> =>
    await this.connection.invoke(AkiviliMethods.RequestMetadata, code);

  public requestRTC = async (): Promise<void> =>
    await this.connection.invoke(AkiviliMethods.RequestRTC);

  public sendIceCandidate = async (
    connectionId: string,
    candidate: RTCIceCandidate
  ) =>
    await this.connection.invoke(
      AkiviliMethods.SendIceCandidate,
      connectionId,
      IceCandidate.fromRTCIceCandidate(candidate).serialize()
    );

  private registerHubEvents = () => {
    this.connection.on(NamelessMethods.Log, this.log);
    this.connection.on(NamelessMethods.DataRequested, this.metadataRequested);
    this.connection.on(NamelessMethods.DataReceived, this.metadataReceived);
    this.connection.on(NamelessMethods.RTCRequested, this.rtcRequested);
    this.connection.on(NamelessMethods.RTCOfferReceived, this.rtcOfferReceived);
    this.connection.on(
      NamelessMethods.RTCAnswerReceived,
      this.rtcAnswerReceived
    );
    this.connection.on(
      NamelessMethods.IceCandidateReceived,
      this.iceCandidateReceived
    );

    this.connection.on(NamelessMethods.Connected, () => {
      useHubConnectorStore.setState({ connected: true });
    });

    this.connection.onreconnected(() => {
      useHubConnectorStore.setState({ connected: true });
    });

    this.connection.onclose(() => {
      useHubConnectorStore.setState({ connected: false });
    });
  };

  private log = (message: string) => console.log("Akivili:", message);

  private metadataRequested = async (requester: string) => {
    const sender = useSenderStore.getState();

    await this.connection.invoke(
      AkiviliMethods.SendMetadata,
      requester,
      sender.sharedFiles.map((f) => FileMetadata.fromFile(f).serialize())
    );
  };

  private metadataReceived = async (data: unknown[][]) => {
    useReceiverStore.setState({
      sharedMetadata: data.map((x) => FileMetadata.fromArray(x)),
    });
  };

  private rtcRequested = async (requester: string, data: unknown[]) => {
    const turnServer = IceServer.fromArray(data);
    const newIceServers = DefaultRTCConfiguration.iceServers ?? [];
    newIceServers.push(turnServer);

    const config: RTCConfiguration = { iceServers: newIceServers };
    const conn = new RTCConnector(requester, config);
    useRTCStore.getState().addConnector(requester, conn);

    console.log("connector created, sending offer");

    const offer = SessionDescription.fromInit(await conn.createOffer());
    await this.connection.invoke(
      AkiviliMethods.SendRTCOffer,
      requester,
      offer.serialize()
    );
  };

  private rtcOfferReceived = async (
    sender: string,
    offr: unknown[],
    turn: unknown[]
  ) => {
    const offer = SessionDescription.fromArray(offr);
    const turnServer = IceServer.fromArray(turn);

    const newIceServers = DefaultRTCConfiguration.iceServers ?? [];
    newIceServers.push(turnServer);

    const config: RTCConfiguration = { iceServers: newIceServers };
    const conn = new RTCConnector(sender, config);
    useRTCStore.getState().addConnector(sender, conn);

    const answer = SessionDescription.fromInit(await conn.createAnswer(offer));
    await this.connection.invoke(
      AkiviliMethods.SendRTCAnswer,
      sender,
      answer.serialize()
    );
  };

  private rtcAnswerReceived = async (sender: string, data: unknown[]) => {
    const answer = SessionDescription.fromArray(data);
    const conn = useRTCStore.getState().getConnector(sender);

    // this shouldn't happen
    if (!conn) return;

    conn.setAnswer(answer);
  };

  private iceCandidateReceived = async (sender: string, data: unknown[]) => {
    const candidate = IceCandidate.fromArray(data);
    const conn = useRTCStore.getState().getConnector(sender);

    if (!conn) return;

    await conn.addIceCandidate(candidate);
  };
}

export { HubConnector };
