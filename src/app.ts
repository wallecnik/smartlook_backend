import Application from "koa";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import json from "koa-json";
import collectionsRouter from "./router/CollectionRouter";


const app = new Application();
const port = 3000;

app.use(logger())
app.use(bodyParser());
app.use(json());
app.use(collectionsRouter.routes())

app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
});
