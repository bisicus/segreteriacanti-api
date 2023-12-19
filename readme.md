- [Intro](#intro)
- [Start this project](#start-this-project)
- [MVC](#mvc)
  - [Model behaviors](#model-behaviors)
    - [soft-delete](#soft-delete)

# Intro

This is an API that allows handling recordings for CL SegreteriaCanti.

Recordinds, translations, chords/tab, music sheets are stored in a filesystem.
This application is encharged to know the exact location of each file

# Start this project

create a .env file starting from [.env-template](./.env-template)

```bash
docker compose -f ./docker-compose.yaml --env-file ./.env up -d
npm ci
npx prima migrate dev
npm run dev
```

# MVC

Main pattern is [Model-Control-View](https://www.geeksforgeeks.org/mvc-design-pattern/)

- Model: [prisma ORM](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma)
- Controller: TBD
- View: JSON responses

## Model behaviors

### soft-delete

Soft-delete pattern to avoid resource deletion
Behavior is exploited via [`prisma` soft-delete extension](https://github.com/olivierwilkinson/prisma-extension-soft-delete/tree/v1.0.0)
Model presenting soft-delete behavior presents one of the following columns:

- `deleteAt` - TIMESTAMP
