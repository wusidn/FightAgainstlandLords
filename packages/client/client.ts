import { CommandService } from "../common/command";
import { NetService } from "./net";

export class Client {
    private command!: CommandService;
    private net!: NetService;

    constructor() {
        this.command = new CommandService();
        this.net = new NetService();
    }

    private initCommandEvent(): void {
        this.command.register("send", (args: string[]) => {
            this.net.send(args.slice(1).join());
        });
    }

    private initNetEvent(): void {
        this.net.addEventListener("close", () => {
            this.command.log("closed");
        });

        this.net.addEventListener("recv", (_: Event, data: string | Uint8Array) => {
            this.command.log(`recv: ${data.toString().replace("\n", "")}`);
        });
    }

    private connectServer(host: string, port: number): void {
        this.net.start(host, port, () => {
            this.command.log("listener");
        });
    }

    public connect(host: string, port: number): void {
        this.initCommandEvent();
        this.initNetEvent();

        this.command.start(() => {
            this.command.log("connecting...");
            this.connectServer(host, port);
        });
    }
}
