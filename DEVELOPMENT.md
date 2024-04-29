## Helpful scripts

### Check versions of Remix deps

```sh
npm ls @remix-run/{express,node,react,server-runtime,eslint-config,serve}
```

### Update Remix

```sh
npm i  --save-exact -w . @remix-run/{express,node,react,server-runtime}@2.8.0
npm i  --save-dev --save-exact -w . @remix-run/{eslint-config,serve}@2.8.0
```
