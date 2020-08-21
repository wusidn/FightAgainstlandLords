import readLine from "readline";
import { EventService, Event } from "./event";

type CommandCallbackType = (args: Array<string>) => boolean | void

export class CommandService {
	private event!: EventService
	private registerList!: Set<string>

	constructor() {
		this.event = new EventService();
		this.registerList = new Set<string>();
	}

	private rl!: readLine.Interface

	public ready(): void {
		this.rl.prompt();
	}

	public register(command: string, cb: CommandCallbackType): boolean
	public register(commands: string[], cb: CommandCallbackType): boolean
	public register(command: string | string[], cb: CommandCallbackType): boolean {
		const cmds = typeof command == "string" ? [command] : command;
		cmds.forEach(cmd => {
			if (this.registerList.has(cmd)) {
				this.log(`repter regist [${cmd}]`);
				return;
			}

			this.event.addEventListener(cmd, (_: Event, ...args: unknown[]) => {
				cb(args as Array<string>);
			});
			this.registerList.add(cmd);
		});
		return true;
	}

	public start(cb?: (() => void) | undefined): void {
		process.nextTick(() => {
			this.rl = readLine.createInterface({
				input: process.stdin,
				output: process.stdout,
				prompt: "> ",
			});

			this.rl.on("line", line => {
				const space = String.fromCharCode(0x20);
				const params = line
					.trim()
					.replace(/\u0020+/g, " ")
					.split(space);
				const cmd = params[0];

				this.ready();

				if (!this.registerList.has(cmd)) {
					cmd && this.log(`command not find: ${cmd}`);
					return;
				}

				this.event.emit(cmd, ...params);
			});

			this.rl.on("close", () => {
				process.exit(0);
			});

			cb && cb();
		});
	}

	public log(str: string): void {
		process.stdout.cursorTo(0);
		process.stdout.clearScreenDown();

		console.log(str);

		this.ready();
	}
}
