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
  useSessionStore,
  useShareStore,
} from "../../state";
import {
  FileMetadata,
  IceCandidate,
  IceServer,
  SessionDescription,
  ShareMetadata,
} from "../models";
import { AkiviliMethods, NamelessMethods, ShareRole } from "../enums";
import { Trailblazer } from "./Trailblazer";
import { SnackbarKey, closeSnackbar, enqueueSnackbar } from "notistack";
import { GenericResult } from "../models/GenericResult";

class AkiviliConnector {
  private connection: HubConnection;
  private statusSnack?: SnackbarKey;

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

      window.onbeforeunload = (e) => {
        e.preventDefault();
        return true;
      };
    }
  };

  public createShare = async () => {
    const data = await this.connection.invoke<unknown[]>(
      AkiviliMethods.CreateShare
    );
    const sc = ShareMetadata.fromArray(data);
    const id = useShareStore.getState().addShare(
      sc.code,
      ShareRole.Sender,
      this.connection.connectionId!,
      sc.reconnectToken
      // this.connection.connectionId!
    );
    const ss = useSessionStore.getState();
    ss.setId(id);
    ss.setCode(sc.code);

    window.gtag("event", "create_share", {
      share_code: sc.code,
    });
  };

  public joinShare = async (code: string) => {
    const data = await this.connection.invoke<string | undefined>(
      AkiviliMethods.JoinShare,
      code
    );

    if (!data) throw new Error("No such share");

    // const meta = ShareMetadata.fromArray(data);

    const existing = Array.from(useShareStore.getState().shares.entries()).find(
      (x) => x[1].code == code && x[1].connectionId == this.connection.connectionId
    );

    const id = existing ? existing[0] : useShareStore.getState().addShare(
      code,
      ShareRole.Receiver,
      this.connection.connectionId!,
      data
    );
    useSessionStore.getState().setId(id);

    window.gtag("event", "join_share", {
      share_code: code,
    });

    await this.requestMetadata();
  };

  public reconnectToShare = async (
    code: string,
    token: string,
    oldId: string
  ) => {
    const data = await this.connection.invoke<unknown[] | undefined>(
      AkiviliMethods.ReconnectToShare,
      code,
      token,
      oldId
    );

    if (!data) throw new Error("Failed to reconnect");

    const sc = ShareMetadata.fromArray(data);

    // Delete current share from store
    useShareStore.getState().deleteShare(useSessionStore.getState().id!);

    const id = useShareStore.getState().addShare(
      code,
      ShareRole.Receiver,
      this.connection.connectionId!,
      sc.reconnectToken
      // sc.ownerId
    );
    useSessionStore.getState().setId(id);

    window.gtag("event", "reconnect_share", {
      share_code: code,
    });
  };

  public requestRtc = async (): Promise<void> =>
    await this.connection.invoke(AkiviliMethods.RequestRtc);

  public requestMetadata = async () => {
    const data = await this.connection.invoke<unknown[]>(
      AkiviliMethods.RequestMetadata
    );
    const res = GenericResult.fromArray(data);

    if (res.successful) return;

    // TODO: Handle invalid share / owner disconnected
  };

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
    this.connection.on(NamelessMethods.RtcRequested, this.rtcRequested);
    this.connection.on(NamelessMethods.RtcOfferReceived, this.rtcOfferReceived);
    this.connection.on(
      NamelessMethods.RtcAnswerReceived,
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

      if (this.statusSnack) {
        closeSnackbar(this.statusSnack);
        this.statusSnack = undefined;
      }
    });

    this.connection.onclose(() => {
      useConnectivityStore.setState({ pathConnected: false });

      this.statusSnack = enqueueSnackbar("Reconnecting...", {
        variant: "warning",
        persist: true,
      });
    });

    this.connection.onreconnecting(() => {
      this.statusSnack = enqueueSnackbar("Reconnecting...", {
        variant: "warning",
        persist: true,
      });
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
      AkiviliMethods.SendRtcOffer,
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
      AkiviliMethods.SendRtcAnswer,
      sender,
      answer.serialize()
    );
  };

  private rtcAnswerReceived = async (sender: string, data: unknown[]) => {
    const answer = SessionDescription.fromArray(data);
    const conn = useConnectivityStore.getState().getNameless(sender);

    conn!.setAnswer(answer);
  };

  private iceCandidateReceived = async (sender: string, data: unknown[]) => {
    const candidate = IceCandidate.fromArray(data);
    const conn = useConnectivityStore.getState().getNameless(sender);

    await conn!.addIceCandidate(candidate);
  };
}

export { AkiviliConnector };
