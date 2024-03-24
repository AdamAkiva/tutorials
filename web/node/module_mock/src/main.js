import { createServer } from "./server.js";

createServer().listen(6721, () => {
  console.log("Server is running");
});
