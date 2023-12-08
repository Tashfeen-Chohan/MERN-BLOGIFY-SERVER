const { Post, validatePost } = require("../models/Post");
const asyncHandler = require("express-async-handler");

// GET ALL POSTS REQUEST
const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    // POPULATING AUTHOR FIELD WITH USERNAME
    .populate("author", "username -_id")
    .populate("categories", "name -_id");
  if (!posts?.length)
    return res.status(400).send({ message: "No post found!" });
  res.status(200).send(posts);
});

// GET SINGLE POST REQUEST

// POST REQUEST
const createPost = asyncHandler(async (req, res) => {
  const { title, author } = req.body;

  const { error } = validatePost(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  let post = await Post.findOne({ title, author });
  if (post)
    return res
      .status(400)
      .send({ message: "Post with same Author already exists!" });

  post = new Post(req.body);
  await post.save();
  res.status(200).send({ message: "Post created successfully!" });
});

// PATCH REQUEST

// DELETE REQUEST

module.exports = {
  createPost,
  getAllPosts,
};
