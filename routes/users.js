const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/:email", async function (req, res, next) {
  const email = req.params.email;

  const existingUser = await User.findOne({ email }).exec();

  if (existingUser) {
    res.status(200).json({ existingUser });
  } else {
    res.status(404).json({ exists: false });
  }
});

router.post("/", async function (req, res, next) {
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

module.exports = router;
