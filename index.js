require("dotenv").config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser")
const multer = require("multer")
const asyncHandler = require("express-async-handler")
const cors = require('cors');
const corsOptions = require("./config/corsOptions")
const PORT = process.env.PORT  || 3000;

// DATABASE CONNECTION
mongoose
  .connect("mongodb://127.0.0.1/Blogify")
  .then(() => console.log("Database connected successfully!"))
  .catch((error) => console.log("Could not connect to the database : ", error));

const storage = multer.storage({
  destination: (req, file, cb) => {
    cb(null, "Images")
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name)
  }
})  

const upload = multer({storage: storage})
app.post("/upload", upload.single("file"), asyncHandler(async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).send({message: "No file provided!"})
  res.status(200).send({message: "Post cover image uploaded successfully!"})
}))

// MIDDLEWARE FUNCTIONS
app.use(express.json());
app.use(cookieParser())
app.use(cors(corsOptions))

// API ENDPOINTS
app.use("/categories", require("./routes/categoryRoutes"))
app.use("/users", require("./routes/userRoutes"))
app.use("/posts", require("./routes/postRoutes"))
app.use("/auth", require("./routes/authRoutes"))


app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`));
