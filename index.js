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
const bcrypt = require("bcrypt");


// DATABASE CONNECTION
const DATABASE = process.env.MONGODB_URL
mongoose
  .connect(DATABASE)
  .then(() => console.log("Database connected successfully!"))
  .catch((error) => console.log("Could not connect to the database : ", error));

const storage = multer.diskStorage({
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
app.use(cors(corsOptions))
// app.use(cors({
//   origin: ["http://localhost:5173"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }))
app.use(cookieParser())

// API ENDPOINTS
app.use("/categories", require("./routes/categoryRoutes"))
app.use("/users", require("./routes/userRoutes"))
app.use("/posts", require("./routes/postRoutes"))
app.use("/auth", require("./routes/authRoutes"))

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`));


// chohantashfeen
// MOYnZWYjUgKrc8H0
// mongodb+srv://chohantashfeen:<password>@cluster0.pnt4r8g.mongodb.net/?retryWrites=true&w=majority