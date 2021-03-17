import Story from "./Story"

export = class Collection {

    readonly id: string
    readonly name: string
    readonly owner_id: number
    readonly stories: Array<Story> | undefined

    constructor(id: string, name: string, owner_id: number, stories: Array<Story> | undefined = undefined) {
        this.id = id;
        this.name = name;
        this.owner_id = owner_id;
        this.stories = stories
    }
}