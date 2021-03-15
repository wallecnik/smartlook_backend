import Application from "koa";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import json from "koa-json";
import collectionRouter from "./router/CollectionRouter";
import storyRouter from "./router/StoryRouter";


const app = new Application();
const port = 3000;

app.use(logger())
app.use(bodyParser());
app.use(json());
app.use(collectionRouter.routes())
app.use(storyRouter.routes())

app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
});
