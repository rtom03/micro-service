import { Search } from "../models/Search.js";

async function handlePostCreated(event) {
  try {
    const newSearchPost = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt,
    });

    await newSearchPost.save();
    console.log(
      `Search post created ${event.postId}, ${newSearchPost._id.toString()}`
    );
  } catch (error) {
    console.log(error);
  }
}

async function handlePostdeleted(event) {
  try {
    await Search.findOneAndDelete({ postId: event.postId });
    console.log(`Search post deleted: ${event.postId}`);
  } catch (error) {
    console.log(error);
  }
}

export { handlePostCreated, handlePostdeleted };
