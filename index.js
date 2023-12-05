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


app.listen(() => console.log(`Server is listening on port ${PORT}!`));
