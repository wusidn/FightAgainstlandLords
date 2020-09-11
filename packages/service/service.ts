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

    public listener(): void;
    public listener(port: number): void;
    public listener(host: string, port: number): void;
    public listener(param_1?: string | number, param_2?: number): void {
        this.initCommandEvent();
        this.initNetEvent();

        let host: string | undefined = undefined;
        let port: number | undefined = undefined;

        if (typeof param_1 === "string") {
            host = param_1;
        }

        if (typeof param_1 === "number") {
            port = param_1;
        }

        if (typeof param_2 === "number") {
            port = param_2;
        }

        this.command.start(() => {
            this.net.run(host, port, (address, port) => {
                this.command.log(`service listened: ${address} ${port}`);
            });
        });
    }
}
