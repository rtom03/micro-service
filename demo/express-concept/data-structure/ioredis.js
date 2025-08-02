import Redis from "ioredis";

const redis = new Redis();
//   {
//   host: "localhost",
//   port: 6379,
// }

export async function ioRedisDemo() {
  try {
    await redis.set("key", "value");
    const value = await redis.get("key");
    console.log(value);
  } catch (error) {
    console.log(error);
  }
}

ioRedisDemo();
