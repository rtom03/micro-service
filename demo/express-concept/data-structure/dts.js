import redis from "redis";
const client = redis.createClient({
  host: "loaclhost",
  port: 6379,
});

client.on("error", (error) => console.log("Redis client error:", error));

async function redisDataStructure() {
  try {
    await client.connect();
    // console.log("Connection to redis established");
    await client.set("user:name", "Tom");
    const extractData = client.get("user:name");
    console.log(extractData);
  } catch (err) {
    console.log(err);
  } finally {
    await client.quit();
  }
}

// redisDataStructure();
//pub/sub

// -> publisher -> channel -> subscriber will consume the message

async function testAdditionalFeature() {
  try {
    const subscriber = client.duplicate(); // create a new client
    await client.connect();
    await subscriber.connect();

    await subscriber.subscribe("my-channel", (message, channel) => {
      console.log(`Received message from ${channel}: ${message}`);
    });

    // publish message to the my-channel we created

    await client.publish("my-channel", "we're making progress with Redis!");
    await client.publish("my-channel", "Message received from publisher!");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await subscriber.unsubscribe("my-channel");
    await subscriber.quit();
    // pipelining & transactions
    // console.log("Connection to redis established");

    const multi = client.multi();
    multi.set("key-transaction1", "value1");
    multi.set("key-transaction2", "value2");
    multi.get("key-transaction1");
    multi.get("key-transaction2");

    const result = await multi.exec();
    console.log(result);

    const pipeline = client.multi();
    multi.set("pipeline1", "value1");
    multi.set("pipeline2", "value2");
    multi.get("pipeline1");
    multi.get("pipeline2");

    const resultPipeline = await multi.exec();
    console.log(resultPipeline);

    //batch data operation ->
    const pipelineOne = client.multi();

    for (let i = 0; i < 1000; i++) {
      pipeline.set(`user:${i}:action`, `Action ${i}`);
    }

    await pipeline.exec();

    const examp = client.multi();
    multi.decrBy("account:1234:balance", 100);
    multi.incrBy("account:0000:balance", 100);

    const finalresults = await multi.exec();

    console.log("perfomance test");
    console.time("without pipelining");
  } catch (error) {
    console.log(error);
  } finally {
    await client.quit();
  }
}

testAdditionalFeature();
