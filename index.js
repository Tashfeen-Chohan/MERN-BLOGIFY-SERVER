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

// MIDDLEWARE FUNCTIONS
app.use(express.json());
app.use(cors(corsOptions))
app.use(cookieParser())

// API ENDPOINTS
app.use("/auth", require("./routes/authRoutes"))
app.use("/users", require("./routes/userRoutes"))
app.use("/categories", require("./routes/categoryRoutes"))
app.use("/posts", require("./routes/postRoutes"))
app.use("/comments", require("./routes/commentRoutes"))

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`));
