import {Collection} from "../model/Collection"
import {Client, GetResponse} from "elasticsearch"
import {CollectionDTO} from "../dto/CollectionDTO";

class CollectionDao {
    private client: Client

    constructor() {
        this.client = new Client({
            host: 'localhost:9200',
            log: 'trace',
            apiVersion: '7.x'
        });
    }

    public async getCollection(id: string): Promise<CollectionDTO> {
        return this.client.get<Collection>({
            index: 'hacker_news',
            type: '_doc',
            id: id
        }).then((response: GetResponse<Collection>) => {
            return new CollectionDTO(
                response._id,
                response._source.collection_name,
                response._source.collection_owner_id
            )
        })
    }

    public async newCollection(name: string, ownerId: bigint): Promise<CollectionDTO> {
        const collection = new Collection(name, ownerId);
        return this.client.index<Collection>({
            index: 'hacker_news',
            type: '_doc',
            body: collection
        }).then(response => {
            return new CollectionDTO(response._id, name, ownerId)
        })
    }

    public async updateCollection(id: string, name: string, ownerId: bigint): Promise<CollectionDTO> {
        const collection = new Collection(name, ownerId);
        return this.client.index({
            id: id,
            index: 'hacker_news',
            type: '_doc',
            body: collection
        }).then(response => {
            return new CollectionDTO(response._id, name, ownerId)
        })
    }

    public async deleteCollection(id: string): Promise<void> {
        return this.client.delete({
            id: id,
            index: 'hacker_news',
            type: '_doc'
        }).then()
    }


    // public addStory(storyId: number, collectionId): object {
    //     axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json?print=pretty`)
    //         .then(response => {
    //
    //         })
    // }

}

export = CollectionDao