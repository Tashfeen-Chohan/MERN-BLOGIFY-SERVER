const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, require: true },
    slug: { type: String, unique: true, require: true },
    noOfPosts: {type: Number, default: 0}
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

// JOI VALIDATION
const validateCategory = (category) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).required(),
  });
  return schema.validate(category);
};


module.exports = {
  Category,
  validateCategory,
};
