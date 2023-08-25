const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res, next) => {
  const email = req.query.email;

  try {
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      res.status(200).json({ existingUser });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res, next) => {
  const { email, displayName, photoURL } = req.body.user;

  try {
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      return res.status(409).json({ message: "User already registered" });
    } else {
      const newUser = await User.create({ email, username: displayName, photoURL });

      res.status(201).json({ newUser });
    }
  } catch (error) {
    console.error("Error creating user", error);
    res.status(500).json({ success: false, message: "User registration failed" });
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId/friends", async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate("friends");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ friends: user.friends });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
})

router.post("/:userId/friends", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { friendId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ error: "User is already a friend" });
    }

    user.friends.push(friendId);

    await user.save();

    return res.status(200).json({ message: "Friend added successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId/friend-requests", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
      .populate({
        path: "friendRequestsSent.toUser friendRequestsReceived.fromUser",
        model: "User",
      })
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sentFriendRequests = user.friendRequestsSent;
    const receivedFriendRequests = user.friendRequestsReceived;

    res.status(200).json({ sentFriendRequests, receivedFriendRequests });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:userId/friend-requests", async (req, res, next) => {
  const userId = req.params.userId;
  const friendId = req.query.friendId;

  try {
    const result = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          friendRequestsSent: { toUser: friendId },
          friendRequestsReceived: { fromUser: friendId },
        }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    await result.save();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
