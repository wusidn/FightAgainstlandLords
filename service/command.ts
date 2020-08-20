import readLine from 'readline'

export default class CommandService {

    private commandPoll!: Map<string, (args: Array<string>) => boolean | void>

    constructor () {
        this.commandPoll = new Map<string, (args: Array<string>) => boolean | void>();
    }
    
    private rl!: readLine.Interface;

    public ready (): void {
        this.rl.prompt();
    }

    public register (command: string | string[], cb: (args: Array<string>) => boolean | void): boolean {

        const cmds = typeof command == "string" ? [command] : command;
        cmds.forEach(cmd => {
            if (!this.commandPoll.has(cmd)) {
                this.commandPoll.set(cmd, cb);
            }
        })
        return true;
    }

    public start (cb?: (() => void) | undefined): void {
        process.nextTick(() => {
            this.rl = readLine.createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: "> "
            });

            this.rl.on("line", (line) => {
                const space = String.fromCharCode(0x20);
                const params = line.trim().replace(/\u0020+/g, " ").split(space);
                const cmd = params[0];
                if (!this.commandPoll.has(cmd)) {
                    cmd && console.log(`command not find: ${cmd}`);
                    this.ready();
                    return;
                }

                const cbres = (this.commandPoll.get(cmd) as (args: Array<string>) => boolean)(params);
                if (typeof cbres != 'boolean' || cbres) {
                    this.ready();
                }
            });

            this.rl.on("close", () => {
                process.exit(0);
            });

            cb && cb();
        });
    }

    public log (str: string): void {

        process.stdout.cursorTo(0);
        process.stdout.clearScreenDown();

        console.log(str);
        
        this.ready();
    }
}