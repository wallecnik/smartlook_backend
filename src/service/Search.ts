import Collection from "../model/Collection";
import Story from "../model/Story";
import Comment from "../model/Comment";
import esClient from "./ESClient"
import {SearchResponse} from "elasticsearch";
import {ESCollection, ESItem} from "../model/ESObjects";
import {SearchResult} from "./SearchResult";

export = class Search {

    public async search(q: string): Promise<SearchResult> {
        const collections = this.fetchCollections(q);
        const stories = this.fetchStories(q);
        const comments = this.fetchComments(q);

        return {
            collections: await collections,
            stories: await stories,
            comments: await comments
        }
    }

    private fetchCollections(q: string): Promise<Array<Collection>> {
        return esClient.search<ESCollection>({
            index: "hacker_news_collection",
            body: {
                query: {
                    match: {
                        name: q
                    }
                }
            }
        }).then((response: SearchResponse<ESCollection>) => {
            return response.hits.hits.map(searchHit => {
                return new Collection(
                    searchHit._id,
                    searchHit._source.name,
                    searchHit._source.owner_id
                )
            })
        });
    }

    private fetchStories(q: string): Promise<Array<Story>> {
        return esClient.search<ESItem>({
            index: "hacker_news_story",
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
                            },
                            {
                                bool: {
                                    should: [
                                        {
                                            match: {
                                                title: q
                                            }
                                        },
                                        {
                                            match: {
                                                author: q
                                            }
                                        }
                                    ]
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
        });
    }

    private fetchComments(q: string): Promise<Array<Comment>> {
        return esClient.search<ESItem>({
            index: "hacker_news_story",
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    type: {
                                        value: "comment"
                                    }
                                }
                            },
                            {
                                bool: {
                                    should: [
                                        {
                                            match: {
                                                text: q
                                            }
                                        },
                                        {
                                            match: {
                                                author: q
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
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
        });
    }
}
