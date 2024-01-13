// Copied from https://expressjs.com/en/starter/hello-world.html
// Modified by Adam Akiva

import express from "express";

const app = express();
const port = process.env.SERVER_PORT;

app.get("/", (_, res) => {
  // Try to add a breakpoint on line 14 and open localhost:3000
  // in your browser with the debugger connected, if everything
  // works you should stop on that line and be able to inspect
  // all variables
  const tmp = "Hello World!";

  res.send(tmp);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
