import { Media } from "../models/Media.js";
import { ideleteMedia } from "../utils/cloudinary.js";

export const handlePostDeleted = async (event) => {
  console.log(event, "eventeventevent");
  const { postId, mediaIds } = event;
  try {
    const deleteMedia = await Media.find({ _id: { $in: mediaIds } });

    for (const media of deleteMedia) {
      await ideleteMedia(media.publicId);
      await Media.findByIdAndDelete(media._id);

      console.log(
        `Deleted media ${media._id} associated with this deleted post ${postId}`
      );
    }

    console.log(`Processed deletion of media for post id: ${postId}`);
  } catch (error) {
    console.log(error);
  }
};
