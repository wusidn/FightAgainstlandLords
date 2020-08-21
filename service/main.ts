import { CommandService } from "../common/command";
import { Event } from "../common/event";
import { NetService } from "./net";

const command: CommandService = new CommandService();
const net: NetService = new NetService();

command.register(["quit", "exit"], () => {
	process.exit(0);
});

command.register("ls", (args: string[]) => {
	switch (args[1]) {
	case "client":
	default:
		net.getClientList().forEach(id => {
			command.log(id);
		});
		break;
	}
});

command.register("close", (args: string[]) => {
	net.closeClient(args.slice(1));
});

command.register("send", (args: string[]) => {
	net.send(args[1], `${args.slice(2).join(" ")}\n`);
});

net.addEventListener("accept", (_: Event, id: string) => {
	command.log(`acceptd: ${id}`);
});

net.addEventListener("close", (_: Event, id: string) => {
	command.log(`closed: ${id}`);
});

net.addEventListener("recv", (_: Event, data: string | Uint8Array) => {
	command.log(`recv: ${data.toString().replace("\n", "")}`);
});

command.start(() => {
	command.ready();

	net.start((address, port) => {
		command.log(`service listened: ${address} ${port}`);
	});
});
