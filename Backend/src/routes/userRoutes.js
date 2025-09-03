const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Photo = require("../models/Photo"); 
const authMiddleware = require("../middleware/authMiddleware");


router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    const photos = await Photo.find({ userId: req.user.id }).sort({ date: -1 });
    const lastPhoto = photos.length > 0 ? photos[0] : null;

    res.json({
      user,
      photos,
      lastPhoto
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


