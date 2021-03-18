import Collection from "../model/Collection"
import {GetResponse, SearchResponse} from "elasticsearch"
import esClient from "./ESClient"
import StoryService from "./StoryService"
import {ESCollection} from "../model/ESObjects";

const storyService = new StoryService()

export = class CollectionService {

    /**
     * Possible enhancement - get collection with stories
     */
    public async getCollection(id: string): Promise<undefined | Collection> {
        const stories = await storyService.getStories(id)
        return esClient.get<ESCollection>({
            index: 'hacker_news_collection',
            type: '_doc',
            id: id
        }).then((response: GetResponse<ESCollection>) => {
            return new Collection(
                response._id,
                response._source.name,
                response._source.owner_id,
                stories
            )
        }).catch(error => {
            if (error.status == 404) {
                return undefined
            }
            throw error
        });
    }

    /**
     * Possible enhancement - get collection with pagination
     */
    public getAllCollections(): Promise<Array<Collection>> {
        return esClient.search<ESCollection>({
            index: 'hacker_news_collection'
        }).then((response: SearchResponse<ESCollection>) => {
            return response.hits.hits.map(searchHit => {
                return new Collection(
                    searchHit._id,
                    searchHit._source.name,
                    searchHit._source.owner_id
                )
            })
        })
    }

    public newCollection(name: string, ownerId: number): Promise<Collection> {
        return esClient.index({
            index: 'hacker_news_collection',
            type: '_doc',
            body: {
                name: name,
                owner_id: ownerId
            }
        }).then(response => {
            return new Collection(response._id, name, ownerId)
        })
    }

    public updateCollection(id: string, name: string, ownerId: number): Promise<undefined | Collection> {
        return esClient.index({
            id: id,
            index: 'hacker_news_collection',
            type: '_doc',
            body: {
                name: name,
                owner_id: ownerId
            }
        }).then(response => {
            return new Collection(response._id, name, ownerId)
        }).catch(error => {
            if (error.status == 404) {
                return undefined
            }
            throw error
        })
    }

    public deleteCollection(id: string): Promise<void | undefined> {
        return esClient.delete({
            id: id,
            index: 'hacker_news_collection',
            type: '_doc'
        }).then(response => {
            return
        })
            .catch(error => {
            if (error.status == 404) {
                return undefined
            }
            throw error
        })
    }

}