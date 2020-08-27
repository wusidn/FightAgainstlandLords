import { createServer, Server, Socket } from "net";
import * as uuid from "uuid";
import os from "os";

import { EventService, EventOptions, EventFuncType, Event } from "../common/event";

export interface ClientInfo {
    id: string;
    client: Socket;
}

export class NetService {
    private port!: number;
    private clientList!: Map<string, Socket>;
    private event!: EventService;

    constructor(port?: number) {
        this.port = port || 21024;
        this.clientList = new Map<string, Socket>();
        this.event = new EventService();
    }

    public start(cb?: ((address: string, port: number) => void) | undefined): void {
        process.nextTick(() => {
            const server: Server = createServer((socket: Socket) => {
                this.listenClient(socket);
            }).on("error", err => {
                console.log(err);
            });

            server.listen(
                {
                    port: this.port,
                },
                () => {
                    cb && cb(this.getLocalAddress(), this.port);
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

    public addEventListener(event: "accept", func: (e: Event, client: string) => void, useCapture?: boolean): string;
    public addEventListener(event: "accept", func: (e: Event, client: string) => void, options?: EventOptions): string;
    public addEventListener(event: "close", func: (e: Event, client: string) => void, useCapture?: boolean): string;
    public addEventListener(event: "close", func: (e: Event, client: string) => void, option?: EventOptions): string;
    public addEventListener(event: "recv", func: (e: Event, data: string | Uint8Array) => void, useCapture?: boolean): string;
    public addEventListener(event: "recv", func: (e: Event, data: string | Uint8Array) => void, option?: EventOptions): string;
    public addEventListener(event: string, func: EventFuncType, param?: boolean | EventOptions): string;
    public addEventListener(event: string, func: unknown, param?: boolean | EventOptions): string {
        switch (typeof param) {
        case "undefined":
            return this.event.addEventListener(event, func as EventFuncType);
        case "boolean":
            return this.event.addEventListener(event, func as EventFuncType, param);
        default:
            return this.event.addEventListener(event, func as EventFuncType, param);
        }
    }

    public removeEventListener(event: "accept", eventId: string): void;
    public removeEventListener(event: "accept", func: (e: Event, client: string) => void): void;
    public removeEventListener(event: "close", eventId: string): void;
    public removeEventListener(event: "close", func: (e: Event, client: string) => void): void;
    public removeEventListener(event: "recv", eventId: string): void;
    public removeEventListener(event: "recv", func: (e: Event, data: string | Uint8Array) => void): void;
    public removeEventListener(event: string, param: EventFuncType): void;
    public removeEventListener(event: string, param: unknown): void {
        if (typeof param == "string") {
            return this.event.removeEventListener(event, param);
        }
        return this.event.removeEventListener(event, param as EventFuncType);
    }

    private getLocalAddress(family?: "IPv4" | "IPv6"): string {
        const interfaces = os.networkInterfaces();

        for (const devName in interfaces) {
            const infos = interfaces[devName] || [];
            for (const info of infos) {
                if (info.family == (family || "IPv4") && !info.internal && info.address != "127.0.0.1") {
                    return info.address;
                }
            }
        }

        return "127.0.0.1";
    }
}
