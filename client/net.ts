import { createConnection, Socket } from "net";

export class NetService {
	private socket!: Socket

	public start(): void {
		process.nextTick(() => {
			this.socket = createConnection({ host: "172.16.28.120", port: 21024 }, () => {
				console.log("listener");
			});

			this.socket.on("close", () => {
				console.log("---- closed");
			});

			this.socket.on("error", (err: Error) => {
				console.log("-----", err);
			});

			this.socket.on("data", (data: Buffer) => {
				console.log("-----", String(data));
			});
		});
	}
}
