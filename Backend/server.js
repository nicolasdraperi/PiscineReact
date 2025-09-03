const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("mongoDB connecté"))
  .catch(err => console.error("erreur MongoDB:", err));

// Routes simples
app.get("/", (req, res) => {
  res.send("API Journal de Voyage");
});

// Import routes
const photoRoutes = require("./src/routes/photoRoutes");
const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");

app.use("/api/photos", photoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static("uploads"));

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
