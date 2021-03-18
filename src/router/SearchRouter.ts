import Router from "koa-router";
import Search from "../service/Search";

const router = new Router();
const dao = new Search();

router.get('/search', async (ctx) => {
    const toSearch = ctx.request.query.q;
    if (typeof toSearch === 'string') {
        await dao.search(toSearch)
            .then(response => {
                ctx.body = response
            })
    }
});

export = router