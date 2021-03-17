import {Client} from "elasticsearch";

export = new Client({
    host: process.env.ELASTICSEARCH_HOST,
    log: 'trace',
    apiVersion: '7.x'
});