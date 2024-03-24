// Couple of things to notice here:
// Firstly, the jest.unstable_mockModule is BEFORE the relevant imports.
// That includes createServer, since it uses it. See: https://jestjs.io/docs/ecmascript-modules#module-mocking-in-esm
// Secondly, supertest gets the express instance which sets up a new server for
// the tests
// Thirdly, pay close attention to the structure of the module mock

import { jest } from "@jest/globals";
import supertest from "supertest";

jest.unstable_mockModule("../src/utils.js", () => ({
  // Pay attention to the utils field in the object, since it is not a default
  // export, this is the same name as the exported variable from '../src/utils.js'
  utils: {
    protect: jest.fn((req, res, next) => {
      return next();
    }),
  },
}));

// Dynamic import on purpose, it has to be this way, see the link above
const { createServer } = await import("../src/server.js");

// Create the supertest instance with the server instance
const http = supertest(createServer());

describe("Tests", () => {
  it("Protect", async () => {
    const res = await http.get("/");

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual("Hello world");
  });
});
