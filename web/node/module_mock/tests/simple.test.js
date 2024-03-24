import supertest from "supertest";
import { createServer } from "../src/server.js";

// Create the supertest instance with the server instance
const http = supertest(createServer());

describe("Tests", () => {
  it("Protect", async () => {
    const res = await http.get("/");

    expect(res.statusCode).toBe(401);
    expect(res.body).toStrictEqual("Unauthorized");
  });
});
