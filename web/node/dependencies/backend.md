## A list of recommended packages for NodeJS backend development

### Last update: 13.01.2023

### 7 minutes read

---

This is a list comprising my (from experience) favorite packages, separated by
subject. The order of packages is arbitrary, without any thought behind it, the
relevant stuff to pay attention to is written as comments.

**If you have any questions/complaints/suggestion, please contact me.**

---

### Database

1. **DrizzleORM** - My favorite by far. Reason being the simplicity, close to pure SQL
   syntax and actually an ORM which helps you build your code, not enforcing you
   to it's own specific format and rules. (still in alpha, version < 1.0)
2. **TypeORM** - Typescript supported ORM, one of the most popular ones, robust
   with a lot community support. (still in alpha, version < 1.0)
3. **Sequelize** - Choosing the old-reliable. Has support for javascript and
   typescript. However if you are writing with typescript I would recommend one
   of the previous 2, because the typescript compatibility is lackluster.
4. **MongoDB/mongoose** (native driver/wrapper) - One of the most popular
   non-relational database driver for NodeJS. Mongoose is a library on top of
   the base driver for more options and less code-bloat.
5. **IORedis** - Redis driver for NodeJS. Redis is one of the most popular in-memory
   caching database. This should be used in conjunction with another database, or
   it can be used as a standalone.

| Library          | ORM | Relational | Typescript support | Popularity | Maintainable |
| ---------------- | --- | ---------- | ------------------ | ---------- | ------------ |
| DrizzleORM       | Yes | Yes        | Yes                | Low        | Frequently   |
| TypeORM          | Yes | Yes        | Yes                | High       | Frequently   |
| Sequelize        | Yes | Yes        | Yes (complex)      | High       | Frequently   |
| MongoDB/Mongoose | No  | No         | Yes                | Very high  | Frequently   |
| IORedis          | No  | No         | Yes                | Very high  | Frequently   |

---

### Http Server

1. **Express** - The old reliable, used by so many people and companies. Has external
   typescript support. Not updated frequently, probably due to being so reliable.
2. **Hono** - My favorite. Extremely light and simple (0 dependencies!).
   Has built-in typescript support and very simple syntax. Faster then many
   alternatives due to it's [RegExpRouter resolver](https://hono.dev/concepts/routers#regexprouter)
3. **Fastify** - Considered to be the fasted (who would have guessed by the name),
   have a steep learning curve. Fully supports typescript but with a non-trivial
   syntax.
4. **Helmet, CORS** - Security plugins you should always use in whichever framework
   you are using.

| Library | Size  | Typescript support     | Popularity     | Maintainable |
| ------- | ----- | ---------------------- | -------------- | ------------ |
| Express | Light | Yes (external package) | Extremely high | Rarely       |
| Hono    | light | Yes                    | Low            | Frequently   |
| Fastify | Heavy | Yes (non-trivial)      | High           | Frequently   |

---

### Websocket Server

1. **WS** - The defacto goto client and server implementation for websockets in
   nodejs. 0 dependencies and light. With that said, not easy to use correctly
   (in comparison to socket.io for example). Has full typescript support via
   external package. A lot of other packages are based on this one.
2. **Socket.io** - A more friendly option to use for socket connection, has
   different packages for frontend and backend use. Has full built-in typescript
   support.
3. **GraphQL-WS** - A client and server package for GraphQL over Websocket
   protocol for usage in subscription. Has full typescript built-in support.

| Library    | Size   | Typescript support     | Popularity     | Maintainable |
| ---------- | ------ | ---------------------- | -------------- | ------------ |
| WS         | Light  | Yes (external package) | Extremely high | Frequently   |
| Socket.io  | Medium | Yes                    | High           | Frequently   |
| GraphQL-WS | Light  | Yes                    | High           | Frequently   |

---

### GraphQL Server

1. **GraphQL-Yoga** - My favorite. Very basic, integrates well with your code,
   does not force a specific style on you. Has full typescript support.
2. **Apollo-Server** - More on the framework side of things, has support for
   pretty much everything GraphQL related, whether from it and from additional
   packages in the same scope. Has full typescript support.
3. **Helmet, CORS, graphql-armor-<\*>** - Security plugins you should always use in
   whichever framework you are using. Consult other projects on how to configure
   them correctly.

| Library       | Size        | Typescript support | Popularity | Maintainable |
| ------------- | ----------- | ------------------ | ---------- | ------------ |
| GraphQL-Yoga  | Light       | Yes                | Medium     | Frequently   |
| Apollo-server | Medium/High | Yes                | Medium     | Frequently   |

---

### Validation

1. **Joi** - Not many other options better than this for javascript. This is schema
   based validation library (Not JSON based). If you are using javascript for your
   project, you most likely want this option.
2. **Zod** - Not many other options better than this for typescript. This is schema
   based validation library (Not JSON based). If you are using typescript for your
   project, you most likely want this option.

| Library | Size   | Typescript support | Popularity | Maintainable |
| ------- | ------ | ------------------ | ---------- | ------------ |
| Joi     | Medium | Yes                | Very High  | Frequently   |
| Zod     | Medium | Yes (much better)  | Very High  | Frequently   |

---

### Testing

1. **Vitest** - Mostly intended for frontend (vite related) projects. However, from
   my experience this is far superior to Jest while talking about typescript with
   ES6 support. Fully compatible with Jest, so migration should be trivial.
2. **Jest** - The defacto standard for testing framework. Can be used with either
   Javascript or Typescript. Has some needed configuration for typescript and
   ECMA6 projects. If you use either typescript and ESM I recommend Vitest instead.

| Library | Size   | Typescript support | Popularity | Maintainable |
| ------- | ------ | ------------------ | ---------- | ------------ |
| Vitest  | Medium | Yes                | High       | Frequently   |
| Jest    | Low    | Yes                | Very High  | Frequently   |

### Http requests

1. **Ky** - Supports Browsers/NodeJS/Deno with 0 dependencies. Based on fetch API.
   Written and has full typescript support.
2. **Axios** - The old reliable. Works and used fo so long it is practically the
   defacto-standard. Has ok typescript support, and few dependencies.
3. **Supertest** - Used mainly for testing. Able to receive an HttpServer instance,
   and start it on an ephemeral port.

| Library   | Size   | Typescript support | Popularity     | Maintainable |
| --------- | ------ | ------------------ | -------------- | ------------ |
| Ky        | Low    | Yes                | High           | Frequently   |
| Axios     | Medium | Yes                | Extremely High | Frequently   |
| Supertest | Low    | Yes                | Very High      | Frequently   |

---

### Configuration

1. **eslint, eslint-config-prettier, eslint-plugin-security** - A must use for
   whichever project you are writing in either javascript/typescript.
2. **nodemon** - A library for rerunning your project on changes, there are other
   options, and if you are using a large framework (Nest for example), you probably
   won't need this, because it will have a built-in option.
3. **patch-package** - A package used to make fixes to local package/s, this may
   /may not be needed and depends on which libraries your project depends on.
4. **prettier** - Formatter for you code, may conflict with eslint, search the
   web on how to resolve it.
5. **depcheck** - A library to check with packages in your package.json are in use.
6. **dpdm** - A library to analyze your code with diagnostics for many aspects. I
   mainly use it for circular dependency checks.
7. **npm-check-updates** - A package which may check if you have any updates for
   your packages, to which version and the option to choose whether you only want
   to view the updates or actually update them as well.
