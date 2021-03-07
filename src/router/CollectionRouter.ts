import Router from "koa-router";
import CollectionDao from "../service/CollectionDao";

const router = new Router();
const dao = new CollectionDao();

router.get('/collection/:id', async (ctx) => {
    await dao.getCollection(ctx.params.id)
        .then(response => {
            ctx.body = response
        })
});

router.put('/collection', async (ctx) => {
    await dao.newCollection(ctx.request.body.name, ctx.request.body.owner_id)
        .then(response => {
            ctx.body = response
        })
});

router.post('/collection/:id', async (ctx) => {
    await dao.updateCollection(ctx.params.id, ctx.request.body.name, ctx.request.body.owner_id)
        .then(response => {
            ctx.body = response
        })
});

router.delete('/collection/:id', async (ctx) => {
    await dao.deleteCollection(ctx.params.id)
        .then(() => {
            ctx.status = 204
        })
});

export = router