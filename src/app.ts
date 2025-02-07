import Application from "koa";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import json from "koa-json";
import collectionRouter from "./router/CollectionRouter";
import storyRouter from "./router/StoryRouter";
import searchRouter from "./router/SearchRouter";
import StoryService from "./service/StoryService";
import cron from "node-cron";
import {koaSwagger} from 'koa2-swagger-ui';
import serve from "koa-static";
import initESIndices from "./service/ESInitialize"

const app = new Application();
const storyService = new StoryService();
const port = 3000;

app.use(logger())
app.use(bodyParser());
app.use(json());
app.use(collectionRouter.routes())
app.use(storyRouter.routes())
app.use(searchRouter.routes())

app.use(serve('assets'));
app.use(
    koaSwagger({
        swaggerOptions: {
            url: 'http://localhost:3000/swagger.yml'
        },
    }),
);

initESIndices().then(_ => {
    app.listen(port, () => {
        console.log(`Server running at localhost:${port}`);
    })
})

cron.schedule('*/15 * * * *', () => {
    storyService.syncAllStories()
});


