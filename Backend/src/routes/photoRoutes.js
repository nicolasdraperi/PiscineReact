const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage });


router.post("/", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé" });

    const newPhoto = new Photo({
      imageUrl: `/uploads/${req.file.filename}`, 
      location: req.body.location ? JSON.parse(req.body.location) : null,
      date: req.body.date ? new Date(req.body.date) : new Date(),
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
