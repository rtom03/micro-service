import Post from "../models/Post.js";
import { publishEvent } from "../utils/rabbitmq.js";
import logger from "./../utils/logger.js";

async function invalidatePostCache(req, input) {
  const cachedKey = `posts:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

const createPost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
    const newPost = await Post.create({
      user: req.user.userId,
      content: content,
      mediaIds: mediaIds || "",
    });

    await newPost.save();
    await invalidatePostCache(req, newPost._id.toString());

    await publishEvent("post.created", {
      postId: newPost._id.toString(),
      userId: newPost.user.toString(),
      content: newPost.content,
      createdAt: newPost.createdAt,
    });

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

    const totalNoOfPosts = await Post.countDocuments();

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
    const postId = req.params.id;
    const cacheKey = `post${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      return res.json(JSON.stringify(cachedPost));
    }

    const postById = await Post.findById(postId);
    if (!postById) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    await req.redisClient.setex(cachedPost, 300, JSON.stringify(postById));

    return res.json(postById);
  } catch (e) {
    logger.error("Error creating post", error);
    res.status(500).json({ success: false, message: "Error fetching posts" });
  }
};

const iDeletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const cachedKey = `posts:${postId}`;
    const cachedPost = await req.redisClient.get(cachedKey);

    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const posts = (await Post.find({})).filter(
      (ps) => ps._id !== deletedPost._id
    );

    console.log("Filtered Posts:", posts);
    await req.redisClient.setex(cachedPost, 300, JSON.stringify(posts));
    await invalidatePostCache(req, deletedPost._id.toString());

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: posts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error deleting post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    //publish post delete method -->
    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });

    await invalidatePostCache(req, req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

export { createPost, getPost, getPosts, deletePost };
