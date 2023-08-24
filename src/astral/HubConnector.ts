import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack";
import ShareCode from "./models/ShareCode";

class HubConnector {
  private connection: HubConnection;

  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5129/hub")
      .withHubProtocol(new MessagePackHubProtocol())
      .withAutomaticReconnect()
      .build();

    this.connection.on("log", this.log);
  }

  public start = () => {
    if (this.connection.state == "Disconnected") {
      this.connection.start().catch((err) => console.log(err));
    }
  };

  public createShareCode = async (): Promise<ShareCode> => {
    const data = await this.connection.invoke<unknown[]>("CreateShareCode");
    return ShareCode.fromArray(data);
  };

  private log = (message: string) => console.log("Akivili:", message);
}

export default HubConnector;
