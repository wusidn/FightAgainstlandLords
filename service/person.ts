export default class Person {
    name!:string;

    constructor (name: string) {
        this.name = name;
    }

    sayHello (): string {
        return `Hello, Im ${this.name}`;
    }
}