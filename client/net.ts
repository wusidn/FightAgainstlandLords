import { createConnection, Socket } from "net";
import { EventService, EventFuncType, EventOptions } from "../common/event";

export class NetService {
    private socket?: Socket;
    private event!: EventService;

    constructor() {
        this.event = new EventService();
    }

    public start(cb?: () => void): void {
        process.nextTick(() => {
            this.socket = createConnection({ host: "172.16.28.120", port: 21024 }, () => {
                cb && cb();
            });

            this.socket.on("close", () => {
                this.event.emit("close");
                if (this.socket) {
                    this.socket.destroy();
                    this.socket = undefined;
                }
            });

            this.socket.on("error", (err: Error) => {
                console.log("-----", err);
            });

            this.socket.on("data", (data: Buffer) => {
                this.event.emit("recv", data);
            });
        });
    }

    public send(data: string, cb?: (err?: Error | undefined) => void): boolean {
        if (!this.socket) {
            return false;
        }

        return this.socket.write(data, cb);
    }

    public addEventListener(event: "close", cb: (e: Event) => void, capture?: boolean): string;
    public addEventListener(event: "close", cb: (e: Event) => void, options?: EventOptions): string;
    public addEventListener(event: "recv", cb: (e: Event, data: string | Uint8Array) => void, capture?: boolean): string;
    public addEventListener(event: "recv", cb: (e: Event, data: string | Uint8Array) => void, options?: EventOptions): string;
    public addEventListener(event: string, cb: unknown, param?: boolean | EventOptions): string {
        switch (typeof param) {
            case "undefined":
                return this.event.addEventListener(event, cb as EventFuncType);
            case "boolean":
                return this.event.addEventListener(event, cb as EventFuncType, param);
            default:
                return this.event.addEventListener(event, cb as EventFuncType, param);
        }
    }

    public removeEventListener(event: string, id: string): void;
    public removeEventListener(event: string, cb: EventFuncType): void;
    public removeEventListener(event: string, param: EventFuncType | string): void {
        switch (typeof param) {
            case "string":
                this.event.removeEventListener(event, param);
                break;
            default:
                this.event.removeEventListener(event, param);
                break;
        }
    }
}
