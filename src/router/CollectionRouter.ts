import Router from "koa-router";
import CollectionService from "../service/CollectionService";

const router = new Router();
const dao = new CollectionService();

router.get('/collection', async (ctx) => {
    await dao.getAllCollections()
        .then(response => {
            ctx.body = response
        })
});

router.get('/collection/:id', async (ctx) => {
    await dao.getCollection(ctx.params.id)
        .then(response => {
            if (typeof response !== 'undefined') {
                ctx.body = response
            } else {
                ctx.status = 404
            }
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
            if (typeof response !== 'undefined') {
                ctx.body = response
            } else {
                ctx.status = 404
            }
        })
});

router.delete('/collection/:id', async (ctx) => {
    await dao.deleteCollection(ctx.params.id)
        .then(response => {
            if (typeof response !== 'undefined') {
                ctx.status = 204
            } else {
                ctx.status = 404
            }
        })
});

export = router