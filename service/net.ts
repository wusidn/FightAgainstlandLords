import { createServer, Server, Socket } from 'net'
import * as uuid from 'uuid'
import os from 'os'

export interface ClientInfo {
    id: string;
    client: Socket;
}

export default class NetService {

    private port!: number;    
    private clientList!: Map<string, Socket>;

    public onAccept?: (client: string) => void;
    public onRecv?: (data: string | Uint8Array) => void;
    public onClose?: (client: string) => void;

    constructor(port?: number) {
        this.port = port || 21024;
        this.clientList = new Map<string, Socket>();
    }

    public start (cb?: ((address: string, port: number) => void) | undefined) :void {
        process.nextTick(() => {
            const server: Server = createServer((socket: Socket) => {
                
                process.nextTick(() => {

                    const clientId = uuid.v1();

                    socket.on("data", data => {
                        this.onRecv && this.onRecv(data);
                    });

                    socket.on("close", () => {
                        this.clientList.delete(clientId);
                        this.onClose && this.onClose(clientId);
                    });

                    socket.on("error", err => {
                        console.log(err);
                    });

                    this.clientList.set(clientId, socket);

                    this.onAccept && this.onAccept(clientId);
                });

            }).on("error", (err) => {
                console.log(err);
            });

            server.listen({
                port: this.port
            }, () => {
                cb && cb(this.getLocalAddress(), this.port);
            });
        });
    }

    public getClientList (): Array<string> {
        return [...this.clientList.keys()];
    }

    public closeClient(clientId: string | string[]) :boolean {

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

    public send(clientId: string, data: string | Uint8Array) :boolean {

        if (["all", "*"].includes(clientId)) {

            [...this.clientList.values()].forEach((client) => {
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


    private getLocalAddress (family?: "IPv4" | "IPv6") : string {

        const interfaces = os.networkInterfaces();

        for(const devName in interfaces) {
            const infos = interfaces[devName] || [];
            for(const info of infos) {
                if (info.family == (family || "IPv4") && !info.internal && info.address != "127.0.0.1") {
                    return info.address;
                }
            }
        }

        return "127.0.0.1";
    }

}