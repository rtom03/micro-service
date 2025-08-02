import Post from "../models/Post.js";
import logger from "./../utils/logger.js";

const createPost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
    const newPost = await Post.create({
      user: req.user.userId,
      content: content,
      mediaIds: mediaIds || "",
    });

    await newPost.save();
    res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (e) {
    logger.error("Error creating post", e);
    res.status(500).json({ success: false, message: "Error creating post" });
  }
};

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Post.countDocuments();

    const result = {
      posts,
      currentPage: page,
      totalPage: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    };

    //save your post in redis client
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    res.json(result);
  } catch (e) {
    logger.error("Error creating post", error);
    res.status(500).json({ success: false, message: "Error getting post" });
  }
};

const getPost = async (req, res) => {
  try {
  } catch (e) {
    logger.error("Error creating post", error);
    res.status(500).json({ success: false, message: "Error fetching posts" });
  }
};

const deletePost = async (req, res) => {
  try {
  } catch (e) {
    logger.error("Error creating post", error);
    res.status(500).json({ success: false, message: "Error deleting post" });
  }
};

export { createPost, getPost, getPosts, deletePost };
