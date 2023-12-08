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
const getSinglePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id)
    .populate("author", "username -_id")
    .populate("categories", "name -_id");
  if (!post) return res.status(400).send({ message: "No post found!" });
  res.status(200).send(post);
});

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

// UPDATE REQUEST
const updatePost = asyncHandler(async (req, res) => {
  const {id} = req.params
  const {title, author} = req.body

  const {error} = validatePost(req.body)
  if (error) return res.status(400).send({message: error.details[0].message})

  let post = await Post.findOne({title, author, _id: {$ne: id}})
  if (post) return res.status(400).send({message: "Could not update! Post with same author already exists!"})

  post = await Post.findByIdAndUpdate(id, req.body, {new: true})
  if (!post) return res.status(400).send({message: "No post found!"})
  res.status(200).send({message: "Post updated successfully!"})
})


// DELETE REQUEST
const deletePost = asyncHandler(async (req, res) => {
  const {id} = req.params
  const post = await Post.findByIdAndDelete(id)
  if (!post) return res.status(400).send({message: "No post found!"}) 
  res.status(200).send({message: "Post deleted successfully!"})
})

module.exports = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost
};
