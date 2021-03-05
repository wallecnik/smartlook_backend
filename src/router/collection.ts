const Koa = require('koa');
const router = require('koa-router')();
const app = new Koa();


// Route to handle GET request
router.get('/car', async (ctx, next) => {
    ctx.body = car;
    await next();
});
app.use(router.routes()); // route middleware
module.exports = app;