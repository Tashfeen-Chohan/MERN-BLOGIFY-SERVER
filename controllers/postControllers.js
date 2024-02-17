const { Comment } = require("../models/Comment");
const { Post, validatePost } = require("../models/Post");
const asyncHandler = require("express-async-handler");

// GET ALL POSTS REQUEST
const getAllPosts = asyncHandler(async (req, res) => {
  const searchBy = req.query.searchBy || ""
  const sortBy = req.query.sortBy || ""
  const filterBy = req.query.filterBy || ""
  const authorId = req.query.authorId || ""
  const categoryId = req.query.categoryId || ""
  const limit = parseInt(req.query.limit) || 3

  let searchQuery = {title: {$regex: searchBy, $options: "i"}}
  if (filterBy){
    if (filterBy === "popular"){
      searchQuery.popular = true
    }
  }
  // ADD FILTER BY AUTHOR
  if (authorId){
    searchQuery.author = authorId
  }
  // ADD FILTER BY CATEGORY
  if (categoryId){
    searchQuery.categories = { $in: [categoryId] }
  }

  let sortQuery = {createdAt: -1}
  if (sortBy){
    if (sortBy === "title"){
      sortQuery = {title: 1}
    } else if (sortBy === "title desc"){
      sortQuery = {title: -1}
    } else if (sortBy === "oldest"){
      sortQuery = {updatedAt: 1}
    } else if (sortBy === "views"){
      sortQuery = {views: -1}
    } else if (sortBy === "likes"){
      sortQuery = {likes: -1}
    }
  }


  const totalPosts = await Post.countDocuments(searchQuery)

  let posts = await Post.find(searchQuery)
    .sort(sortQuery)
    .limit(limit)
    // POPULATING AUTHOR FIELD WITH USERNAME
    .populate("author", "_id username profile")
    .populate("categories", "name _id");

    // Populate comments count for each post
    posts = await Promise.all(
      posts.map(async (post) => {
      const commentsCount = await Comment.countDocuments({ postId: post._id });
      return { ...post.toObject(), commentsCount };
    })
);    
  
  res.status(200).send({
    posts,
    // postsWithComments,
    totalPosts,
  });
});

// GET SINGLE POST REQUEST
const getSinglePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id)
    .populate("author", "_id profile username")
    .populate("categories", "_id name");

  const commentsCount = await Comment.countDocuments({postId: post._id})
  if (!post) return res.status(400).send({ message: "No post found!" });
  res.status(200).send({
    post,
    commentsCount
  });
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
  res.status(200).send({ message: "Post created successfully!", post });
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
  const post = await Post.findById(id)
  if (!post) return res.status(400).send({message: "Post not found!"}) 

  // ONLY OWNER & ADMIN ALLOWED
  if (req.user.id !== post.author && req.user.roles.indexOf("Admin") === -1){
    return res.status(403).send({message: "You are not allowed to delete this post!"})
  }

  await Post.findByIdAndDelete(id)

  res.status(200).send({message: "Post deleted successfully!"})
})

const likePost = asyncHandler(async (req, res) => {
  const {id} = req.params
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  
  const userLikeIndex = post.likedBy.indexOf(req.user.id);
  if (userLikeIndex === -1) {
    post.likes += 1;
    post.likedBy.push(req.user.id);
    await post.save();
    res.status(200).send({ message: "You've appreciated this post! ❤️" });
  } else {
    post.likes -= 1;
    post.likedBy.splice(userLikeIndex, 1);
    await post.save();
    res.status(200).send({ message: "Like removed! Your interaction matters! 🙌" });
  }
})

const viewPost = asyncHandler(async (req, res) => {
  const {id} = req.params
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  
  post.views += 1;
  if (post.views >= 50 && !post.popular){
    post.popular = true;
  }
  await post.save();

  res.status(200).json({ message: 'Post viewed successfully' });

})

module.exports = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  likePost,
  viewPost,
};
