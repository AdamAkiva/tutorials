import { promisify } from "node:util";

/**********************************************************************************/

const sleep = promisify(setTimeout);

let startTime = performance.now();
let promises = [];

/**********************************************************************************/

startTime = performance.now();
for (let i = 0; i < 5; ++i) {
  await sleep(500);
}
console.log(
  `Awaited for loop execution time: ${performance.now() - startTime}ms`
);

/**********************************************************************************/

startTime = performance.now();
promises = [];
for (let i = 0; i < 5; ++i) {
  promises.push(await sleep(500));
}
await Promise.all(promises);
console.log(
  `Awaited for loop values execution time: ${performance.now() - startTime}ms`
);

/**********************************************************************************/

startTime = performance.now();
promises = [];
for (let i = 0; i < 5; ++i) {
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
await Promise.all(promises);
console.log(
  `Map with await execution time: ${performance.now() - startTime}ms`
);

/**********************************************************************************/

startTime = performance.now();
await Promise.all(
  [1, 2, 3, 4, 5].map(async (val) => {
    await sleep(500);
    return console.log(val);
  })
);
await Promise.all(promises);
console.log(
  `Map with await execution time: ${performance.now() - startTime}ms`
);
