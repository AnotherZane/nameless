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
import { FileMetadata, IceServer, ShareMetadata } from "../models";
import { AkiviliMethods, NamelessMethods } from "../enums";

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

  public requestRTC = async (code: string): Promise<void> =>
    await this.connection.invoke(AkiviliMethods.RequestRTC, code);

  private registerHubEvents = () => {
    this.connection.on(NamelessMethods.Log, this.log);
    this.connection.on(NamelessMethods.DataRequested, this.metadataRequested);
    this.connection.on(NamelessMethods.DataShared, this.metadataShared);
    this.connection.on(NamelessMethods.RTCRequested, this.rtcRequested);

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
    const share = useShareStore.getState();

    await this.connection.send(
      AkiviliMethods.SendMetadata,
      share.code,
      requester,
      sender.sharedFiles.map((f) => FileMetadata.fromFile(f).serialize())
    );
  };

  private metadataShared = async (data: unknown[][]) => {
    useReceiverStore.setState({
      sharedMetadata: data.map((x) => FileMetadata.fromArray(x)),
    });
  };

  private rtcRequested = async (requester: string, data: unknown[]) => {
    const turnServer = IceServer.fromArray(data);
    // IceServer is implicitly converted to RTCIceServer;
    useRTCStore.getState().addIceServer(turnServer);
    useRTCStore.getState().createConnection();
    const conn = useRTCStore.getState().connection!;

    const dc = conn.createDataChannel("nameless");
    useRTCStore.getState().setChannel(dc);

    const offer = await conn.createOffer();
  };
}

export { HubConnector };
