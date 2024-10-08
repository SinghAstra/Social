import mongoose from "mongoose";
import Like from "../models/Like.js";
import Notification from "../models/Notification.js";
import Post from "../models/Post.js";

export const toggleLikeOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Ensure postId is valid
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if a like exists for this user and post
    const existingLike = await Like.findOne({ postId, userId });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      // If like exists, remove it

      // Remove the like reference from the post
      post.likes = post.likes.filter((like) => {
        return like.toString() !== existingLike._id.toString();
      });

      await post.save();

      return res.json({ message: "Like removed", likes: post.likes.length });
    } else {
      // If no like exists, create a new like
      const newLike = new Like({ postId, userId });
      newLike.save();

      // Add the like reference to the post
      post.likes.push(newLike._id);
      await post.save();

      // Create a notification only if the post owner is not the one liking the post
      if (post.userId.toString() !== userId.toString()) {
        const notification = new Notification({
          type: "like",
          recipient: post.userId,
          sender: userId,
          postId: post._id,
        });
        await notification.save();
      }

      return res.json({ message: "Post liked", likes: post.likes.length });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error --toggleLikeOnPost" });
  }
};
