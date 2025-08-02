//readable -> use for read
//writeable -> write to a file
//duplex -> can be used for both read and write (TCP)
//transform -> zlib streams

const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto");
const { Transform } = require("stream");

class EncryptStream extends Transform {
  constructor(key, vector) {
    super();
    this.key = key;
    this.vector = vector;
  }

  _transform(chunk, encoding, callback) {
    const cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.vector);
    const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
    this.push(encrypted);
    callback();
  }
}

const key = crypto.randomBytes(32);
const vector = crypto.randomBytes(16);

const readableStream = fs.createReadStream("input.txt");

const gzipStream = zlib.createGzip();

const encryptStreaam = new EncryptStream(key, vector);

const writableStream = fs.createWriteStream("output.txt.gz.enc");

//read

readableStream.pipe(gzipStream).pipe(encryptStreaam).pipe(writableStream);

console.log("Streaming -> compressing -> writing data");
