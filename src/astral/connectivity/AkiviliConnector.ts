import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack";
import {
  useConnectivityStore,
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
import { Trailblazer } from "./Trailblazer";

class AkiviliConnector {
  private connection: HubConnection;

  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_ASTRAL_HUB_URL}/hub`)
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
      useConnectivityStore.setState({ pathConnected: true });
    });

    this.connection.onreconnected(() => {
      useConnectivityStore.setState({ pathConnected: true });
    });

    this.connection.onclose(() => {
      useConnectivityStore.setState({ pathConnected: false });
    });
  };

  private log = (message: string) => console.log("Akivili:", message);

  private metadataRequested = async (requester: string) => {
    const sender = useSenderStore.getState();

    await this.connection.invoke(
      AkiviliMethods.SendMetadata,
      requester,
      Array.from(sender.sharedFiles.entries()).map(([id, file]) =>
        FileMetadata.fromFile(id, file).serialize()
      )
    );
  };

  private metadataReceived = async (data: unknown[][]) => {
    useReceiverStore.setState({
      sharedMetadata: data.map((x) => FileMetadata.fromArray(x)),
    });
  };

  private rtcRequested = async (requester: string, data: unknown[]) => {
    const turnServer = IceServer.fromArray(data);
    const conn = new Trailblazer(requester, [turnServer]);
    useConnectivityStore.getState().addNameless(requester, conn);

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
    const conn = new Trailblazer(sender, [turnServer]);
    useConnectivityStore.getState().addNameless(sender, conn);

    const answer = SessionDescription.fromInit(await conn.createAnswer(offer));
    await this.connection.invoke(
      AkiviliMethods.SendRTCAnswer,
      sender,
      answer.serialize()
    );
  };

  private rtcAnswerReceived = async (sender: string, data: unknown[]) => {
    const answer = SessionDescription.fromArray(data);
    const conn = useConnectivityStore.getState().getNameless(sender);

    // this shouldn't happen
    if (!conn) return;

    conn.setAnswer(answer);
  };

  private iceCandidateReceived = async (sender: string, data: unknown[]) => {
    const candidate = IceCandidate.fromArray(data);
    const conn = useConnectivityStore.getState().getNameless(sender);

    if (!conn) return;

    await conn.addIceCandidate(candidate);
  };
}

export { AkiviliConnector };
