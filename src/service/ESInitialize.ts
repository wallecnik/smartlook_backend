import esClient from "./ESClient"
import axios from "axios";

export = async function initESIndices(): Promise<void> {
    await initIndex("hacker_news_collection", {
        properties: {
            name: {
                type: "text",
                fields: {
                    keyword: {
                        type: "keyword"
                    }
                }
            },
            owner_id: {
                type: "integer"
            }
        }
    });
    await initIndex("hacker_news_story", {
        properties: {
            type: {
                type: "join",
                relations: {
                    story: "comment"
                }
            },
            title: {
                type: "text"
            },
            time: {
                type: "date",
                format: "epoch_millis"
            },
            text: {
                type: "text"
            },
            author: {
                type: "text",
                fields: {
                    keyword: {
                        type: "keyword"
                    }
                }
            },
            url: {
                type: "keyword"
            },
            parent: {
                type: "keyword"
            },
            collection: {
                type: "keyword"
            }
        }
    });
}

async function initIndex(index: string, mapping: unknown): Promise<void> {
    let exists = false
    await esClient.indices.exists({index: index})
        .then(x => exists = x)
    if (!exists) {
        await esClient.indices.create({index: index})
        await axios.put(`http://localhost:9200/${index}/_mapping`, mapping) // because client uses obsolete "type"
    }
}