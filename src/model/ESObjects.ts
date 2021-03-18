export interface ESCollection {
    readonly name: string
    readonly owner_id: number
}

export interface ESItem {
    readonly time: number
    readonly title: string
    readonly author: string
    readonly url: string
    readonly text: string
    readonly parent: string
    readonly collection: string
}