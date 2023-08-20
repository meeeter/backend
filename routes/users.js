const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/:email", async function (req, res, next) {
  const email = req.params.email;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(200).json({ existingUser, exists: true });
  } else {
    res.status(404).json({ exists: false });
  }
});

router.post("/", async function (req, res, next) {
  const { email, displayName, photoURL } = req.body.user;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ message: "User already registered" });
  }

  await User.create({ email, username: displayName, photoURL });
  res.status(201).json({ success: true, message: "User registered successfully" });
});

module.exports = router;
