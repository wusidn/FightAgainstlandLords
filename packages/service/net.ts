import { createServer, Server, Socket } from "net";
import * as uuid from "uuid";

import { DefaultPort } from "../config";
import { getLocalAddress } from "../utils";

import { EventService, EventOptions, EventFuncType, Event } from "../common/event";

export interface ClientInfo {
    id: string;
    client: Socket;
}

type RunCallBackType = (address: string, port: number) => void;

export class NetService {
    private clientList!: Map<string, Socket>;
    private event!: EventService;

    constructor() {
        this.clientList = new Map<string, Socket>();
        this.event = new EventService();
    }

    public run(cb?: (address: string, port: number) => void): void;
    public run(host?: string, cb?: (address: string, port: number) => void): void;
    public run(port?: number, cb?: (address: string, port: number) => void): void;
    public run(host?: string, port?: number, cb?: (address: string, port: number) => void): void;
    public run(param_1?: string | number | RunCallBackType, param_2?: number | RunCallBackType, param_3?: RunCallBackType): void {
        let host: string | undefined = undefined;
        let port: number | undefined = undefined;
        let cb: RunCallBackType | undefined = undefined;

        switch (typeof param_1) {
            case "string":
                host = param_1;
                break;
            case "number":
                port = param_1;
                break;
            default:
                cb = param_1;
                break;
        }

        switch (typeof param_2) {
            case "number":
                port = param_2;
                break;
            default:
                cb = param_2;
                break;
        }

        if (typeof param_3 === "function") {
            cb = param_3;
        }

        return this._run(host, port, cb);
    }

    private _run(host?: string, port?: number, cb?: ((address: string, port: number) => void) | undefined): void {
        host = host || getLocalAddress();
        port = port || DefaultPort;

        process.nextTick(() => {
            const server: Server = createServer((socket: Socket) => {
                this.listenClient(socket);
            }).on("error", err => {
                console.log(err);
            });

            server.listen(
                {
                    host,
                    port,
                },
                () => {
                    cb && cb(host as string, port as number);
                }
            );
        });
    }

    private listenClient(socket: Socket): void {
        const clientId = uuid.v1();

        socket.on("data", data => {
            this.event.emit("recv", data);
        });

        socket.on("close", () => {
            this.clientList.delete(clientId);
            this.event.emit("close", clientId);
        });

        socket.on("error", err => {
            console.log(err);
        });

        this.clientList.set(clientId, socket);

        this.event.emit("accept", clientId);
    }

    public getClientList(): Array<string> {
        return [...this.clientList.keys()];
    }

    public closeClient(clientId: string | string[]): boolean {
        const clientIds = typeof clientId == "string" ? [clientId] : clientId;

        clientIds.forEach(clientId => {
            if (!this.clientList.has(clientId)) {
                return false;
            }

            this.closeSocket(this.clientList.get(clientId) as Socket);
        });

        return true;
    }

    public closeSocket(socket: Socket): boolean {
        socket.end("close");
        socket.destroy();

        return true;
    }

    public send(clientId: string, data: string): boolean;
    public send(clientId: string, data: Uint8Array): boolean;
    public send(clientId: string, data: string | Uint8Array): boolean {
        if (["all", "*"].includes(clientId)) {
            [...this.clientList.values()].forEach(client => {
                client.write(data);
            });

            return true;
        }

        if (!this.clientList.has(clientId)) {
            return false;
        }

        (this.clientList.get(clientId) as Socket).write(data);

        return true;
    }

    public addEventListener(event: "accept", cb: (e: Event, client: string) => void, useCapture?: boolean): string;
    public addEventListener(event: "accept", cb: (e: Event, client: string) => void, options?: EventOptions): string;
    public addEventListener(event: "close", cb: (e: Event, client: string) => void, useCapture?: boolean): string;
    public addEventListener(event: "close", cb: (e: Event, client: string) => void, option?: EventOptions): string;
    public addEventListener(event: "recv", cb: (e: Event, data: string | Uint8Array) => void, useCapture?: boolean): string;
    public addEventListener(event: "recv", cb: (e: Event, data: string | Uint8Array) => void, option?: EventOptions): string;
    public addEventListener(event: string, cb: EventFuncType, param?: boolean | EventOptions): string;
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

    public removeEventListener(event: "accept", eventId: string): void;
    public removeEventListener(event: "accept", cb: (e: Event, client: string) => void): void;
    public removeEventListener(event: "close", eventId: string): void;
    public removeEventListener(event: "close", cb: (e: Event, client: string) => void): void;
    public removeEventListener(event: "recv", eventId: string): void;
    public removeEventListener(event: "recv", cb: (e: Event, data: string | Uint8Array) => void): void;
    public removeEventListener(event: string, param: EventFuncType): void;
    public removeEventListener(event: string, param: unknown): void {
        if (typeof param == "string") {
            return this.event.removeEventListener(event, param);
        }
        return this.event.removeEventListener(event, param as EventFuncType);
    }
}
