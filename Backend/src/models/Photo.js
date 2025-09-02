const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },   
  date: { type: Date, default: Date.now },    
  location: {                                   
    latitude: Number,
    longitude: Number
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Photo", photoSchema);
