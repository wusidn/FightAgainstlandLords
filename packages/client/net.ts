import { createConnection, Socket } from "net";
import { EventService, EventFuncType, EventOptions } from "../common/event";
// import os from "os";
import net from "net";

export class NetService {
    private socket?: Socket;
    private event!: EventService;

    asd;

    constructor() {
        this.event = new EventService();
    }

    public start(host: string, port: number, cb?: () => void): void {
        if (!net.isIP(host)) {
            return;
        }

        if (port < 0 || port > 65535) {
            return;
        }

        process.nextTick(() => {
            this.socket = createConnection({ host, port }, () => {
                cb && cb();
            });

            // this.socket.on("timeout", () => {
            // });

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
