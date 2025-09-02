const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");

//ajouter une photo
router.post("/", async (req, res) => {
  try {
    const newPhoto = new Photo(req.body);
    const saved = await newPhoto.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//recuperer toutes les photos
router.get("/", async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
