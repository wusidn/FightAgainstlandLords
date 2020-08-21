import { CommandService } from '../common/command'
import { NetService } from './net'

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

net.onAccept = (id: string) => {
    command.log(`acceptd: ${id}`);
};

net.onClose = (id: string) => {
    command.log(`closed: ${id}`);
}

net.onRecv = (data: string | Uint8Array) => {
    command.log(`recv: ${data}`.trim());
}

command.start(() => {
    command.ready();

    net.start((address, port) => {
        command.log(`service listened: ${address} ${port}`);
    });
});
