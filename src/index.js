const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
