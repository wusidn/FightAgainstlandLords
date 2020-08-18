import Person from './person'
// import { createServer, Server, Socket } from 'net'
import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

rl.on("line", (line) => {
    console.log("recv: ", line);
    rl.prompt();
});

rl.on("close", () => {
    console.log("-closed");
});

console.log(new Person("Liming").sayHello());

rl.prompt();

// console.clear();

// console.log("Hello Im Daming");

// const server: Server = createServer((socket: Socket) => {
//     socket.end("get out");
// }).on('error', (err) => {
//     console.log(err);
// });

// server.listen(9100, () => {
//     console.log("listend 9100");
// });