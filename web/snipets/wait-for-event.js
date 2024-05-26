/**
 * This code snippet shows how to wait for an event to be emitted before
 * moving on with the code execution.
 * This example is how to wait for http server listen to complete before
 * moving on with the code execution while randomizing the port number and
 * returning it back to the caller
 */

async function listen(port) {
  if (port) {
    port = typeof port === "string" ? Number(port) : port;
  }

  return (
    (await new Promise()) <
    number >
    ((resolve) => {
      this._server.once("listening", () => {
        // Can be asserted since this is not a unix socket and we are inside
        // the listen event
        const { address, port } = this._server.address();
        const route = this._routes.http;

        this._logger.info(
          `Server is running in '${this._mode}' mode on: ` +
            `'${
              address.endsWith(":") ? address : address.concat(":")
            }${port}${route}'`
        );

        resolve(this._server.address().port);
      });

      this._server.listen(port);
    })
  );
}
