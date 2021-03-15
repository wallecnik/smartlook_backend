import {Client} from "elasticsearch";

export = new Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.x'
});