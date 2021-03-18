import Collection from "../model/Collection";
import Story from "../model/Story";
import Comment from "../model/Comment";

export interface SearchResult {
    collections: Array<Collection>
    stories: Array<Story>
    comments: Array<Comment>
}