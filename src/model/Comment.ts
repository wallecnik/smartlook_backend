export = class Comment {

    readonly id: string
    readonly text: string
    readonly time: number
    readonly author: string
    readonly parent: string

    constructor(id: string, text: string, time: number, author: string, parent: string) {
        this.id = id;
        this.text = text;
        this.time = time;
        this.author = author;
        this.parent = parent;
    }
}