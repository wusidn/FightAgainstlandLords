import * as uuid from 'uuid'

const EventControlSymbol = Symbol("EventControlSymbol");
const EventInterceptFuncListSymbol = Symbol("EventInterceptFuncListSymbol");
const EventListenerFuncListSymbol = Symbol("EventListenerFuncListSymbol");

type EventFuncType = (...args: any[]) => void;

enum EventType {
    Default,
    Once,
}

interface EventOptions {
    capture?: boolean;
    once?: boolean;
}

interface EventFunc {
    id: string;
    type: EventType;
    func: EventFuncType;
}

class EventControl {
    public stopPropagation: boolean;
    public preventDefault: boolean;

    constructor () {
        this.stopPropagation = false;
        this.preventDefault = false;
    }
}

class Event {
    constructor () {

        Object.defineProperty(this, EventControlSymbol, {
            value: new EventControl(),
        });

        Object.defineProperty(this, EventInterceptFuncListSymbol, {
            value: new Array<EventFunc>(),
        });

        Object.defineProperty(this, EventListenerFuncListSymbol, {
            value: new Array<EventFunc>(),
        });
    }

    public stopPropagation(): void {
        this[EventControlSymbol].stopPropagation = true;
    }

    public preventDefault(): void {
        this[EventControlSymbol].preventDefault = true;
    }
}

export class EventService {

    private eventListenerPool: Map<string, Event>;

    constructor () {
        this.eventListenerPool = new Map<string, Event>();
    }

    public addEventListener(event: string, callback: EventFuncType): string;
    public addEventListener(event: string, callback: EventFuncType, useCapture: boolean): string;
    public addEventListener(event: string, callback: EventFuncType, options: EventOptions): string;
    public addEventListener(event: string, callback: EventFuncType, other?: boolean | EventOptions ): string{

        const options: EventOptions = ["undefined", "boolean"].includes(typeof other) ? {} : other as EventOptions;
        const capture: boolean = options.capture || false;

        !this.eventListenerPool.has(event) && this.eventListenerPool.set(event, new Event());
        const eventFuncList: Array<EventFunc> = (this.eventListenerPool.get(event) as Event)[( capture ? EventInterceptFuncListSymbol : EventListenerFuncListSymbol)];

        const eventId: string = uuid.v1();

        eventFuncList.push({
            id: eventId, 
            type: (options.once || false) ? EventType.Once : EventType.Default, 
            func: callback 
        });

        return eventId;
    }

    public removeEventListener(event: string, eventId: string): void;
    public removeEventListener(event: string, cb: EventFuncType): void;
    public removeEventListener(event: string, param: EventFuncType | string): void {

        if (!this.eventListenerPool.has(event)) {
            return;
        }

        const e = this.eventListenerPool.get(event) as Event;

        [e[EventInterceptFuncListSymbol], e[EventListenerFuncListSymbol]].forEach((funcList: Array<EventFunc>) => {

            for (;;) {
                let findIndex = funcList.findIndex((func: EventFunc) => {
                    return func.id == param || func.func == param;
                });
                if (findIndex > -1) break;

                funcList.splice(findIndex, 1);
            }
        });
    }

    public emit(event: string, ...args: any[]): boolean {
        
        if (!this.eventListenerPool.has(event)) {
            return false;
        }

        const removeEventFuncIdList: Array<string> = [];
        const e = this.eventListenerPool.get(event) as Event;

        let res = (function() {
            [e[EventInterceptFuncListSymbol], e[EventListenerFuncListSymbol]].forEach((funcList: Array<EventFunc>) => {
                funcList.forEach((func: EventFunc) => {
                    func.func.apply(undefined, [e, ...args]);

                    (func.type == EventType.Once) && removeEventFuncIdList.push(func.id);
                    
                    if (e[EventControlSymbol].stopPropagation) {
                        return e[EventControlSymbol].stopPropagation;
                    }
                });
            });
            return e[EventControlSymbol].preventDefault;
        })();

        removeEventFuncIdList.forEach(id => {
            this.removeEventListener(event, id);
        });

        return res;
    }
    
}