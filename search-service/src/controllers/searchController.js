import { Search } from "../models/Search.js";

const searcPostController = async (req, res) => {
  try {
    const cacheKey = `search:${req.url}`;
    const cacheSearch = await req.redisClient.get(cacheKey);
    console.log(cacheKey);

    if (cacheSearch) {
      return res.json(JSON.parse(cacheSearch));
    }
    const { query } = req.query;
    const results = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    if (!results) {
      return res
        .status(200)
        .json({ success: false, message: "Query not found" });
    }
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(results));
    // console.log(results, `cachedSearch:${cacheKey}`);

    res.json(results);
  } catch (error) {
    console.log(error);
  }
};

export { searcPostController };
