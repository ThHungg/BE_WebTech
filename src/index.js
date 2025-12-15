const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const routes = require("./routes/index");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    withCredentials: true,
  })
);
routes(app);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
