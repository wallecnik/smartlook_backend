import Router from "koa-router"
import StoryService from "../service/StoryService"

const router = new Router()
const dao = new StoryService()

router.put('/addStory', async (ctx) => {
    await dao.addStory(ctx.request.body.story_id, ctx.request.body.collection_id)
        .then(response => {
            ctx.body = response
        })
})

export = router