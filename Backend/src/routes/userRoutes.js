const express = require("express");
const router = express.Router();
const User = require("../models/User");

//creer un utilisateur
router.post("/", async (req, res) => {
  try {
    const newUser = new User(req.body);
    const saved = await newUser.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//recuperer tous les utilisateurs
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
