const mongoose = require("mongoose");
const Joi = require("joi")

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, lowercase: true, unique: true, require: true },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema)

// JOI VALIDATION
const validateCategory = (category) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required()
  })
  return schema.validate(category)
}

module.exports = {
  Category,
  validateCategory
}


