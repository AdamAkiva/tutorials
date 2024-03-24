import express from "express";

import { utils } from "./utils.js";

export function createServer() {
  const app = express();

  app.use(utils.protect);

  app.get("/", (_, res) => {
    return res.status(200).json("Hello world");
  });

  return app;
}
