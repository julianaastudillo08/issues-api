# Issues API

**EN:** Express + SQLite issue tracker — CRUD with Zod, filter by status/priority/label/assignee, search (?q=), /api/issues/stats, Node 22 `node:sqlite`.

**ES:** API de issues con Express + SQLite — CRUD con Zod, filtros, búsqueda y estadísticas.

## Setup

```bash
npm install
npm run init-db
npm start
```

Default port: `3881` (override with `PORT`).

## curl examples

```bash
curl http://localhost:3881/api/issues
curl "http://localhost:3881/api/issues?status=open&priority=high"
curl http://localhost:3881/api/issues/stats
curl -X POST http://localhost:3881/api/issues -H "Content-Type: application/json" -d "{\"title\":\"Bug login\",\"priority\":\"critical\",\"labels\":[\"bug\"]}"
curl -X PATCH http://localhost:3881/api/issues/1 -H "Content-Type: application/json" -d "{\"status\":\"done\"}"
curl -X DELETE http://localhost:3881/api/issues/1
```

## Author

Juliana Chantre Astudillo — MIT License
