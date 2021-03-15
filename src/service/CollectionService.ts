import Collection from "../model/Collection"
import {GetResponse, SearchResponse} from "elasticsearch"
import esClient from "./ESClient"


export = class CollectionService {

    /**
     * TODO: Get collection including stories, but without comments
     */
    public getCollection(id: string): Promise<Collection> {
        return esClient.get<ESCollection>({
            index: 'hacker_news',
            type: '_doc',
            id: id
        }).then((response: GetResponse<ESCollection>) => {
            return new Collection(
                response._id,
                response._source.collection_name,
                response._source.collection_owner_id
            )
        })
    }

    /**
     * TODO: Get only preview of collections without stories
     */
    public getAllCollections(): Promise<Array<Collection>> {
        return esClient.search<ESCollection>({
            index: 'hacker_news',
            q: "type:collection"
        }).then((response: SearchResponse<ESCollection>) => {
            return response.hits.hits.map(searchHit => {
                return new Collection(
                    searchHit._id,
                    searchHit._source.collection_name,
                    searchHit._source.collection_owner_id
                )
            })
        })
    }

    public newCollection(name: string, ownerId: number): Promise<Collection> {
        return esClient.index({
            index: 'hacker_news',
            type: '_doc',
            body: {
                collection_name: name,
                collection_owner_id: ownerId,
                type: "collection"
            }
        }).then(response => {
            return new Collection(response._id, name, ownerId)
        })
    }

    public updateCollection(id: string, name: string, ownerId: number): Promise<Collection> {
        return esClient.index({
            id: id,
            index: 'hacker_news',
            type: '_doc',
            body: {
                collection_name: name,
                collection_owner_id: ownerId,
                type: "collection"
            }
        }).then(response => {
            return new Collection(response._id, name, ownerId)
        })
    }

    public deleteCollection(id: string): Promise<void> {
        return esClient.delete({
            id: id,
            index: 'hacker_news',
            type: '_doc'
        }).then()
    }

}

class ESCollection {
    readonly collection_name: string
    readonly collection_owner_id: number

    constructor(collection_name: string, collection_owner_id: number) {
        this.collection_name = collection_name;
        this.collection_owner_id = collection_owner_id;
    }
}