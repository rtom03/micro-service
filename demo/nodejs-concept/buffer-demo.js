//object -> handle binary data
// file system operstion, cryptography, image processing

const buffOne = Buffer.alloc(10); //allocate a buffer of 10 bytes -> zeros

const buffString = Buffer.from("Hello0");

buffOne.write("node js");
console.log(buffString);
