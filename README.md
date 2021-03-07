# Hacker News API

## How to run this project
1. Start Elasticsearch and PostgreSQL
```bash
$ docker-compose up
```
2. Configure elasticsearch
```bash
$ curl -XPOST localhost:9200/_template/hacker_news -H "Content-Type: application/json" --data "@elasticsearch/template.json"
```
