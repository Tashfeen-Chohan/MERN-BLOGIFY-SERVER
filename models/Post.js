const mongoose = require("mongoose");
const Joi = require("joi");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, require: true },
    content: { type: String, require: true },
    blogImg: {type: String},
    popular: {type: Boolean, default: false},
    likes: {type: Number, default: 0},
    likedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    views: {type: Number, default: 0},
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", require: true },
    ],
  },
  { timestamps: true }
);

postSchema.index({ title: 1, author: 1 }, { unique: true });

const Post = mongoose.model("Post", postSchema);

const validatePost = (post) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    content: Joi.string().min(10).required(),
    author: Joi.string().required(),
    categories: Joi.array().items(Joi.string().required()),
    blogImg: Joi.string()
  });
  return schema.validate(post);
};

module.exports = {
  Post,
  validatePost,
};
