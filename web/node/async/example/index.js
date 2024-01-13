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
