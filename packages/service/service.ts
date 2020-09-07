import { CommandService } from "../common/command";
import { Event } from "../common/event";
import { NetService } from "./net";

export class Service {
    private command!: CommandService;
    private net!: NetService;

    constructor() {
        this.command = new CommandService();
        this.net = new NetService();
    }

    private initCommandEvent() {
        this.command.register(["quit", "exit"], () => {
            process.exit(0);
        });

        this.command.register("ls", (args: string[]) => {
            switch (args[1]) {
                case "client":
                default:
                    this.net.getClientList().forEach(id => {
                        this.command.log(id);
                    });
                    break;
            }
        });

        this.command.register("close", (args: string[]) => {
            this.net.closeClient(args.slice(1));
        });

        this.command.register("send", (args: string[]) => {
            this.net.send(args[1], `${args.slice(2).join(" ")}\n`);
        });
    }

    private initNetEvent() {
        this.net.addEventListener("accept", (_: Event, id: string) => {
            this.command.log(`acceptd: ${id}`);
        });

        this.net.addEventListener("close", (_: Event, id: string) => {
            this.command.log(`closed: ${id}`);
        });

        this.net.addEventListener("recv", (_: Event, data: string | Uint8Array) => {
            this.command.log(`recv: ${data.toString().replace("\n", "")}`);
        });
    }

    public start(): void {
        this.initCommandEvent();
        this.initNetEvent();

        this.command.start(() => {
            this.net.start((address, port) => {
                this.command.log(`service listened: ${address} ${port}`);
            });
        });
    }
}
