## Javascript concurrent behavior with a focus on Promise.all/allSettled()

### Last update: 13.01.2024

### 10-15 minutes read

---

**TL;DR:**
The usage of Promise.all() and Promise.allSettled() is highly encouraged to improve
the performance of your application and your knowledge of concurrent programming.
Always challenge yourself and have full understanding of your choices and what
you're doing.

---

I will prefix this by saying that I think this is one of the harder to grasp
concepts in Javascript, but one of the extremely satisfying and fun to implement
once you understand how it works.  
In addition it took me a long time to write this, so I would really appreciate any
feedback you have. (especially specific one instead of just just saying it's awful/great)

### Have you heard about our lord and savior, Promise.all/allSettled()?

You may ask yourself, why do you even need these complicated functions? I will just
use `await` X number of times and call it a day. Well you can, but should you?
that's another question.

Javascript is known by now to not support multi-threaded out of the box
(although it does with `WebWorkers` on the browser and `Workers API` in NodeJS,
but we will disregard it for the purpose of this guide, to simplify things),
but that does not mean you can't make efficient code and utilize the asynchronous
nature of the language. Let me explain:  
Let's say, as an example, that we have 3 services, our application, a database
and our CDN. Let's assume we want to upload a file from our application to the CDN
and save an entry for it in the database.  
One simple approach is to do one followed by the other, e.g:

```typescript
const dbOperation = await db.insert(...);
const CDNOperation = await cdn.upload(...);
```

That will work, but will it work well and utilize the tools that are available to us?
Probably not, as an example, if these operations are not dependent on each other
why not utilize the nature of Javascript and the event loop to run things concurrently?  
Let's assume the CDN upload takes 300ms and the database upload takes 200ms.  
Why then should we wait 500ms when we can possibly wait 300ms instead?

That's where [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
comes to the rescue!  
We can use Promise.all() to wait for the resolution of all given promises **or**
fail-fast on the first reject.  
This way the requests will be sent immediately and we can await for both of their
resolution, to either resolved or reject.  
For example:

```typescript
const dbOperation = db.insert(...); // Database request is sent
const CDNOperation = cdn.upload(...); // CDN request is sent

// We are waiting for the resolution of both promises
await Promise.all([dbOperation, CDNOperation]);
```

Both requests are dispatched immediately, and we will continue after 300ms instead
of 500ms (or earlier on failure). Not bad for an additional line of code.

As a personal note, even if your application works well, and performance is not
an issue I still highly recommend trying this whenever possible if nothing else
than for improving your technical knowledge and trying to challenge yourself.

---

### Thats it?

Not necessarily, I will now explain more interesting details that needs to be
taken into account when using Promise.all/allSettled().  
For people that had enough you are welcome to stop here, and thank you very much
for your time.

There are cases where the usage is not as trivial as it seems. If you take the
previous example, you may ask yourself a couple of questions, such as:

- You said that the promise may reject, what will happen then?
- What if both async operations are to the same service?

These are very good questions, so lets tackle them.

---

### The possibility of failure

In the previous example we had one write operation to our database and one
to our CDN. Let's check the possibility of failure/s.  
Assuming that the operations are inside a transaction (as they should) if the CDN
write fails, and the database one succeeded, the transaction will revert the
database update and all is well. (Or is it? we will discuss it later, for now
let's say it does)

What about other way around?  
I'll start by saying that you may think to yourself that the database write will
be much faster than the CDN write (and you are probably right) and therefore we
don't have to handle the second failure attempt, however we we are responsible
programmers and therefore it is not an option.

If the CDN upload is successful and the database write failed what happens?
In this case the transaction will not help us at all since the transaction is
used for our database, not our CDN. So what do we do? On paper we need to revert
the CDN upload, however now you will encounter an issue, how do I even know, if,
and what operation succeeded/failed?

Promise.all() is defined as **fail-fast**. This means that as soon as the first
rejection happens, the code will continue executing. This is exactly what we
don't want. We want to know what failed in order to know how and if to revert
any operation. This seems like the appropriate time to present [Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)  
This function returned value is an array of objects (in the same order as the order
promises you sent to the function) describing the resolution of the promises.  
This will allow you to handle any rejections in the correct way, per your specific
case.

For the observant of you, you may ask, well what happens if the revert of the CDN
upload failed?  
Thinking about this possibility will make us enter a non-ending rabbit-hole that
I won't get into here. Let's (for simplicity/sanity sake) assume it worked.

I want to present another issue. We already said Promise.all() has a fail-fast
functionality, meaning that on the first rejection the code will continue to execute.  
Can you spot the major issue that may arise from that behavior? Think for a moment.  
Give it another moment.

Let's go over the first case again, the case where the CDN upload fails and the
database upload succeeded.  
Let's assume that the database insertion takes 200ms. What happens if the CDN
operation fails after 50ms? What will actually happen? Think about it.
The Promise.all() function would return with a rejected promise after 50ms.
This will initialize a revert for the database transaction. Now what will
actually happen? we are 50ms into the operation, we still have 150ms to complete
the database insertion, **but** the code continues executing! The second promise
**will not stop or cancel**, how can it? It was already sent to the database service.  
Now do you have any idea what will happen? Will the transaction occur before or
after the actual insertion?  
On the one hand you may say it's fine because the database probably has a write lock
that prevents issues like this from happening.  
On the other hand who says that there is not another async operation which takes
the attention of the event loop currently? Or can we even assume that there is a
write lock, we should not assume or depend on it

I encourage you to read and analyze this flow a few times, it is not easy
to understand.  
In addition this may also be considered as a relatively simple example since
there are only two promises executing concurrently. What about 3? 5? 10? 50? 100?

As you can see there is a careful balance to preserve when using Promise.all().
Don't let that deter you from thinking and handling these options!  
Don't take this as an excuse to just `await` every operation, because where is
the fun in that? This is a challenging prospect but extremely satisfying to pull
off (not talking about your improvement as a software developer)

Up to now we talked about write operations. What about read operations you may ask,
well, read operations are usually much simpler (thankfully). Read operations should
not mutate any data, and therefore there should never be a major issue of using
Promise.all() and worrying about a partial success.

A few guiding rules to help you along:

- On partial (some read, some write) or full write operations, you should mostly
  use Promise.allSettled() and handle the revert operation as they are needed.
  This has 2 main advantages, the first one is that you know exactly what succeeded
  and what didn't. The second one being the all of the promises are assured to be
  either resolved or rejected once the code continue executing.
- On read operations you should (mostly) be able to use Promise.all() without
  worrying too much about the effect of failure of one or more promises.

With these points said, **every case has its own considerations**.

As a real life example I will give you a case that I encountered during the
development of a project.  
Let's say I need to update a contact details on two different services
(these two updates are not related). What would you choose in the following case:  
One services succeeded in updating and the other failed.  
should you leave it as a partial update and notify the client of it?
Should you revert the successful update even though the updates are not related?

This is a design choices and both options are valid.
(We chose partial update if it is of any interest to you)

---

### The same service discussion

Let's tackle the second question: "What if both async operations are to the
same service?"  
This is interesting question. One may say that, well, if both requests are to the
same service, why bother? Anyhow they will be executed sequentially.  
Will they though?  
Who said the other service/s also single threaded?  
Who said we don't send the requested to a super optimized and well designed
Golang/C#/Java/Python/Rust/CPP/Whatever server which supports multithreading?  
Even between NodeJS services, if you take as an example two microservices which
"talk" with each other using an API, it is true that they are single threaded
and will handle the requests sequentially, but who said it will remain this way?  
Who said that the implementation will not change one day to multithreading,
which will benefit greatly from doing work in parallel?

Take that into consideration when you discuss the validity of implementing requests
concurrently

---

### "Premature optimization is the root of all evil"

The famous quote by the even more famous Professor Donald Knuth. We've all heard
it by now, but have you ever taken the time to read the entire context, not only
that single sentence?  
If you never did, let me present it to you:
("Structured programming with go to Statements", 1974 by Donald Knuth)  
"...We should forget about small efficiencies, say about 97% of the time:
**premature optimization is the root of all evil**. Yet we should not pass up our
opportunities in that critical 3%. A good programmer will not be lulled into
complacency by such reasoning, he will be wise to look carefully at the critical
code; but only after that code has been identified."

With the knowledge you've learned this far, I believe you can understand that
optimizing the network calls by making them concurrent whenever possible are
exactly the 3% referred to by this quote.

---

### Bonus

As a bonus for finish reading I will give you a quick quiz. What will happen here?
What be printed and which errors will be caught and logged?

As an advanced question, why did I wrap the promises resolution in an http server?
What would have happened happen if I didn't?

I encourage you to try to solve it without running it first and see if you got it
right. After that you should take the example folder, run and play it on your
local machine.

```typescript
import { writeFile } from "node:fs";
import { createServer } from "node:http";

const tmp1 = async () => {
  writeFile("tmp1.txt", "tmp1", () => {});
};

const tmp2 = async () => {
  writeFile("tmp2.txt", "tmp2", () => {});
};

const tmp3 = async () => {
  writeFile("tmp3.txt", "tmp3", () => {});
};

const tmp4 = async () => {
  writeFile("tmp4.txt", "tmp4", () => {});
};

const tmp5 = async () => {
  writeFile("tmp5.txt", "tmp5", () => {});
};

const tmp6 = async () => {
  writeFile("tmp6.txt", "tmp6", () => {});
};

const tmp7 = async () => {
  writeFile("tmp7.txt", "tmp7", () => {});
};

const tmp8 = async () => {
  writeFile("tmp8.txt", "tmp8", () => {});
};

const tmp9 = async () => {
  writeFile("tmp9.txt", "tmp9", () => {});
};

const tmp10 = async () => {
  writeFile("tmp10.txt", "tmp10", () => {});
};

const error = Promise.reject(new Error("Error"));

createServer().listen(34781, async () => {
  try {
    await Promise.all([tmp1(), tmp2()]);
  } catch (err) {
    console.log(err);
  }
  try {
    await Promise.all([error, tmp3(), tmp4()]);
  } catch (err) {
    console.log(err);
  }
  try {
    await Promise.all([tmp5(), error, tmp6()]);
  } catch (err) {
    console.log(err);
  }
  try {
    await Promise.allSettled([tmp7(), tmp8()]);
  } catch (err) {
    console.log(err);
  }
  try {
    await Promise.allSettled([error, tmp9(), tmp10()]);
  } catch (err) {
    console.log(err);
  }
});
```

Thank you for your time and have a great day!
