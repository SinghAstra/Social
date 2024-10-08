import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const searchQuery = {
      $or: [
        { userName: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ],
    };

    const totalUsers = await User.countDocuments(searchQuery);

    const paginatedUsers = await User.find(searchQuery)
      .select("-password -dateOfBirth")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      users: paginatedUsers,
      totalUsers,
      currentPage: Number(page),
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message, controller: getAllUsers });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;

    // Find the user by username
    const user = await User.findOne({ userName: username }).select(
      "-password -dateOfBirth"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postCount = await Post.countDocuments({ userId: user._id });
    const isFollowing = user.followers.includes(currentUserId);

    res.status(200).json({
      ...user.toObject(),
      postCount,
      isFollowing,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, controller: getUserProfile });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    let { page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers and handle invalid values
    page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    limit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;

    const user = await User.findOne({ userName: username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalPosts = await Post.countDocuments({ userId: user._id });

    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const userToFollowOrUnFollow = await User.findOne({ userName: username });

    if (!userToFollowOrUnFollow) {
      return res.status(404).json({ message: "User not found." });
    }

    if (userToFollowOrUnFollow._id.toString() === currentUser._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot follow or unFollow yourself." });
    }

    // Check if the user is already following the target user
    const isFollowing = currentUser.following.includes(
      userToFollowOrUnFollow._id
    );

    if (isFollowing) {
      // UnFollow the user
      currentUser.following.pull(userToFollowOrUnFollow._id);
      userToFollowOrUnFollow.followers.pull(currentUserId);
    } else {
      // Follow the user
      currentUser.following.push(userToFollowOrUnFollow._id);
      userToFollowOrUnFollow.followers.push(currentUserId);

      const existingNotification = await Notification.findOne({
        type: "follow",
        recipient: userToFollowOrUnFollow._id,
        sender: currentUserId,
      });

      if (!existingNotification) {
        // Create a notification for the follow action
        const newNotification = new Notification({
          type: "follow",
          recipient: userToFollowOrUnFollow._id, // The user being followed
          sender: currentUserId, // The user who is following
          isRead: false, // Mark as unread by default
        });

        await newNotification.save();
      }
    }

    await currentUser.save();
    await userToFollowOrUnFollow.save();

    res.status(200).json({
      updatedFollowing: currentUser.following,
      message: isFollowing
        ? "UnFollowed successfully."
        : "Followed successfully.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error --toggleFollow." });
  }
};

export const getFollowers = async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 10, search = "" } = req.query;

  const searchQuery = {
    $or: [
      { userName: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
    ],
  };

  try {
    const user = await User.findOne({ userName: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the total count of followers based on the search query
    const totalFollowers = await User.countDocuments({
      _id: { $in: user.followers },
      ...searchQuery,
    });

    // Apply pagination and search to get followers for the current page
    const paginatedFollowers = await User.find({
      _id: { $in: user.followers },
      ...searchQuery,
    })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      followers: paginatedFollowers,
      totalFollowers,
      currentPage: page,
      totalPages: Math.ceil(totalFollowers / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error - getFollowers" });
  }
};

export const getFollowing = async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 10, search = "" } = req.query;

  const searchQuery = {
    $or: [
      { userName: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
    ],
  };

  try {
    const user = await User.findOne({ userName: username }).populate({
      path: "following",
      select: "-password",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch total count of following users based on the search query
    const totalFollowing = await User.countDocuments({
      _id: { $in: user.following },
      ...searchQuery,
    });

    // Apply pagination and search to get following users for the current page
    const paginatedFollowing = await User.find({
      _id: { $in: user.following },
      ...searchQuery,
    })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      following: paginatedFollowing,
      totalFollowing,
      currentPage: page,
      totalPages: Math.ceil(totalFollowing / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message, controller: getFollowing });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -dateOfBirth");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message, controller: getAllUsers });
  }
};

export const getRandomUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUserId },
          _id: { $nin: currentUser.following },
        },
      },
      { $sample: { size: 6 } },
    ]);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFilteredUsers = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const searchQuery = {
    $or: [
      { userName: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
    ],
  };

  const totalUsers = await User.countDocuments(searchQuery);

  const paginatedUsers = await User.find(searchQuery)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    users: paginatedUsers,
    totalUsers,
    currentPage: page,
    totalPages: Math.ceil(totalUsers / limit),
  });
};
