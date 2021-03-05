import Application from "koa";
import Router from "koa-router";
import { responseTimeLogger } from "./middleware/ResponseTimeLogger"

const mount = require('koa-mount');
const app = new Application();
const router = new Router();
const port = 3000;

app.use(responseTimeLogger);

app.use(mount(require('./router/car.js')))

app.use(router.routes())

// app.use(async (ctx) => {
//     ctx.body = "Hello World";
// });

app.listen(port, () => {
    console.log(`Listening on localhost:${port}`);
});
