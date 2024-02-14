const mongoose = require("mongoose");
const Joi = require("joi");

const CommentSchema = new mongoose.Schema(
  {
    content: { type: String, require: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      require: true,
    },
    likes: { type: Number, default: 0 },
    likedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

const validateComment = (comment) => {
  const schema = Joi.object({
    content: Joi.string().required(),
    userId: Joi.string().required(),
    postId: Joi.string().required(),
  });
  return schema.validate(comment);
};

module.exports = {
  Comment,
  validateComment,
};
