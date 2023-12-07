const mongoose = require('mongoose');
const Joi = require("joi")

const postSchema = new mongoose.model({
  title: {type: String, require: true},
  content: {type: String, require: true},
  author: {type: mongoose.Schema.Types.ObjectId, ref: "User", require: true},
  category: {type: mongoose.Schema.Types.ObjectId, ref: "Category", require: true}
})

postSchema.index({title: 1, author: 1}, {unique: true})

const Post = mongoose.model("Post", postSchema)

const validatePost = (post) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    content: Joi.string().min(10).required(),
    author: ObjectId.required(),
    category: ObjectId.required(),
  })
  return schema.validate(post)
}

module.exports = {
  Post,
  validatePost
}