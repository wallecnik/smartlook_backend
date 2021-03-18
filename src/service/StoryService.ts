import axios from "axios"
import Story from "../model/Story"
import Comment from "../model/Comment"
import esClient from "./ESClient"
import {NotFoundError} from "../exception/Exceptions";
import {GetResponse, SearchResponse} from "elasticsearch";
import {ESItem} from "../model/ESObjects";

export = class StoryService {

    /**
     * Saves snapshot of story and its comments. Story is returned immediately
     */
    public async addStory(storyId: string, collectionId: string): Promise<Story> {
        if (!await this.collectionExists(collectionId)) {
            throw new NotFoundError("No such collection.")
        }
        const hnStory: HNStory | void = await this.fetchHNStory(storyId)
        if (typeof hnStory !== 'undefined') {
            const story = await this.indexStory(hnStory, collectionId)
            this.syncAllComments(hnStory)
            return story
        }
        throw new NotFoundError(`Story with id: ${storyId} was deleted.`)
    }

    public async getStory(id: number): Promise<undefined | Story> {
        const comments = await this.getComments(id.toString())
        return esClient.get<ESItem>({
            index: 'hacker_news_story',
            type: '_doc',
            id: id.toString()
        }).then((response: GetResponse<ESItem>) => {
            return new Story(
                response._id,
                response._source.title,
                response._source.time,
                response._source.author,
                response._source.url,
                comments
            )
        }).catch(error => {
            if (error.status == 404) {
                return undefined
            }
            throw error
        })
    }

    public syncAllStories(): void {
        esClient.search<ESItem>({
            index: 'hacker_news_story',
            type: '_doc',
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    type: {
                                        value: "story"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }).then((response: SearchResponse<ESItem>) => {
            return response.hits.hits.map(searchHit => {
                return this.addStory(searchHit._id, searchHit._source.collection)
            })
        })
    }

    public async getStories(collectionId: string): Promise<Array<Story>> {
        return esClient.search<ESItem>({
            index: 'hacker_news_story',
            type: '_doc',
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    collection: {
                                        value: collectionId
                                    }
                                }
                            },
                            {
                                term: {
                                    type: {
                                        value: "story"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }).then((response: SearchResponse<ESItem>) => {
            return response.hits.hits.map(searchHit => {
                return new Story(
                    searchHit._id,
                    searchHit._source.title,
                    searchHit._source.time,
                    searchHit._source.author,
                    searchHit._source.url
                )
            })
        })
    }


    public async getComments(storyId: string): Promise<Array<Comment>> {
        return esClient.search<ESItem>({
            index: 'hacker_news_story',
            type: '_doc',
            body: {
                query: {
                    has_parent: {
                        parent_type: "story",
                        query: {
                            ids: {
                                values: [storyId]
                            }
                        }
                    }
                }
            }
        }).then((response: SearchResponse<ESItem>) => {
            return response.hits.hits.map(searchHit => {
                return new Comment(
                    searchHit._id,
                    searchHit._source.text,
                    searchHit._source.time,
                    searchHit._source.author,
                    searchHit._source.parent
                )
            })
        })
    }

    private collectionExists(collectionId: string): Promise<boolean> {
        return esClient.get<undefined>({
            index: 'hacker_news_collection',
            type: '_doc',
            id: collectionId
        }).then(response => {
            return true
        }).catch(error => {
            if (error.status == 404) {
                return false
            }
            throw error
        });
    }

    private syncAllComments(hnItem: HNStory | HNComment): void {
        if (typeof hnItem.kids !== 'undefined') {
            hnItem.kids.forEach(hnCommentPromise => {
                hnCommentPromise.then(hnComment => {
                    if (typeof hnComment !== 'undefined') {
                        this.indexComment(hnComment)
                        this.syncAllComments(hnComment)
                    }
                })

            })
        }
    }

    private indexComment(hnComment: HNComment): void {
        esClient.index({
            id: hnComment.id.toString(),
            index: 'hacker_news_story',
            type: '_doc',
            routing: hnComment.parent.toString(),
            body: {
                text: hnComment.text,
                time: hnComment.time * 1000,
                author: hnComment.author,
                parent: hnComment.parent,
                type: {
                    name: "comment",
                    parent: hnComment.parent
                }
            }
        })
    }

    private indexStory(hnStory: HNStory, collectionId: string): Promise<Story> {
        return esClient.index({
            id: hnStory.id.toString(),
            index: 'hacker_news_story',
            type: '_doc',
            body: {
                title: hnStory.title,
                time: hnStory.time * 1000,
                author: hnStory.author,
                url: hnStory.url,
                type: "story",
                collection: collectionId
            }
        }).then(response => {
            return new Story(
                response._id,
                hnStory.title,
                hnStory.time * 1000,
                hnStory.author,
                hnStory.url
            )
        })
    }

    private async fetchHNStory(storyId: string): Promise<HNStory | void> {
        return axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)
            .then(response => {
                if (response.data.type == "story") {
                    if (response.data.deleted == true) {
                        return
                    }
                    let kidsPromises = undefined;
                    if (typeof response.data.kids !== 'undefined') {
                        kidsPromises = response.data.kids.map((commentId: number) => {
                            return this.fetchHNComment(commentId)
                        })
                    }
                    return new HNStory(
                        response.data.id,
                        response.data.time,
                        response.data.title,
                        response.data.by,
                        response.data.url,
                        kidsPromises
                    )
                } else {
                    throw Error(`Unsupported Type. ID: ${storyId}, Type: '${response.data.type}'`)
                }
            })
    }

    private async fetchHNComment(commentId: number): Promise<HNComment | void> {
        return axios.get(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`)
            .then(response => {
                if (response.data.type == "comment") {
                    if (response.data.deleted == true) {
                        return
                    }
                    let kidsPromises = undefined;
                    if (typeof response.data.kids !== 'undefined') {
                        kidsPromises = response.data.kids.map((commentId: number) => {
                            return this.fetchHNComment(commentId)
                        })
                    }
                    return new HNComment(
                        response.data.id,
                        response.data.time,
                        response.data.text,
                        response.data.by,
                        response.data.parent,
                        kidsPromises
                    )
                } else {
                    throw Error(`Unsupported Type. ID: ${commentId}, Type: '${response.data.type}'`)
                }
            })
    }
}

class HNStory {
    readonly id: number
    readonly time: number
    readonly title: string
    readonly author: string
    readonly url: string
    readonly kids: Array<Promise<HNComment | void>>

    constructor(id: number, time: number, title: string, author: string, url: string, kids: Array<Promise<HNComment | void>>) {
        this.id = id
        this.time = time
        this.title = title
        this.author = author
        this.url = url
        this.kids = kids
    }
}

class HNComment {
    readonly id: number
    readonly time: number
    readonly text: string
    readonly author: string
    readonly parent: string
    readonly kids: Array<Promise<HNComment | void>>

    constructor(id: number, time: number, text: string, author: string, parent: string, kids: Array<Promise<HNComment | void>>) {
        this.id = id
        this.time = time
        this.text = text
        this.author = author
        this.parent = parent
        this.kids = kids
    }
}


