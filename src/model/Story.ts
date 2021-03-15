export = class Story {

    readonly id: string
    readonly title: string
    readonly time: number
    readonly author: string

    constructor(id: string, title: string, time: number, author: string) {
        this.id = id;
        this.title = title;
        this.time = time;
        this.author = author;
    }
}

class ESType {
    constructor(parent: string) {
        this.parent = parent;
    }
    readonly name = "story"
    readonly parent: string
}