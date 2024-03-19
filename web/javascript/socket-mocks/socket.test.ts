import { Server as SocketServer, type Socket as ServerSocket } from "socket.io";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**********************************************************************************/

// Sources:
// Socket io test docs: https://socket.io/docs/v4/testing/
// Typescript socket io: https://github.com/socketio/socket.io/issues/3742#issuecomment-796801645
// Callback to promise: https://exploringjs.com/es6/ch_promises.html#sec_creating-using-promises

type ServerEvents = {
  hello1: (arg: "world1") => void;
  hello2: (cb: (arg: "world2") => void) => void;
  hello3: (cb: (arg: "world3") => void) => void;
};

type ClientEvents = {
  hello1: (arg: "world1") => void;
  hello2: (cb: (arg: "world2") => void) => void;
  hello3: (cb: (arg: "world3") => void) => void;
};

/**********************************************************************************/

let wss: SocketServer;
let serverSocket: ServerSocket<ServerEvents>;
let clientSocket: ClientSocket<ClientEvents>;

beforeAll(() => {
  return new Promise<void>((resolve) => {
    const port = 3000;

    wss = new SocketServer(port);
    clientSocket = ioc(`http://localhost:${port}`);
    wss.on("connection", (socket) => {
      serverSocket = socket;
    });
    clientSocket.on("connect", resolve);
  });
});

afterAll(() => {
  wss.close();
  clientSocket.close();
});

/**********************************************************************************/

describe("Tests", () => {
  it("Basic emit", () => {
    return new Promise<void>((resolve) => {
      clientSocket.on("hello1", (arg) => {
        expect(typeof arg).toStrictEqual("string");
        expect(arg).toStrictEqual("world1");
        resolve();
      });
      serverSocket.emit("hello1", "world1");
    });
  });

  it("Basic emit with ack", () => {
    return new Promise<void>((resolve) => {
      serverSocket.on("hello2", (cb) => {
        cb("world2");
      });
      clientSocket.emit("hello2", (arg) => {
        expect(typeof arg).toStrictEqual("string");
        expect(arg).toStrictEqual("world2");
        resolve();
      });
    });
  });

  it("Basic emit with ack (promise)", async () => {
    serverSocket.on("hello3", (cb) => {
      cb("world3");
    });
    const res = await clientSocket.emitWithAck("hello3");
    expect(typeof res).toStrictEqual("string");
    expect(res).toStrictEqual("world3");
  });
});
