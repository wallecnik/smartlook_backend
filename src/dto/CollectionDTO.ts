
export class CollectionDTO {

    readonly id: string
    readonly name: string
    readonly owner_id: bigint

    constructor(id: string, name: string, owner_id: bigint) {
        this.id = id;
        this.name = name;
        this.owner_id = owner_id;
    }
}