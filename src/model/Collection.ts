
export class Collection {

    readonly collection_name: string
    readonly collection_owner_id: bigint


    constructor(collection_name: string, collection_owner_id: bigint) {
        this.collection_name = collection_name;
        this.collection_owner_id = collection_owner_id;
    }
}