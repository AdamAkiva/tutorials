## NodeJS streams

### Last update: 26/06/2024

### 5-10 minutes read

Streams, you've probably heard the term before, maybe even played with it a bit
but have you ever dove in depth to understand them?  
In the following article we will dive into streams, the reason to use/not use them,
use-cases and maybe even a bit of code examples.

The resources are:
[NodeJS docs](https://nodejs.org/api/stream.html)
[NodeJS back-pressure guide](https://nodejs.org/en/learn/modules/backpressuring-in-streams)

---

### The problem

Let's imagine the following case, you have a file you want to upload an external
storage service (AWS/Azure/GCP are the common examples).  
We can separate the upload process into 2 steps:  
The first being reading the file from your file-system.  
The second being upload the file to the external storage service.  
Let's also assume the file is massive (around 250GB).  
Now the question is how do I handle the file upload?  
Looking at the file size we can easily see that we can't load the entire file to
memory, so what can we do?  
This is a classic use case for streams.  
In many different programming languages there is a very important concept,
handing data and transferring it between different sources.  
There are a couple of ways to achieve this, sockets, pipes, signals to name a few.  
In Javascript we use/have the concept of streams.  
The NodeJS docs say the following about streams: "A stream is an abstract
interface for working with streaming data in Node.js.  
The node:stream module provides an API for implementing the stream interface."

There are four fundamentals stream types in NodeJS:

- Read
- Write
- Duplex
- Transform
  We will mostly talk about read & write streams in this article.  
  Returning back to our example, we can see an easy use case for read & write
  streams to read and pipe the the content of the file to the external service
  (We will assume the external service has a stream API for us to consume).

### The solution

So, streams, you must be wondering how to use them now, so let's start with a
simple code example:

```js
import { createReadStream, createWriteStream } from "node:fs";

function readFile() {
  const rs = createReadStream("<FILE_TO_READ>");
  const ws = createWriteStream("<EXTERNAL_SERVICE_STREAM_OBJECT>");

  rs.pipe(ws);
}
```

Wait is that it?
Well yes and no, this is a very basic example without any error handling.  
**Note:** `pipe` takes care of the back-pressure for us, we will very soon dive
into what that is.  
The example with error handling will look like this:

```js
const rs = createReadStream("<FILE_TO_READ>").on("error", (err) => {
  // Do something
});
const ws = createWriteStream("<EXTERNAL_SERVICE_STREAM_OBJECT>").on(
  "error",
  (err) => {
    // Do something
  }
);

rs.pipe(ws);
```

Seems simple enough, but let's add another layer.  
Let's say we want to compress the file before sending it to the external
storage service.  
Luckily we have another function to handle a case where we use more than two
streams, e.g: Transform the data before writing it.  
The example is as follows:

```js
import { pipeline } from "node:stream";
import fs from "node:fs";
import zlib from "node:zlib";

pipeline(
  fs.createReadStream("<FILE_TO_READ>"),
  zlib.createGzip(),
  fs.createWriteStream("<EXTERNAL_SERVICE_STREAM_OBJECT>"),
  (err) => {
    if (err) {
      console.error("Pipeline failed", err);
    } else {
      console.log("Pipeline succeeded");
    }
  }
);
```

### Back-pressure

This is a good point to talk about back-pressure. So what is back-pressure?
back-pressure is defined by wikipedia as:  
"Back pressure (or backpressure) is the term for a resistance to the desired
flow of fluid through pipes."
let's adjust the terminology to software:  
"Back pressure (or backpressure) is the term for a resistance to the desired
flow of data through software."
So how does it affect us?
Let's imagine the following probable scenario.  
Let's assume the machine we have a SSD in our machine and uploading the file to the
external service is much slower than the speed SSD works on.  
NodeJS, (internally) keeps a 16kb buffer used to keep data from the read stream
until it can be used by the write stream.  
In our case It will fill up rather quickly.  
And then what? NodeJS have a `drain` event which occurs when buffer is empty.  
Listening to that event and resuming the read when the buffer is clean will
resolve the issue.  
Note: Using pipe/pipeline does that automatically for us, this is only needed
if you manually read & write to the stream or implementing the streams by
yourself.  
For example: (Very inefficient, should use promises instead but we will not get
into that here)

```js
// Write the data to the supplied writable stream one million times.
// Be attentive to back-pressure.
function writeOneMillionTimes(writer, data, encoding, callback) {
  let i = 1000000;
  write();

  function write() {
    let ok = true;

    do {
      i--;
      if (i === 0) {
        // Last time!
        writer.write(data, encoding, callback);
      } else {
        // See if we should continue, or wait.
        // Don't pass the callback, because we're not done yet.
        // write returns false if we should wait for the drain event
        ok = writer.write(data, encoding);
      }
    } while (i > 0 && ok);

    if (i > 0) {
      // Had to stop early!
      // Write some more once it drains.
      writer.once("drain", write);
    }
  }
}
```

### The modern approach

Javascript today has a more modern approach by using async iterators and generators.
Instead of copying the example I will just
[link](https://nodejs.org/api/stream.html#streampipelinesource-transforms-destination-options)
the relevant docs instead

### When to not use streams

So streams are cool and I want to use them everywhere!
Firstly, nice of you to say so, secondly don't.
Streams are difficult to manage and are very prone to error and anti-pattern
implementation and usage.
Use streams as with everything else, only when you really need to.
