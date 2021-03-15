export = class Collection {

    readonly id: string
    readonly name: string
    readonly owner_id: number

    constructor(id: string, name: string, owner_id: number) {
        this.id = id;
        this.name = name;
        this.owner_id = owner_id;
    }
}