import Router from "koa-router"
import StoryService from "../service/StoryService"
import {httpStatus} from "../exception/Exceptions";

const router = new Router()
const dao = new StoryService()

router.put('/addStory', async (ctx) => {
    await dao.addStory(ctx.request.body.story_id.toString(), ctx.request.body.collection_id)
        .then(response => {
            ctx.body = response
        })
        .catch(error => {
            ctx.status = httpStatus(error.type)
            ctx.body = {
                error: error.message
            }
        })
})

router.get('/story/:id', async (ctx) => {
    await dao.getStory(ctx.params.id)
        .then(response => {
            if (typeof response !== 'undefined') {
                ctx.body = response
            } else {
                ctx.status = 404
            }
        })
});

export = router