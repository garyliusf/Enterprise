# Bolt home page (prototype)

A new bolt.new home page, started on 2026-10-16 as a copy of the Builders
Week campaign page (`../founders-week/`). Nothing from the current bolt.new
home design is used. Production lives in the app repo (`stackblitz/bolt`),
like the pricing page, so this sandbox copy is the design source until it is
ported there.

## Run it

```bash
npm run dev
```

(`node_modules` is a symlink to `../founders-week/node_modules`; run
`npm install` here if the two ever need different dependencies.)

## Staging preview

`npm run build:preview` builds a static copy into `preview/`, served at
https://garyliusf.github.io/Enterprise/home/preview/ . Rebuild and commit
`preview/` to update it.
