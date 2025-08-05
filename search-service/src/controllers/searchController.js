import { Search } from "../models/Search.js";

const searcPostController = async (req, res) => {
  try {
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

    return res.json(results);
  } catch (error) {
    console.log(error);
  }
};

export { searcPostController };
