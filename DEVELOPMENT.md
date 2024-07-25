## Helpful scripts

### Check versions of Remix deps

```sh
npm ls @remix-run/{express,node,react,server-runtime,eslint-config,dev,serve,testing}
```

### Update Remix

```sh
node scripts/run.js "npm i --save-exact -w . @remix-run/{express,node,react,server-runtime}@2.8.1"
node scripts/run.js "npm i --save-dev --save-exact -w . @remix-run/{eslint-config,serve,dev,testing}@2.8.1"
```
