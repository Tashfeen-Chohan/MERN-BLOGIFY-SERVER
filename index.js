const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT  || 3000;

// DATABASE CONNECTION
mongoose
  .connect("mongodb://127.0.0.1/Blogify")
  .then(() => console.log("Database connected successfully!"))
  .catch((error) => console.log("Could not connect to the database : ", error));

// MIDDLEWARE FUNCTIONS
app.use(express.json());

// API ENDPOINTS
app.use("/categories", require("./routes/categoryRoutes"))
app.use("/users", require("./routes/userRoutes"))
app.use("/posts", require("./routes/postRoutes"))


app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`));
