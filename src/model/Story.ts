import Comment from "./Comment"

export = class Story {

    readonly id: string
    readonly title: string
    readonly time: number
    readonly author: string
    readonly url: string
    readonly comments: Array<Comment> | undefined

    constructor(id: string, title: string, time: number, author: string, url: string, comments: Array<Comment> | undefined = undefined) {
        this.id = id;
        this.title = title;
        this.time = time;
        this.author = author;
        this.url = url;
        this.comments = comments
    }
}