import { promisify } from "node:util";

/**********************************************************************************/

const sleep = promisify(setTimeout);

let startTime = performance.now();
let promises = [];
let i = 0;

/**********************************************************************************/

startTime = performance.now();
for (i = 0; i < 5; ++i) {
  await sleep(500);
}
console.log(
  `Awaited for loop execution time: ${performance.now() - startTime}ms`
);

/**********************************************************************************/

startTime = performance.now();
promises = [];
for (i = 0; i < 5; ++i) {
  promises.push(sleep(500));
}
for (i = 0; i < 5; ++i) {
  await promises.pop();
}
console.log(`2 For loops with promises: ${performance.now() - startTime}ms`);

/**********************************************************************************/

startTime = performance.now();
promises = [];
for (i = 0; i < 5; ++i) {
  promises.push(await sleep(500));
}
await Promise.all(promises);
console.log(
  `Awaited for loop values execution time: ${performance.now() - startTime}ms`
);

/**********************************************************************************/

startTime = performance.now();
promises = [];
for (i = 0; i < 5; ++i) {
  promises.push(sleep(500));
}
await Promise.all(promises);
console.log(
  `Non-awaited for loop execution time: ${performance.now() - startTime}ms`
);

/**********************************************************************************/

startTime = performance.now();
await Promise.all(
  [1, 2, 3, 4, 5].map(async () => {
    return sleep(500);
  })
);
console.log(
  `Map without await execution time: ${performance.now() - startTime}ms`
);

/**********************************************************************************/

startTime = performance.now();
await Promise.all(
  [1, 2, 3, 4, 5].map(async () => {
    return await sleep(500);
  })
);
console.log(
  `Map with await execution time: ${performance.now() - startTime}ms`
);

/**********************************************************************************/

startTime = performance.now();
await Promise.all(
  [1, 2, 3, 4, 5].map(async (val) => {
    return await sleep(300);
  }, await sleep(500))
);
console.log(`Map different sleep time: ${performance.now() - startTime}ms`);

/**********************************************************************************/

startTime = performance.now();
await Promise.all(
  [1, 2, 3, 4, 5].map(async (val) => {
    await sleep(500);
    return console.log(val);
  })
);
console.log(
  `Map with await assignment execution time: ${performance.now() - startTime}ms`
);

/**********************************************************************************/

startTime = performance.now();
await Promise.all(
  [1, 2, 3, 4, 5].map(async (val1) => {
    await Promise.all(
      [1, 2, 3].map(async (val2) => {
        await sleep(300);
        console.log(val1, val2);
      }),
      sleep(500)
    );
    console.log(val1);
  })
);
console.log(
  `Nested map with different sleep times opn1: ${
    performance.now() - startTime
  }ms`
);

/**********************************************************************************/

startTime = performance.now();
await Promise.all(
  [1, 2, 3, 4, 5].map(async (val1) => {
    await Promise.all(
      [1, 2, 3].map(async (val2) => {
        await sleep(300);
        console.log(val1, val2);
      })
    );
    await sleep(500);
    console.log(val1);
  })
);
console.log(
  `Nested map with different sleep times opn2: ${
    performance.now() - startTime
  }ms`
);
