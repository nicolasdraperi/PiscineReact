const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/", authMiddleware, async (req, res) => {
  try {
    const newPhoto = new Photo({
      ...req.body,
      userId: req.user.id
    });
    const saved = await newPhoto.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const photos = await Photo.find({ userId: req.user.id });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
