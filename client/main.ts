import { CommandService } from '../common/command'
import { NetService } from './net'

const command = new CommandService();
const net = new NetService();

command.register("create", (args: string[]) => {
    command.log(`${args}`);
});

net.start();

command.start(() => {
    command.ready();
});