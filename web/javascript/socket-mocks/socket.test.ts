import { createServer, type Server } from "node:http";

import { Server as SocketServer, type Socket as ServerSocket } from "socket.io";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**********************************************************************************/

// The use of new Promise is the vitest way to make this work: https://jestjs.io/docs/asynchronous#callbacks
// Event emitters (sockets in our case) use callbacks, therefore we must use
// this syntax

let httpServer: Server;
let wss: SocketServer;
let serverSocket: ServerSocket;
let clientSocket: ClientSocket;

beforeAll(() => {
  return new Promise<void>((resolve) => {
    const port = 3000;

    httpServer = createServer();
    wss = new SocketServer(httpServer);
    httpServer.listen(port, () => {
      clientSocket = ioc(`http://localhost:${port}`);
      wss.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", resolve);
    });
  });
});

afterAll(() => {
  wss.close();
  clientSocket.close();
  httpServer.close();
});

/**********************************************************************************/

describe("Tests", () => {
  it("Basic emit", () => {
    return new Promise<void>((resolve) => {
      clientSocket.on("hello", (arg) => {
        expect(typeof arg).toStrictEqual("string");
        expect(arg).toStrictEqual("world");
        resolve();
      });
      serverSocket.emit("hello", "world");
    });
  });

  it("Basic emit with ack", () => {
    return new Promise<void>((resolve) => {
      serverSocket.on("hello", (cb) => {
        cb("world");
      });
      clientSocket.emit("hello", (arg) => {
        expect(typeof arg).toStrictEqual("string");
        expect(arg).toStrictEqual("world");
        resolve();
      });
    });
  });

  it("Basic emit with ack (promise)", async () => {
    serverSocket.on("hello", (cb) => {
      cb("world");
    });
    const res = await clientSocket.emitWithAck("hello");
    expect(typeof res).toStrictEqual("string");
    expect(res).toStrictEqual("world");
  });
});
