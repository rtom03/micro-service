const fs = require("fs");
const crypto = require("crypto");

console.log("0. script start");

setTimeout(() => {
  console.log("1. settimeout 0s callback (macrotask)");
}, 0);

setImmediate(() => {
  console.log("2. settimeout 0s callback (check)");
}, 0);

Promise.resolve().then(() => {
  console.log("3. settimeout 0s callback (microtask)");
}, 0);

process.nextTick(() => {
  console.log("4 process.nextTick callback (microtask)");
});

fs.readFile(__filename, () => {
  console.log("5. file read operation (I/O callback) ");
});

crypto.pbkdf2("secret", "salt", 10000, 64, "sha512", (err, key) => {
  if (err) throw error;
  console.log("6. pbkdf2 operation completed (CPU intensive task)");
});

console.log("7. script ends");
