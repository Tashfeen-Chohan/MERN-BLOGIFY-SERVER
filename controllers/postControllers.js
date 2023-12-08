const { Post, validatePost } = require("../models/Post")
const asyncHandler = require("express-async-handler")


// GET ALL POSTS REQUEST

// GET SINGLE POST REQUEST

// POST REQUEST
const createPost = asyncHandler(async (req, res) => {
  const { error } = validatePost(req.body)
  if (error) return res.status(400).send({message: error.details[0].message})

  let post = new Post()
  await post.save()
  res.status(200).send({message: "Post created successfully!"})
})

// PATCH REQUEST

// DELETE REQUEST

module.exports = {
  createPost
}
