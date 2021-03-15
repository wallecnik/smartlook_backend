import axios from "axios"
import Story from "../model/Story"
import esClient from "./ESClient"

export = class StoryService {

    /**
     * Saves snapshot of story and its comments. Story is returned immediatelly
     */
    public async addStory(storyId: number, collectionId: string): Promise<Story> {
        const hnStory: HNStory = await this.fetchHNStory(storyId)
        const story = await this.indexStory(storyId, hnStory, collectionId)
        this.indexAllComments(storyId, collectionId, hnStory)
            .catch(error => {
                console.error(`Failed to synchronize comments:\n ${error}`)
            })
        return story
    }

    private async indexAllComments(storyId: number, collectionId: string, hnStory: HNStory): Promise<void> {
        const comments = await this.syncAllComments(hnStory);
        await this.indexStory(storyId, hnStory, collectionId, comments)
    }

    private async syncAllComments(hnItem: HNStory | HNComment): Promise<Array<unknown>> {
        const esComments = Array<unknown>()
        if (typeof hnItem.kids !== 'undefined') {
            for (const hnCommentPromise of hnItem.kids) {
                const hnComment = await hnCommentPromise
                esComments.push({
                    id: hnComment.id,
                    text: hnComment.text,
                    author: hnComment.author,
                    parent: hnComment.parent
                })
                const hnCommentsSet = await this.syncAllComments(hnComment)
                hnCommentsSet.forEach(x => esComments.push(x))
            }
        }
        return esComments
    }

    private indexStory(storyId: number, hnStory: HNStory, collectionId: string, comments?: Array<unknown>): Promise<Story> {
        return esClient.index({
            id: storyId.toString(),
            index: 'hacker_news',
            type: '_doc',
            routing: collectionId,
            body: {
                story_title: hnStory.title,
                story_time: hnStory.time * 1000,
                story_author: hnStory.author,
                story_url: hnStory.url,
                story_comments: comments,
                type: {
                    name: "story",
                    parent: collectionId
                }
            }
        }).then(response => {
            return new Story(response._id, hnStory.title, hnStory.time, hnStory.author)
        })
    }

    private async fetchHNStory(storyId: number): Promise<HNStory> {
        return axios.get(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)
            .then(response => {
                if (response.data.type == "story") {
                    let kidsPromises = undefined;
                    if (typeof response.data.kids !== 'undefined') {
                        kidsPromises = response.data.kids.map((commentId: number) => {
                            return this.fetchHNComment(commentId)
                        })
                    }
                    return new HNStory(
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

    private async fetchHNComment(commentId: number): Promise<HNComment> {
        return axios.get(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`)
            .then(response => {
                if (response.data.type == "comment") {
                    let kidsPromises = undefined;
                    if (typeof response.data.kids !== 'undefined') {
                        kidsPromises = response.data.kids.map((commentId: number) => {
                            return this.fetchHNComment(commentId)
                        })
                    }
                    return new HNComment(
                        response.data.id,
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
    readonly time: number
    readonly title: string
    readonly author: string
    readonly url: string
    readonly kids: Array<Promise<HNComment>>

    constructor(time: number, title: string, author: string, url: string, kids: Array<Promise<HNComment>>) {
        this.time = time
        this.title = title
        this.author = author
        this.url = url
        this.kids = kids
    }
}

class HNComment {
    readonly id: number
    readonly text: string
    readonly author: string
    readonly parent: string
    readonly kids: Array<Promise<HNComment>>

    constructor(id: number, text: string, author: string, parent: string, kids: Array<Promise<HNComment>>) {
        this.id = id
        this.text = text
        this.author = author
        this.parent = parent
        this.kids = kids
    }
}